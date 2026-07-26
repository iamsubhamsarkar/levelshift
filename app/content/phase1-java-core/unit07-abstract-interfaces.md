---
unit: p1u7
title: Abstract & Interfaces
teaches: [oop.abstract, oop.interfaces, oop.defaultmethods]
requires: [oop.inheritance, oop.polymorphism]
---

## HOOK
question: This code forces every Shape to have area(). But you can NEVER create "new Shape()". Why would you want that?
```java
abstract class Shape {
    abstract double area();  // no body — children MUST implement
}
// new Shape(); ← ILLEGAL. Compile error.
```

## FAIL_FIRST
prompt: Create an interface called Searchable with one method: List<String> search(String query). Then make a class GoogleSearch implement it.
```java
// Define the interface Searchable
// Then create GoogleSearch that implements it
```
```java
import java.util.*;

interface Searchable {
    List<String> search(String query);
}

class GoogleSearch implements Searchable {
    public List<String> search(String query) {
        return List.of("Result for: " + query);
    }
}
// Test: new GoogleSearch().search("java")
```
hint: interface Searchable { List<String> search(String query); } — then class GoogleSearch implements Searchable { ... }
expected: GoogleSearch

## ANALOGY
An interface is a CONTRACT. Like a job description: "You MUST be able to code in Java, write tests, and do code reviews." It doesn't tell you HOW — just WHAT is required. Any class that signs the contract (implements) MUST fulfill every requirement. An abstract class is a PARTIAL blueprint — some rooms are built, some are left empty for you to finish.

## CODE
```java
// Abstract class = partial implementation
abstract class TestBase {
    WebDriver driver;
    
    void setup() {                       // ← concrete (has body)
        driver = new ChromeDriver();
    }
    
    abstract void runTest();             // ← abstract (NO body, child MUST implement)
    
    void teardown() {                    // ← concrete
        driver.quit();
    }
}

class LoginTest extends TestBase {
    @Override
    void runTest() {                     // ← FORCED to implement
        driver.get("https://...");
        // test logic
    }
}
```
highlight: [9, 17, 18]
annotation: Abstract = "I provide the skeleton, you fill in the details." Children are FORCED to implement abstract methods — compile error if they don't. This guarantees every test has a runTest() method.

## BREAK_IT
setup:
```java
interface Drivable {
    void start();
    void stop();
}

class Bicycle implements Drivable {
    public void start() { System.out.println("Pedaling"); }
    // forgot to implement stop()!
}
```
modification: Bicycle implements Drivable but only defines start(), not stop().
question: What happens?
options: [Works fine — stop() is optional, Compile error — must implement ALL interface methods, Runtime error]
correct: 1
explanation: Interfaces are a CONTRACT. If you sign it (implements), you MUST fulfill EVERY method. Missing even ONE = compile error. This is how Java enforces that every implementor has the required capabilities.

## CONTRAST
label: Abstract Class vs Interface — when to use which?
codeA:
```java
abstract class Animal {
    String name;
    Animal(String name) { this.name = name; }
    void breathe() { System.out.println("breathing"); }
    abstract void speak();
}
```
codeB:
```java
interface Speakable {
    void speak();
    default void whisper() {
        System.out.println("(whispering)");
    }
}
```
question: Key difference?
options: [Abstract can have fields + constructors. Interface cannot., Interface is faster, No difference in Java 8+, Abstract is deprecated]
correct: 0
explanation: Abstract classes have: fields, constructors, both abstract AND concrete methods. Interfaces have: only method signatures + default methods (since Java 8), NO fields (only constants), NO constructors. Use abstract when sharing STATE. Use interface when sharing BEHAVIOR contracts.

## CODE
```java
// Interface with default method (Java 8+):
interface Retryable {
    int maxRetries();                    // ← every implementor defines this
    
    default void retry(Runnable task) {  // ← shared implementation (free!)
        for (int i = 0; i < maxRetries(); i++) {
            try { task.run(); return; }
            catch (Exception e) {
                if (i == maxRetries() - 1) throw e;
            }
        }
    }
}

// Any class gets retry logic for free:
class ApiClient implements Retryable {
    public int maxRetries() { return 3; }
}
```
highlight: [5, 16, 17]
annotation: Default methods let interfaces provide shared logic WITHOUT forcing an abstract class. Implementors get the behavior for free but can override if needed. This is how modern Java frameworks provide functionality without deep inheritance trees.

## BREAK_IT
setup:
```java
interface A { default void hello() { System.out.println("A"); } }
interface B { default void hello() { System.out.println("B"); } }

class C implements A, B {
    // Both A and B have hello() — what happens?
}
```
modification: Class C implements two interfaces with the same default method.
question: What happens?
options: [Prints A, Prints B, Compile error — must override to resolve conflict]
correct: 2
explanation: Diamond problem! When two interfaces have the same default method, the implementing class MUST override it to resolve the ambiguity. Java won't guess which one you want.

## EXPLAIN_BACK
mode: pick_best
prompt: When would you choose an abstract class over an interface?
options: [When you need shared state (fields) and partial implementation, When a class needs to implement multiple contracts, When you want unrelated classes to share behavior, When you only need method signatures with no body]
correct: 0

## CONNECT
text: In REST Assured (Phase 5), interfaces define test contracts:
```java
interface ApiTest {
    RequestSpecification getSpec();
    void validateResponse(Response response);
}

class UserApiTest implements ApiTest {
    public RequestSpecification getSpec() {
        return given().baseUri("https://api.example.com")
                      .header("Auth", "Bearer ...");
    }
    public void validateResponse(Response r) {
        r.then().statusCode(200).body("id", notNullValue());
    }
}
```
note: Interface = contract for what every API test must provide. Implementations fill in the details per endpoint. This is exactly how you'll structure your framework.
