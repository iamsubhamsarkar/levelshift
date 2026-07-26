---
unit: p1u6
title: Polymorphism
teaches: [oop.polymorphism, oop.overloading, oop.overriding]
requires: [oop.inheritance]
---

## HOOK
question: Same variable type, different objects. Different output. How?
```java
Animal a = new Dog();  a.speak(); // "Woof"
Animal b = new Cat();  b.speak(); // "Meow"
Animal c = new Duck(); c.speak(); // "Quack"
```

## FAIL_FIRST
prompt: Override the describe() method in Circle so it prints "Circle with radius X" instead of the parent's generic message.
```java
class Shape {
    String describe() { return "I am a shape"; }
}
class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    // Override describe() here
}
```
```java
class Shape {
    String describe() { return "I am a shape"; }
}
class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    @Override
    String describe() { return "Circle with radius " + radius; }
}
// Test: new Circle(5.0).describe() → "Circle with radius 5.0"
```
hint: Same method signature: String describe() { return "Circle with radius " + radius; }
expected: Circle with radius 5.0

## ANALOGY
Polymorphism = "many forms." Same remote control button (play), different devices, different result. Press play on TV = shows video. Press play on speaker = plays music. Press play on game console = starts game. The BUTTON is the same. The BEHAVIOR depends on what you plugged in.

## CODE
```java
class Animal {
    void speak() { System.out.println("..."); }
}
class Dog extends Animal {
    @Override                                    // ← marks intentional override
    void speak() { System.out.println("Woof!"); }
}
class Cat extends Animal {
    @Override
    void speak() { System.out.println("Meow!"); }
}

// Polymorphism in action:
Animal pet = new Dog();
pet.speak();  // "Woof!" — Dog's version runs

pet = new Cat();
pet.speak();  // "Meow!" — Cat's version runs
```
highlight: [5, 15, 16]
annotation: @Override = "I'm intentionally replacing parent's method." Java checks at RUNTIME which actual object this is, and calls THAT version. Variable type (Animal) doesn't matter — object type (Dog/Cat) does.

## BREAK_IT
setup:
```java
class Parent {
    void greet() { System.out.println("Hello from Parent"); }
}
class Child extends Parent {
    void greet() { System.out.println("Hello from Child"); }
}
Parent p = new Child();
p.greet();
```
modification: Variable is Parent type, object is Child. Which greet() runs?
question: What gets printed?
options: [Hello from Parent, Hello from Child, Compile error]
correct: 1
explanation: Runtime polymorphism — Java looks at the ACTUAL OBJECT (Child), not the variable type (Parent). The Child's greet() overrides Parent's. This is the core of polymorphism.

## CONTRAST
label: Overloading vs Overriding — which is which?
codeA:
```java
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
    int add(int a, int b, int c) { return a+b+c; }
}
```
codeB:
```java
class Animal {
    void speak() { System.out.println("..."); }
}
class Dog extends Animal {
    @Override
    void speak() { System.out.println("Woof"); }
}
```
question: Which is overloading and which is overriding?
options: [A=Overloading B=Overriding, A=Overriding B=Overloading, Both are overloading, Both are overriding]
correct: 0
explanation: OVERLOADING = same class, same name, DIFFERENT parameters (compile-time). OVERRIDING = child class replaces parent's method, SAME signature (runtime). Overloading = many versions. Overriding = new version replaces old.

## CODE
```java
// WHY polymorphism matters — real example:
void testAllBrowsers(WebDriver driver) {
    driver.get("https://example.com");    // same code!
    driver.findElement(By.id("x"));       // same code!
}

// Same method, different browsers:
testAllBrowsers(new ChromeDriver());   // tests Chrome
testAllBrowsers(new FirefoxDriver());  // tests Firefox
testAllBrowsers(new SafariDriver());   // tests Safari
```
highlight: [2, 3, 8, 9, 10]
annotation: ONE method handles ALL browsers. You write test logic ONCE. Pass different driver implementations. That's polymorphism solving a real problem — your Selenium framework will use this daily. In Selenium, WebDriver is an interface. ChromeDriver and FirefoxDriver implement it. Tests reference the parent type (WebDriver) so switching browsers means changing one line.

## BREAK_IT
setup:
```java
class Animal {
    void speak() { System.out.println("Animal"); }
}
class Dog extends Animal {
    void speak() { System.out.println("Dog"); }
    void fetch() { System.out.println("Fetching!"); }
}
Animal a = new Dog();
a.fetch();
```
modification: Variable type is Animal. We call fetch() which only Dog has.
question: What happens?
options: [Prints "Fetching!", Compile error — Animal doesn't have fetch(), Runtime error]
correct: 1
explanation: Compile error! The COMPILER only sees the variable type (Animal). Animal has no fetch(). Even though the object IS a Dog, you can only call methods that the DECLARED type knows about. You'd need to cast: ((Dog)a).fetch(); Polymorphism gives you parent's interface, not child's extras.

## EXPLAIN_BACK
mode: fill_blank
prompt: Why is polymorphism essential in Selenium?
sentence: WebDriver is an _____ with implementations like _____. Tests reference the _____ type so switching browsers = one line change.
blanks: [interface, ChromeDriver, parent]
distractors: [class, TestNG, child, abstract]

## CONNECT
text: In REST Assured (Phase 5), polymorphism enables environment switching:
```java
RequestSpecification getSpec(String env) {
    if (env.equals("prod")) return prodSpec;
    if (env.equals("qa")) return qaSpec;
    return devSpec;
}

// Same test code, different environment:
given().spec(getSpec("qa")).get("/users").then().statusCode(200);
given().spec(getSpec("prod")).get("/users").then().statusCode(200);
```
note: One interface (RequestSpecification), many implementations. You already built this pattern in your CRAFTS API testing project. Now you know WHY it works.
