---
unit: p7u3
title: Waits & Synchronization
teaches: [selenium.explicit-waits, selenium.expected-conditions, selenium.fluent-wait]
requires: [selenium.webdriver-setup, selenium.locators]
---

## HOOK
question: Your test clicks a button, then immediately checks the result. But the page hasn't loaded yet. It fails. You add `Thread.sleep(5000)`. It passes! But now your suite takes 40 minutes. Is there a smarter way?
```java
driver.findElement(By.id("search-btn")).click();
// Results take 0.5-3 seconds to load depending on server
driver.findElement(By.id("results")); // NoSuchElementException!
```

## FAIL_FIRST
prompt: Fix this flaky test WITHOUT using Thread.sleep.
```java
@Test
public void testSearch() {
    driver.get("https://example.com");
    driver.findElement(By.id("search")).sendKeys("java");
    driver.findElement(By.id("search-btn")).click();
    String result = driver.findElement(By.id("results")).getText();
    assertTrue(result.contains("java"));
}
```
hint: WebDriverWait polls for the element until it appears OR a timeout expires.
expected: Use explicit wait to wait for #results to be visible

## ANALOGY
`Thread.sleep` is like setting a kitchen timer for 5 minutes every time — even if toast is done in 30 seconds. Explicit waits are like WATCHING the toaster — the moment it pops, you grab it. You set a maximum time (timeout), but react as soon as the condition is met. Faster and reliable.

## CODE
```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement results = wait.until(
    ExpectedConditions.visibilityOfElementLocated(By.id("results"))
);
String text = results.getText();
```
highlight: [1, 3]
annotation: `WebDriverWait` polls every 500ms until the condition is true OR 10 seconds pass. `visibilityOfElementLocated` waits for the element to exist AND be visible. If timeout expires, it throws `TimeoutException` — much more informative than `NoSuchElementException`. Common conditions: visibilityOfElementLocated (can user see it?), elementToBeClickable (can user click it?), presenceOfElementLocated (is it in DOM?).

## BREAK_IT
setup:
```java
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("x")));
```
modification: You have BOTH implicit and explicit waits active.
question: What's the problem with mixing implicit and explicit waits?
options: [They add up to 20 seconds, Unpredictable timing behavior, No problem, Compile error]
correct: 1
explanation: Mixing implicit and explicit waits causes UNPREDICTABLE behavior. Implicit wait affects ALL findElement calls including those inside explicit waits, leading to unexpected timeouts. Rule: use ONLY explicit waits. Set implicit wait to 0.

## CONTRAST
label: Thread.sleep vs Explicit Wait
codeA:
```java
driver.findElement(By.id("btn")).click();
Thread.sleep(5000); // ALWAYS waits 5s
driver.findElement(By.id("result")).getText();
```
codeB:
```java
driver.findElement(By.id("btn")).click();
new WebDriverWait(driver, Duration.ofSeconds(5))
    .until(ExpectedConditions.visibilityOfElementLocated(By.id("result")))
    .getText();
```
question: If the element appears in 200ms, how long does each wait?
options: [Both wait 5s, sleep=5s explicit=200ms, Both 200ms, sleep=200ms explicit=5s]
correct: 1
explanation: Thread.sleep always sleeps the full duration — like setting a kitchen timer for 5 minutes even if toast is done. `WebDriverWait` polls every 500ms and returns immediately when `visibilityOfElementLocated` is satisfied. Over 100 tests, this is the difference between minutes and hours of execution time. If timeout expires without the condition being met, it throws `TimeoutException`.

## EXPLAIN_BACK
mode: fill_blank
prompt: What causes most Selenium test flakiness and how do you fix it?
sentence: 90% of flakiness is timing — replace Thread.sleep with _____ waits, wait for the right condition like _____ before clicking dynamic buttons, and never mix implicit and explicit waits because they cause _____ timing behavior.
blanks: [explicit, elementToBeClickable, unpredictable]
distractors: [implicit, visibilityOf, faster]

## CONNECT
text: At Amazon, UI tests deal with heavy AJAX and dynamic content:
```java
WebElement addToCart = new WebDriverWait(driver, Duration.ofSeconds(15))
    .until(ExpectedConditions.elementToBeClickable(
        By.cssSelector("[data-testid='add-to-cart']")));
addToCart.click();
```
note: As an SDET-1, you'll spend time fixing flaky tests. The #1 cause is synchronization. Master explicit waits and you eliminate 90% of intermittent failures. Flaky tests erode team trust — they're treated as high-priority bugs.
