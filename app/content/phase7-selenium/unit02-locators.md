---
unit: p7u2
title: Element Locators
teaches: [selenium.locators, selenium.xpath, selenium.css-selectors]
requires: [selenium.webdriver-setup, java.strings]
---

## HOOK
question: There are 500 elements on a webpage. You need to click ONE specific button. How does Selenium know WHICH one you mean?
```java
// Selenium doesn't understand English. It needs an ADDRESS.
driver.findElement(By.???("???")).click();
```

## FAIL_FIRST
prompt: Find and click the "Submit" button on a page. Which locator works?
```java
driver.get("https://example.com/form");
// HTML: <button id="submit-btn" class="btn primary">Submit</button>
driver.findElement(By.name("Submit")).click(); // Does this work?
```
hint: `By.name()` looks for the `name` HTML attribute, not the button text.
expected: NoSuchElementException — there's no name="Submit" attribute

## ANALOGY
Locators are like addresses for elements. `By.id` is a house number — unique and fastest. `By.className` is a street name — multiple houses share it. `By.xpath` is GPS coordinates — can find anything but complex and fragile. `By.cssSelector` is postal code + street — precise and efficient. Always prefer the simplest address that uniquely identifies the element.

## CODE
```java
driver.findElement(By.id("login-btn"));
driver.findElement(By.cssSelector(".btn.primary"));
driver.findElement(By.xpath("//button[text()='Login']"));
driver.findElement(By.name("username"));
driver.findElement(By.linkText("Sign Up"));
```
highlight: [1, 2]
annotation: ID is fastest because browsers index by ID internally. CSS selectors are nearly as fast and more flexible. XPath is slowest but can traverse UP the DOM tree (parent from child) — something CSS can't do. Use ID when available, CSS for most cases, XPath only when CSS can't express the relationship. Best practice: use data-testid attributes added by developers — they survive UI redesigns unlike CSS classes or XPath.

## BREAK_IT
setup:
```java
// HTML: <div class="btn">Save</div> <div class="btn">Cancel</div>
WebElement el = driver.findElement(By.className("btn"));
el.click();
```
modification: There are TWO elements with class "btn". Which one gets clicked?
question: What does findElement return when multiple elements match?
options: [Throws exception, Returns the FIRST match, Returns a random one, Returns null]
correct: 1
explanation: `findElement` always returns the FIRST matching element in DOM order. If you need a specific one, use a more precise locator or `findElements` (plural) to get ALL matches as a List.

## CONTRAST
label: CSS Selector vs XPath
codeA:
```java
// CSS: concise, fast, forward-only
driver.findElement(By.cssSelector("#login .btn-primary"));
driver.findElement(By.cssSelector("input[type='email']"));
```
codeB:
```java
// XPath: verbose, slower, can go UP
driver.findElement(By.xpath("//input[@type='email']/.."));
driver.findElement(By.xpath("//span[contains(text(),'Welcome')]"));
```
question: When MUST you use XPath over CSS?
options: [When you need to find a parent element, When id exists, When speed matters, Always use XPath]
correct: 0
explanation: CSS selectors can only traverse DOWN the DOM — like an address that only goes from street to house number. XPath can go UP with `/..` (child to parent) and match text content with `contains(text())`. Use `By.id` when available as the fastest locator, `By.cssSelector` as default for most cases, and `By.xpath` only when you need upward traversal or text matching.

## EXPLAIN_BACK
mode: pick_best
prompt: Your XPath locator broke after a UI redesign. How do you write stable locators?
options: [Use data-testid attributes via By.cssSelector because they survive redesigns unlike positional XPath, Always use By.xpath with full DOM paths for accuracy, Use By.className since class names never change, Avoid all locators and use JavaScript execution]
correct: 0

## CONNECT
text: At Amazon, SDETs request `data-testid` attributes from developers:
```html
<!-- Bad: fragile -->
<div class="sc-bZQynM kFpoIF">Add to Cart</div>
<!-- Good: stable testing contract -->
<div data-testid="add-to-cart-btn">Add to Cart</div>
```
note: As an SDET-1, you'll collaborate with frontend developers to add `data-testid` attributes. This creates a CONTRACT between test code and UI code — developers can refactor freely without breaking your tests.
