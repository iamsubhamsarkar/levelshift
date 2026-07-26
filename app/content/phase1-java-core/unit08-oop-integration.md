---
unit: p1u8
title: OOP Integration Challenge
teaches: [oop.integration]
requires: [oop.polymorphism, oop.interfaces, oop.encapsulation]
---

## HOOK
question: You're building a test framework. You need: a base class all tests share, different test types (API, UI, Performance), and a contract that guarantees every test can run + report. Which OOP concepts do you combine?
```java
// What goes here?
// abstract? interface? inheritance? encapsulation?
```

## FAIL_FIRST
prompt: Design a mini hierarchy: Create an abstract class TestCase with an abstract method execute(), and an interface Reportable with a method generateReport(). Then create ApiTestCase that extends TestCase AND implements Reportable.
```java
// 1. abstract class TestCase { abstract void execute(); }
// 2. interface Reportable { String generateReport(); }
// 3. class ApiTestCase extends TestCase implements Reportable { ... }
```
```java
abstract class TestCase {
    abstract void execute();
}

interface Reportable {
    String generateReport();
}

class ApiTestCase extends TestCase implements Reportable {
    void execute() { System.out.println("Running API test"); }
    public String generateReport() { return "ApiTestCase"; }
}
// Test: new ApiTestCase().generateReport() → "ApiTestCase"
```
hint: ApiTestCase must implement BOTH execute() from TestCase AND generateReport() from Reportable.
expected: ApiTestCase

## ANALOGY
Building a test framework with OOP is like building a restaurant: The KITCHEN LAYOUT is the abstract class (shared infrastructure — oven, stove, fridge). The MENU ITEMS are the subclasses (each dish uses the kitchen differently). The HEALTH CODE is the interface (every restaurant MUST have handwashing, food temp checks — the contract). You can have many restaurant types that all share the kitchen AND follow the code.

## CODE
```java
// Complete mini-framework using ALL OOP concepts:

interface Executable {
    void run();
    default void retry(int times) {
        for (int i = 0; i < times; i++) {
            try { run(); return; } catch (Exception e) {
                if (i == times - 1) throw e;
            }
        }
    }
}

abstract class BaseTest implements Executable {
    private String testName;         // encapsulation
    protected long startTime;
    
    BaseTest(String name) {          // constructor
        this.testName = name;
    }
    
    public String getName() { return testName; }
    
    public void run() {              // template method pattern
        setup();
        execute();
        teardown();
    }
    
    void setup() { startTime = System.currentTimeMillis(); }
    abstract void execute();         // subclass fills this
    void teardown() { }
}

class ApiTest extends BaseTest {
    ApiTest(String name) { super(name); }
    
    @Override
    void execute() {
        System.out.println("Testing API: " + getName());
    }
}

class UiTest extends BaseTest {
    UiTest(String name) { super(name); }
    
    @Override
    void execute() {
        System.out.println("Testing UI: " + getName());
    }
}
```
highlight: [3, 14, 26, 30, 36, 44]
annotation: This combines ALL concepts: Interface (Executable contract + default retry), Abstract class (BaseTest template), Inheritance (ApiTest/UiTest extend BaseTest), Encapsulation (private testName), Polymorphism (both work through BaseTest reference). The pattern: interface (contract) → abstract base class (shared setup) → concrete classes (specific implementations like ApiTest, UiTest).

## BREAK_IT
setup:
```java
BaseTest test1 = new ApiTest("Login API");
BaseTest test2 = new UiTest("Login Page");

BaseTest[] suite = {test1, test2};
for (BaseTest t : suite) {
    t.run();
}
```
modification: We loop through different test types using the SAME variable type.
question: What gets printed?
options: [Both print "Testing API", test1=API test2=UI (polymorphism!), Compile error]
correct: 1
explanation: Polymorphism in action! Both stored as BaseTest, but run() calls execute() which is overridden differently in each subclass. The loop doesn't know or care which type — it just calls run(). THIS is how real test runners work.

## CONTRAST
label: Two framework designs — which is better?
codeA:
```java
// No OOP:
void runApiTest(String url) { /* 50 lines */ }
void runUiTest(String page) { /* 50 lines */ }
void runPerfTest(String endpoint) { /* 50 lines */ }
// Duplicated setup/teardown in each!
```
codeB:
```java
// With OOP:
abstract class BaseTest {
    void run() { setup(); execute(); teardown(); }
    abstract void execute();
}
class ApiTest extends BaseTest { void execute() {/**/} }
class UiTest extends BaseTest { void execute() {/**/} }
class PerfTest extends BaseTest { void execute() {/**/} }
```
question: Why is Code B dramatically better?
options: [Setup/teardown written ONCE. Add new test type = just 1 new class., Code B is faster, No real difference for 3 tests, Code A is more readable]
correct: 0
explanation: Code A duplicates setup/teardown 3 times. Adding a 4th test type = copy-paste again. Code B writes infrastructure ONCE. New test type = one tiny class with just execute(). At scale (50 test types), Code A is unmaintainable.

## CODE
```java
// Real-world pattern: Factory + Polymorphism
class TestFactory {
    static BaseTest create(String type, String name) {
        switch(type) {
            case "api": return new ApiTest(name);
            case "ui": return new UiTest(name);
            case "perf": return new PerfTest(name);
            default: throw new IllegalArgumentException("Unknown: " + type);
        }
    }
}

// Usage — create any test from config:
BaseTest test = TestFactory.create("api", "User CRUD");
test.run();  // polymorphism handles the rest
```
highlight: [3, 14, 15]
annotation: Factory pattern + polymorphism = create objects without knowing their exact type at compile time. Test runners use this to instantiate tests from configuration files. You'll build exactly this in your Selenium framework.

## BREAK_IT
setup:
```java
interface Loggable {
    default void log(String msg) { System.out.println("[LOG] " + msg); }
}
interface Retryable {
    default void log(String msg) { System.out.println("[RETRY] " + msg); }
}

class SmartTest implements Loggable, Retryable {
    // Both interfaces have log()!
}
```
modification: Two interfaces, same default method signature.
question: What happens?
options: [Uses Loggable's version, Uses Retryable's version, Compile error — must override]
correct: 2
explanation: Diamond problem! SmartTest MUST override log() to resolve the conflict. It can choose to call either: Loggable.super.log(msg) or Retryable.super.log(msg) or write its own. Java won't pick for you.

## EXPLAIN_BACK
mode: fill_blank
prompt: How would you design a test framework using OOP?
sentence: Use an _____ for the contract, an _____ base class for shared setup/teardown, and _____ classes for each test type.
blanks: [interface, abstract, concrete]
distractors: [static, final, private, void]

## CONNECT
text: This entire unit IS your Selenium framework (Phase 7):
```java
abstract class BasePage {                    // shared infra
    protected WebDriver driver;
    protected void click(By l) { /*...*/ }
    protected void type(By l, String t) { /*...*/ }
}
class LoginPage extends BasePage { /*...*/ } // specific pages
class HomePage extends BasePage { /*...*/ }

interface TestLifecycle {                    // contract
    void setup();
    void execute();
    void teardown();
}
```
note: You just learned EVERY concept needed to build a production test framework. Phase 7 will connect these pieces into a working Selenium project. The OOP foundation is complete.
