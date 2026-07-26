---
unit: p7u7
title: Screenshots & Test Logging
teaches: [selenium.screenshots, selenium.event-listeners, selenium.failure-capture]
requires: [selenium.webdriver-setup, selenium.locators, selenium.page-object-model]
---

## HOOK
question: Your test fails in CI at 3 AM. The error says "element not found." But WHICH page was the browser on? What did the screen look like? Without a screenshot, you're debugging blind.
```java
// CI log: NoSuchElementException: id="checkout-btn"
// Was the page even loaded? Was there an error popup?
// Was the user logged out? You'll never know without a screenshot.
```

## FAIL_FIRST
prompt: Capture a screenshot when a test fails. Where does the image go?
```java
@Test
public void testCheckout() {
    driver.findElement(By.id("checkout-btn")).click(); // fails!
    // Test ends. No screenshot. No evidence of what went wrong.
    // How do you automatically capture the screen state on failure?
}
```
hint: Implement a TestNG listener with `onTestFailure()` that calls TakesScreenshot.
expected: Screenshot saved to a file with the test name and timestamp

## ANALOGY
Screenshots on failure are like a security camera recording. When a crime (test failure) happens, you rewind the tape. Without it, witnesses (logs) say "something happened" but can't show you exactly what. The screenshot shows the EXACT browser state at the moment of failure — error messages, wrong pages, unexpected popups.

## CODE
```java
public void captureScreenshot(WebDriver driver, String testName) {
    File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
    File dest = new File("screenshots/" + testName + ".png");
    FileUtils.copyFile(src, dest);
}
// Call in @AfterMethod or ITestListener.onTestFailure()
```
highlight: [2, 3]
annotation: Cast WebDriver to `TakesScreenshot` interface, call `getScreenshotAs()`. Save with test name for easy identification. In CI, attach these to Allure reports. Screenshots are useless if they're named "screenshot1.png" — include the test name and timestamp.

## BREAK_IT
setup:
```java
@AfterMethod
public void teardown() {
    captureScreenshot(driver, "test");
    driver.quit();
}
```
modification: What if you capture screenshots for EVERY test, not just failures?
question: What's wrong with screenshotting every test run?
options: [Nothing wrong, Wastes disk space in CI, Screenshots are free, Slows tests significantly]
correct: 1
explanation: Screenshots add ~200ms each. For 500 tests, that's extra time plus disk usage. More importantly, 500 screenshots are useless if you can't find the relevant failure. Screenshot ONLY on failure — use `ITestListener.onTestFailure()` to conditionally capture.

## CONTRAST
label: Basic screenshot vs EventFiringWebDriver
codeA:
```java
// Manual: capture at specific points
((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
// You choose when to capture
```
codeB:
```java
// EventFiring: automatic logging of ALL actions
EventFiringDecorator<WebDriver> decorator =
    new EventFiringDecorator<>(new MyListener());
WebDriver decoratedDriver = decorator.decorate(driver);
// MyListener.beforeClick(), afterSendKeys() auto-logged
```
question: When would you use EventFiringWebDriver?
options: [Always, For debugging complex test failures, Only in production, Never]
correct: 1
explanation: `EventFiringDecorator` wraps every WebDriver action with before/after hooks — like a security camera recording every interaction. Great for detailed logging ("clicked X, sent keys Y") when investigating failures. But it adds overhead, so enable selectively. For normal CI, use `TakesScreenshot` with `getScreenshotAs()` in an `onTestFailure()` listener to capture only on failure.

## EXPLAIN_BACK
mode: fill_blank
prompt: A teammate says they'll add Thread.sleep and re-run locally to debug. What's a better approach?
sentence: Capture screenshots on failure automatically via a TestNG _____ that calls TakesScreenshot, attach them to _____ reports for CI visibility, and use EventFiringDecorator for verbose _____ when investigating intermittent issues.
blanks: [listener, Allure, logging]
distractors: [annotation, JUnit, testing]

## CONNECT
text: At Amazon, test failure evidence is critical for on-call debugging:
```java
@Override
public void onTestFailure(ITestResult result) {
    String name = result.getName() + "_" + System.currentTimeMillis();
    captureScreenshot(driver, name);
    Allure.addAttachment("Failure", new FileInputStream(screenshot));
}
```
note: As an SDET-1, your screenshots and logs are examined by on-call engineers during incidents. Clear failure evidence (screenshot + URL + action log) means a 5-minute diagnosis vs a 2-hour investigation. Build this into every framework from day one.
