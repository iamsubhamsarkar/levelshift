---
unit: p7u1
title: WebDriver Setup & First Test
teaches: [selenium.webdriver-setup, selenium.browser-options, selenium.first-test]
requires: [java.oop, testng.annotations]
---

## HOOK
question: You open Chrome every day — click, type, scroll. What if your Java code could DO all that automatically, 1000x faster, without you touching the mouse?
```java
// One line. Chrome opens. A page loads. No human involved.
driver.get("https://amazon.com");
```

## FAIL_FIRST
prompt: Run this code. What's missing?
```java
public class FirstTest {
    public static void main(String[] args) {
        WebDriver driver = new ChromeDriver();
        driver.get("https://google.com");
        System.out.println(driver.getTitle());
    }
}
```
hint: ChromeDriver needs to know WHERE the Chrome browser executable is (or use WebDriverManager).
expected: IllegalStateException or "driver executable does not exist"

## ANALOGY
WebDriver is like a remote control for your browser. The `WebDriver` interface is the universal remote — it has buttons (methods) like `get()`, `click()`, `sendKeys()`. `ChromeDriver` is the specific remote that speaks Chrome's language. `FirefoxDriver` speaks Firefox. Same buttons, different receivers. Your test code talks to the remote, the remote talks to the browser.

## CODE
```java
WebDriverManager.chromedriver().setup();
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless");
WebDriver driver = new ChromeDriver(options);
driver.get("https://example.com");
System.out.println(driver.getTitle());
driver.quit(); // ALWAYS close the browser
```
highlight: [1, 7]
annotation: `WebDriverManager` eliminates manual driver downloads — it detects your Chrome version and downloads the matching ChromeDriver automatically. `ChromeOptions` configures browser behavior (headless mode, window size, arguments). `driver.quit()` closes the browser AND ends the WebDriver session. Forgetting it leaves zombie Chrome processes consuming memory in CI. ChromeDriver implements the WebDriver interface — this is polymorphism. You can swap ChromeDriver for FirefoxDriver without changing test code.

## BREAK_IT
setup:
```java
WebDriver driver = new ChromeDriver();
driver.get("https://example.com");
System.out.println(driver.getTitle());
// forgot driver.quit()
```
modification: Run this test 10 times in a loop without `driver.quit()`.
question: What happens to your system?
options: [Nothing, 10 Chrome windows stay open eating RAM, Tests get faster, Chrome crashes]
correct: 1
explanation: Each `new ChromeDriver()` launches a real Chrome process. Without `quit()`, these processes stay alive. In CI, this leaks memory until the server crashes. ALWAYS use try/finally or @AfterMethod to guarantee `quit()` runs — even when tests fail.

## CONTRAST
label: driver.close() vs driver.quit()
codeA:
```java
driver.close(); // closes current TAB only
// If multiple tabs open, WebDriver session continues
```
codeB:
```java
driver.quit();  // closes ALL tabs + ends session
// Browser process terminates completely
```
question: Which should you use in @AfterMethod?
options: [close(), quit(), Either works, Neither]
correct: 1
explanation: `close()` only closes the current tab — the WebDriver session continues and Chrome processes stay alive. `quit()` terminates all tabs and ends the session completely. Like the remote control analogy — `close()` turns off one receiver, `quit()` unplugs the whole system. Always use `quit()` in teardown to prevent zombie Chrome processes consuming memory in CI.

## EXPLAIN_BACK
mode: fill_blank
prompt: What is the relationship between WebDriver, ChromeDriver, and Selenium?
sentence: Selenium is the framework, _____ is an interface defining browser methods like get() and findElement(), and ChromeDriver is a class that _____ WebDriver using the W3C WebDriver protocol — you can swap it for FirefoxDriver without changing test logic thanks to _____.
blanks: [WebDriver, implements, polymorphism]
distractors: [ChromeOptions, extends, inheritance]

## CONNECT
text: At Amazon, UI tests run headless in CI pipelines:
```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless", "--no-sandbox",
    "--disable-dev-shm-usage");
WebDriver driver = new ChromeDriver(options);
```
note: As an SDET-1, you'll configure WebDriver for both local development (visible browser for debugging) and CI execution (headless for speed). The `--no-sandbox` and `--disable-dev-shm-usage` flags are essential for running Chrome in Docker containers.
