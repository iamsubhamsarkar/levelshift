---
unit: p1u4
title: Encapsulation
teaches: [oop.encapsulation, oop.accessmodifiers]
requires: [oop.classes, oop.constructors]
---

## HOOK
question: This code compiles. But it lets ANYONE set a negative salary. How would you prevent that?
```java
Employee e = new Employee("Bob", -50000);
System.out.println(e.salary); // -50000 ← That's bad!
```

## FAIL_FIRST
prompt: Make the 'age' field private and add a setter that REJECTS negative values. If negative, set age to 0.
```java
class Person {
    int age; // Make this private + add getter/setter

    Person(int age) {
        this.age = age;
    }
}
```
```java
class Person {
    private int age;

    Person(int age) {
        setAge(age);
    }

    public void setAge(int age) {
        if (age >= 0) this.age = age;
        else this.age = 0;
    }

    public int getAge() { return age; }
}
// Test: new Person(-5).getAge() → 0
```
hint: private int age; then public void setAge(int age) { if (age >= 0) this.age = age; else this.age = 0; }
expected: 0

## ANALOGY
Encapsulation is like an ATM machine. You can deposit and withdraw (public methods), but you can NEVER reach inside and grab the cash directly (private fields). The machine controls HOW money moves — it validates, logs, and rejects bad operations. Without encapsulation, anyone can reach into the vault.

## CODE
```java
class BankAccount {
    private double balance;        // ← hidden from outside

    public BankAccount(double initial) {
        this.balance = initial;
    }

    public double getBalance() {   // ← controlled READ
        return balance;
    }

    public void deposit(double amount) {  // ← controlled WRITE
        if (amount > 0) {                 // ← VALIDATION!
            balance += amount;
        }
    }

    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        }
    }
}
```
highlight: [2, 8, 12, 13]
annotation: private = only this class can touch it. public getters/setters = controlled access with VALIDATION. This is encapsulation — hide data, expose behavior with rules.

## BREAK_IT
setup:
```java
class User {
    private String name;
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

User u = new User();
u.name = "Hack";
```
modification: We try to set name directly from outside.
question: What happens with u.name = "Hack"?
options: [Sets name to "Hack", Compile error — name is private, Runtime error]
correct: 1
explanation: Private fields can ONLY be accessed from inside the same class. Trying to access them from outside = compile error. That's the whole point — force everyone to use setName() where you control what's allowed.

## CONTRAST
label: Same data, different protection:
codeA:
```java
class Config {
    public String dbUrl;
    public String dbPassword;
}
// Anyone can do: config.dbPassword = "hacked";
```
codeB:
```java
class Config {
    private String dbUrl;
    private String dbPassword;
    
    public String getDbUrl() { return dbUrl; }
    // No setter for password — read-only!
}
```
question: Why is Code B safer?
options: [Password can't be changed after creation, Password is encrypted, No difference, Code B is slower]
correct: 0
explanation: Code B has no setter for dbPassword — once set in the constructor, nothing outside can change it. This is immutability through encapsulation. Code A lets anyone overwrite the password at any time.

## CODE
```java
// Access modifiers (most → least restrictive):
// private   → only this class
// (default) → only this package (no keyword)
// protected → this package + subclasses
// public    → everyone everywhere

class Employee {
    private int id;           // only Employee class
    String department;        // package-private (default)
    protected double salary;  // package + subclasses
    public String name;       // everyone
}
```
highlight: [2, 3, 4, 5]
annotation: In practice: make fields PRIVATE, methods PUBLIC. That's the rule 95% of the time. Default and protected are for framework-level code (you'll use them in Selenium BasePage).

## BREAK_IT
setup:
```java
class Counter {
    private int count = 0;
    
    public int getCount() { return count; }
    public void increment() { count++; }
}

Counter c = new Counter();
c.increment();
c.increment();
c.increment();
```
modification: What if we remove "private" from count? (make it public)
question: Does the code still work?
options: [Yes — works exactly the same, No — compile error, Yes — but now anyone can set count to anything]
correct: 2
explanation: Removing private makes it work — BUT now anyone can do c.count = -999; or c.count = 0; bypassing increment(). The code "works" but you've lost control. Private + public methods = you control the rules.

## EXPLAIN_BACK
mode: fill_blank
prompt: What is encapsulation?
sentence: Encapsulation means making fields _____ and exposing them through _____ methods. This prevents _____ access to internal data.
blanks: [private, public, direct]
distractors: [static, abstract, indirect, protected]

## CONNECT
text: In Selenium Page Object Model (Phase 7), encapsulation IS the design:
```java
class LoginPage {
    private WebDriver driver;                 // hidden
    private By username = By.id("user");      // hidden
    private By password = By.id("pass");      // hidden
    
    public void login(String user, String pwd) {  // public behavior
        driver.findElement(username).sendKeys(user);
        driver.findElement(password).sendKeys(pwd);
    }
}
```
note: Tests never see locators. They just call loginPage.login("admin", "pass"). If the UI changes, you fix ONE class — not 50 tests. That's encapsulation paying off.
