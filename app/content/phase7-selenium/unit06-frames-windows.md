---
unit: p7u6
title: Frames, Windows & Alerts
teaches: [selenium.frames, selenium.windows, selenium.alerts]
requires: [selenium.webdriver-setup, selenium.locators, selenium.explicit-waits]
---

## HOOK
question: You can see the element in the browser. Your locator is correct. But Selenium says "NoSuchElementException." You've been staring at this for 30 minutes. The element is INSIDE an iframe. Selenium can't see it.
```java
// Element is RIGHT THERE in the browser!
driver.findElement(By.id("payment-field")); // NoSuchElementException
// But WHY? The id exists... it's inside an <iframe>
```

## FAIL_FIRST
prompt: Click a button that's inside an iframe.
```java
// HTML: <iframe id="ad-frame"><button id="close-ad">X</button></iframe>
driver.findElement(By.id("close-ad")).click(); // Why does this fail?
```
hint: Selenium can only see elements in the CURRENT frame context. You need to switch first.
expected: Must call driver.switchTo().frame() before finding the element

## ANALOGY
Frames are like rooms in a house. Selenium starts in the living room (main page). It can see everything in that room but NOT inside bedrooms (iframes). You must WALK INTO the bedroom (`switchTo().frame()`) to interact with things there. And you must walk BACK OUT (`switchTo().defaultContent()`) to interact with the living room again.

## CODE
```java
driver.switchTo().frame("ad-frame");     // enter the iframe
driver.findElement(By.id("close-ad")).click();
driver.switchTo().defaultContent();       // back to main page

// Handling alerts:
Alert alert = driver.switchTo().alert();
alert.accept();  // clicks OK
```
highlight: [1, 3]
annotation: `switchTo().frame()` accepts frame id, name, index (0-based), or WebElement. After interacting inside a frame, you MUST switch back with `defaultContent()` — otherwise all subsequent findElement calls search inside the iframe and fail on main-page elements. For alerts, `switchTo().alert()` returns an Alert object with `accept()`, `dismiss()`, `getText()`, and `sendKeys()` methods. Always handle unexpected alerts in your framework's base page.

## BREAK_IT
setup:
```java
driver.switchTo().frame("payment-frame");
driver.findElement(By.id("card-number")).sendKeys("4111...");
// Now try to click the main page's "Submit" button:
driver.findElement(By.id("submit-order")).click();
```
modification: We're still inside the iframe context when clicking submit-order.
question: What happens?
options: [Works fine, NoSuchElementException, Frame switches automatically, NullPointerException]
correct: 1
explanation: After switching to a frame, Selenium ONLY sees that frame's DOM. The "submit-order" button is in the main page. You must call `driver.switchTo().defaultContent()` before accessing main-page elements. Forgetting this is the #1 frame-related bug.

## CONTRAST
label: Handling new windows vs new tabs
codeA:
```java
// Store original window
String original = driver.getWindowHandle();
// Click link that opens new window
driver.findElement(By.id("new-window-link")).click();
// Switch to new window
for (String handle : driver.getWindowHandles()) {
    if (!handle.equals(original)) driver.switchTo().window(handle);
}
```
codeB:
```java
// After done with new window, close it and return
driver.close();  // close current (new) window
driver.switchTo().window(original); // back to original
```
question: What happens if you don't switch back to the original window?
options: [Tests continue normally, All subsequent commands fail, Browser crashes, Auto-switches back]
correct: 1
explanation: After `driver.close()`, WebDriver has no active window context — like walking out of a room without going back to the main room. Any command throws `NoSuchWindowException`. You must `switchTo().window(originalHandle)` to re-enter the original frame context, similar to calling `switchTo().defaultContent()` when leaving an iframe.

## EXPLAIN_BACK
mode: pick_best
prompt: How do you handle a page with nested iframes?
options: [Switch in order — switchTo().frame(outer) then switchTo().frame(inner) — and use parentFrame() to go up one level or defaultContent() to return to main page, Call findElement directly since Selenium searches all frames, Use switchTo().defaultContent() between each frame switch, Nested iframes are not supported by Selenium WebDriver 4]
correct: 0

## CONNECT
text: At Amazon, payment forms and third-party widgets use iframes for security:
```java
// Switch to payment iframe, enter card details
driver.switchTo().frame("payment-iframe");
paymentPage.enterCard("4111111111111111");
driver.switchTo().defaultContent();
driver.findElement(By.id("place-order")).click();
```
note: As an SDET-1, you'll encounter iframes for payment processors, ads, embedded widgets, and CAPTCHA frames. Frame-switching bugs are the second most common Selenium issue after synchronization — always check if your element lives inside an iframe.
