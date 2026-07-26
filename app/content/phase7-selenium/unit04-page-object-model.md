---
unit: p7u4
title: Page Object Model
teaches: [selenium.page-object-model, selenium.page-factory, selenium.base-page]
requires: [selenium.locators, selenium.explicit-waits, java.oop, java.inheritance]
---

## HOOK
question: You have 200 tests that find the login button with `By.id("login-btn")`. The developer changes the ID to `signin-btn`. How many files do you edit?
```java
// Test 1: driver.findElement(By.id("login-btn")).click();
// Test 2: driver.findElement(By.id("login-btn")).click();
// ... 198 more. One ID change = 200 edits?
```

## FAIL_FIRST
prompt: Refactor this test so the locator lives in ONE place.
```java
@Test void testLogin() {
    driver.findElement(By.id("username")).sendKeys("admin");
    driver.findElement(By.id("password")).sendKeys("pass123");
    driver.findElement(By.id("login-btn")).click();
}
@Test void testLoginFail() {
    driver.findElement(By.id("username")).sendKeys("");
    driver.findElement(By.id("login-btn")).click();
}
```
hint: Create a LoginPage class that owns all locators and actions for the login page.
expected: Tests call loginPage.login("admin","pass123") instead of repeating locators

## ANALOGY
POM is like a TV remote with labeled buttons. You don't rewire the TV internals to change channels — you press "Channel Up." If the manufacturer changes the signal, they update the remote internally. YOUR fingers press the same button. POM separates WHAT you do (test logic) from HOW (locators and interactions).

## CODE
```java
public class LoginPage {
    @FindBy(id = "username") private WebElement usernameField;
    @FindBy(id = "password") private WebElement passwordField;
    @FindBy(id = "login-btn") private WebElement loginButton;
    public LoginPage(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
    public void login(String user, String pass) {
        usernameField.sendKeys(user);
        passwordField.sendKeys(pass);
        loginButton.click();
    }
}
```
highlight: [2, 3, 4]
annotation: `@FindBy` declares locators. `PageFactory.initElements` connects them to WebDriver. Now tests just call `loginPage.login("admin","pass")`. If the ID changes, you edit ONE line in LoginPage — not 200 test files. Create a BasePage class with shared utilities (wait helpers, click, type). All page classes extend BasePage for code reuse.

## BREAK_IT
setup:
```java
public class LoginPage {
    @FindBy(id = "login-btn") private WebElement loginBtn;
    public void clickLogin() { loginBtn.click(); }
}
LoginPage page = new LoginPage();
page.clickLogin();
```
modification: We forgot `PageFactory.initElements(driver, this)`.
question: What happens when clickLogin() is called?
options: [NullPointerException, Works fine, NoSuchElementException, Compile error]
correct: 0
explanation: Without `PageFactory.initElements()`, @FindBy fields remain NULL. `loginBtn.click()` throws NullPointerException. Always call `PageFactory.initElements(driver, this)` in the constructor.

## CONTRAST
label: Without POM vs With POM
codeA:
```java
// Without: locators scattered everywhere
driver.findElement(By.id("user")).sendKeys("admin");
driver.findElement(By.id("pass")).sendKeys("secret");
driver.findElement(By.id("btn")).click();
```
codeB:
```java
// With POM: clean, maintainable
LoginPage loginPage = new LoginPage(driver);
loginPage.login("admin", "secret");
// ID changes → edit ONLY LoginPage.java
```
question: What's the main benefit of POM?
options: [Tests run faster, Single point of maintenance, Fewer files, Better assertions]
correct: 1
explanation: POM's primary benefit is single point of maintenance. `@FindBy` declares locators in one page class, and `PageFactory.initElements` connects them to WebDriver. If an ID changes, you edit one line in the page class — not 200 test files. Tests become readable method calls like `loginPage.login()`, and the page class is reusable across test suites.

## EXPLAIN_BACK
mode: pick_best
prompt: How do you structure your Selenium framework?
options: [BasePage with shared waits and actions — page classes extend it with @FindBy locators and PageFactory — test classes compose page method calls, Put all locators in one Constants file and reference them everywhere, Write all tests inline without page classes for simplicity, Use only XPath locators in test methods directly]
correct: 0

## CONNECT
text: At Amazon, SDET teams maintain page object frameworks:
```java
OrdersPage ordersPage = new OrdersPage(driver);
ordersPage.searchOrder("112-345-6789");
ordersPage.verifyStatus("Delivered");
ordersPage.initiateRefund("Wrong item");
```
note: As an SDET-1, you'll BUILD and MAINTAIN POM frameworks. A well-designed framework lets manual QA engineers write automated tests without knowing Selenium internals — they just call page methods.
