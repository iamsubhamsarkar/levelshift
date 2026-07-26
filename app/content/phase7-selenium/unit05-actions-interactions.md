---
unit: p7u5
title: Actions & Advanced Interactions
teaches: [selenium.actions-class, selenium.mouse-events, selenium.keyboard-events]
requires: [selenium.locators, selenium.explicit-waits, selenium.webdriver-setup]
---

## HOOK
question: How do you automate "hover over a menu to reveal a dropdown, then click a sub-item"? Regular `click()` only works on visible elements. The sub-item is HIDDEN until you hover.
```java
// This fails — dropdown not visible yet!
driver.findElement(By.id("submenu-item")).click(); // NoSuchElement!
// You need to HOVER first. But WebElement has no hover() method...
```

## FAIL_FIRST
prompt: Hover over a menu to reveal its dropdown, then click a sub-item.
```java
WebElement menu = driver.findElement(By.id("products-menu"));
WebElement subItem = driver.findElement(By.id("electronics"));
// menu.hover() doesn't exist!
subItem.click(); // fails — not visible
```
hint: The Actions class provides `moveToElement()` for hover. Chain with `.perform()`.
expected: Use Actions to hover, then click the revealed element

## ANALOGY
The `Actions` class is like a choreography script. Simple `click()` is "tap that." Actions lets you write sequences — "move here, hold Shift, drag there, release." It's the difference between pressing one piano key vs playing a chord progression. Each action queues up, `.perform()` executes the sequence.

## CODE
```java
Actions actions = new Actions(driver);
WebElement menu = driver.findElement(By.id("nav-menu"));
WebElement subItem = driver.findElement(By.id("sub-link"));
actions.moveToElement(menu)
       .pause(Duration.ofMillis(500))
       .click(subItem)
       .perform();
```
highlight: [4, 7]
annotation: Actions chains multiple interactions into ONE atomic operation. `moveToElement()` triggers CSS :hover. `pause()` waits for animations. `perform()` executes everything. Without `perform()`, NOTHING happens. For drag-and-drop: actions.dragAndDrop(source, target).perform(). For JS fallback when native doesn't work: executeScript() runs JavaScript directly.

## BREAK_IT
setup:
```java
Actions actions = new Actions(driver);
actions.moveToElement(menu);
actions.click(subItem);
System.out.println("Done!");
```
modification: We forgot to call `.perform()` at the end.
question: What happens without `.perform()`?
options: [Actions execute immediately, Nothing happens, Exception thrown, Executes on next interaction]
correct: 1
explanation: Without `.perform()`, the chain is BUILT but never EXECUTED. Like writing a recipe but never cooking. The test passes (no exception) but hover/click never happens, making assertions fail mysteriously.

## CONTRAST
label: Simple click vs Actions click
codeA:
```java
// Simple: single direct action
WebElement button = driver.findElement(By.id("btn"));
button.click();
```
codeB:
```java
// Actions: complex keyboard + mouse combo
new Actions(driver)
    .keyDown(Keys.CONTROL)
    .click(link1)
    .keyUp(Keys.CONTROL)
    .perform(); // Ctrl+click opens new tab
```
question: When do you NEED Actions over simple click()?
options: [Always use Actions, When combining keyboard + mouse, Only for drag-drop, When element has ID]
correct: 1
explanation: Simple `click()` handles basic single interactions. The Actions class is the choreography script — chain multiple interactions into one atomic sequence with `perform()`. Use it for hover (`moveToElement()`), drag-and-drop, keyboard+mouse combos (Ctrl+click), double-click, or right-click (`contextClick`). Without `perform()`, the chain is built but never executed.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do you automate drag-and-drop in Selenium?
sentence: Use the Actions class with _____ to chain source and target interactions, or use clickAndHold(source).moveToElement(target).release() followed by _____ to execute — if that fails, the app may use HTML5 drag events requiring _____ to trigger the drop directly.
blanks: [dragAndDrop, perform(), executeScript()]
distractors: [moveToElement, build(), sendKeys()]

## CONNECT
text: At Amazon, SDETs automate complex UI workflows:
```java
WebElement source = driver.findElement(By.id("widget-3"));
WebElement target = driver.findElement(By.id("slot-1"));
new Actions(driver).dragAndDrop(source, target).perform();
```
note: As an SDET-1, you'll automate admin panels with drag-drop, context menus, and keyboard shortcuts. The Actions class handles anything beyond basic click-and-type.
