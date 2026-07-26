---
unit: p7u8
title: TestNG Framework with Selenium
teaches: [selenium.testng-integration, selenium.parallel-selenium, selenium.data-driven-ui]
requires: [selenium.webdriver-setup, selenium.page-object-model, apistrategy.dataprovider, apistrategy.parallel-tests]
---

## HOOK
question: You have 500 UI tests. Each takes 3 seconds. That's 25 minutes sequentially. Your team wants test results in under 5 minutes. How do you run 500 browser tests in parallel without them stepping on each other?
```java
// 500 tests × 3 seconds = 25 minutes (sequential)
// 500 tests ÷ 10 threads × 3 seconds = 2.5 minutes (parallel!)
// But each thread needs its OWN browser instance...
```

## FAIL_FIRST
prompt: Run two tests in parallel. Both use `driver`. What goes wrong?
```java
static WebDriver driver; // shared across tests

@Test void testA() { driver.get("https://pageA.com"); /* ... */ }
@Test void testB() { driver.get("https://pageB.com"); /* ... */ }
// parallel="methods" thread-count="2" in testng.xml
```
hint: A shared static driver means both tests control the SAME browser.
expected: Tests interfere — testA navigates to pageA, then testB navigates away

## ANALOGY
Parallel Selenium tests are like a driving school with multiple students. Sequential = one car, one student at a time (slow). Parallel = multiple cars, one student per car (fast). BUT if two students share one car, they'll fight over the steering wheel. Each parallel test thread needs its OWN WebDriver instance — ThreadLocal is the "one car per student" rule.

## CODE
```java
private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

@BeforeMethod
public void setup() {
    driver.set(new ChromeDriver(new ChromeOptions()));
}
@AfterMethod
public void teardown() { driver.get().quit(); }

public static WebDriver getDriver() { return driver.get(); }
```
highlight: [1, 5]
annotation: `ThreadLocal<WebDriver>` gives each parallel thread its OWN driver instance — like one car per student in driving school. `driver.set()` in @BeforeMethod creates a fresh browser per test. `driver.get()` retrieves the current thread's browser. No sharing, no conflicts, safe parallelism. This pattern is mandatory when using `parallel="methods"` in testng.xml with thread-count greater than 1.

## BREAK_IT
setup:
```java
@Test(dataProvider = "logins")
public void testLogin(String user, String pass) {
    getDriver().get("https://app.com/login");
    loginPage.login(user, pass);
    assertTrue(loginPage.isLoggedIn());
}
```
modification: DataProvider returns 10 rows. parallel="methods" thread-count="10". All 10 hit the login page simultaneously.
question: What can go wrong?
options: [Nothing, Server rate-limiting/throttling, Tests always pass, Compile error]
correct: 1
explanation: 10 simultaneous logins can trigger rate limits, CAPTCHA, or account lockouts on the test environment. Parallel UI tests need: test accounts per thread, a test environment that handles concurrent load, and awareness of server-side limits. Parallel execution tests your INFRASTRUCTURE too.

## CONTRAST
label: @BeforeMethod vs @BeforeSuite for driver setup
codeA:
```java
@BeforeMethod // new browser PER TEST
public void setup() { driver.set(new ChromeDriver()); }
@AfterMethod
public void teardown() { driver.get().quit(); }
// Clean isolation, slower (browser startup per test)
```
codeB:
```java
@BeforeClass // one browser per CLASS (reused across methods)
public void setup() { driver.set(new ChromeDriver()); }
@AfterClass
public void teardown() { driver.get().quit(); }
// Faster, but tests share browser state (cookies, etc.)
```
question: Which is safer for parallel execution?
options: [BeforeMethod - full isolation, BeforeClass - faster, Both equal, Neither works]
correct: 0
explanation: @BeforeMethod gives complete isolation — each test gets a fresh browser via `ThreadLocal<WebDriver>` with `driver.set(new ChromeDriver())`, meaning no cookies, no state, no leftover data from other tests. @BeforeClass reuses one browser per class, so tests share state and can cause order-dependent failures. For parallel execution, full isolation prevents the race conditions that shared mutable state causes.

## EXPLAIN_BACK
mode: pick_best
prompt: How do you make Selenium tests thread-safe for parallel execution?
options: [Use ThreadLocal<WebDriver> so each thread has its own driver and create/destroy in @BeforeMethod/@AfterMethod with no static mutable state, Use a static WebDriver shared across all threads for efficiency, Synchronize all test methods with the synchronized keyword, Run tests sequentially since parallel is unreliable]
correct: 0

## CONNECT
text: At Amazon, UI regression suites run with high parallelism:
```xml
<suite parallel="methods" thread-count="20">
  <listeners>
    <listener class-name="ScreenshotListener"/>
    <listener class-name="RetryAnalyzer"/>
  </listeners>
</suite>
```
note: As an SDET-1, you'll configure parallel execution for your team's UI tests. The goal is fast CI feedback — under 10 minutes for full regression. You'll balance thread count with test environment capacity and debug thread-safety issues when tests pass locally but fail in parallel CI.
