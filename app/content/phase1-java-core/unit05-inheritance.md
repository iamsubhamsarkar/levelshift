---
unit: p1u5
title: Inheritance
teaches: [oop.inheritance, oop.super, oop.constructorchain]
requires: [oop.encapsulation, oop.constructors]
---

## HOOK
question: Dog has NO speak() method defined. So why does this work?
```java
class Animal { void speak() { System.out.println("..."); } }
class Dog extends Animal { }

new Dog().speak(); // prints "..."  ← HOW?
```

## FAIL_FIRST
prompt: Create a class ElectricCar that extends Car and adds a batteryLevel field. The constructor should call super() for brand.
```java
class Car {
    String brand;
    Car(String brand) { this.brand = brand; }
}

class ElectricCar {
    // extends Car, adds int batteryLevel
    // constructor takes brand + batteryLevel
}
```
```java
class Car {
    String brand;
    Car(String brand) { this.brand = brand; }
}

class ElectricCar extends Car {
    int batteryLevel;
    ElectricCar(String brand, int batteryLevel) {
        super(brand);
        this.batteryLevel = batteryLevel;
    }
}
// Test: new ElectricCar("Tesla", 100).brand → "Tesla"
```
hint: Use "extends Car" and call super(brand) as the first line of the constructor.
expected: Tesla

## ANALOGY
Inheritance is like a family tree. A child inherits traits from parents (eye color, height) but can also have their own unique traits. In Java, a subclass inherits ALL fields and methods from the parent — for free. Then it can add new ones or change existing ones.

## CODE
```java
class Animal {
    String name;
    
    Animal(String name) {
        this.name = name;
    }
    
    void eat() {
        System.out.println(name + " eats");
    }
}

class Dog extends Animal {          // ← inherits name + eat()
    String breed;
    
    Dog(String name, String breed) {
        super(name);                // ← calls Animal's constructor
        this.breed = breed;         // ← Dog's own field
    }
    
    void fetch() {                  // ← Dog's own method
        System.out.println(name + " fetches!");
    }
}

Dog d = new Dog("Rex", "Lab");
d.eat();    // inherited from Animal
d.fetch();  // Dog's own
```
highlight: [13, 17]
annotation: "extends" = inherits everything. "super()" = calls parent's constructor (MUST be first line). Dog gets eat() for free without rewriting it. Dog adds fetch() as its own.

## BREAK_IT
setup:
```java
class Vehicle {
    Vehicle(String type) {
        System.out.println("Vehicle: " + type);
    }
}

class Car extends Vehicle {
    Car() {
        System.out.println("Car ready");
    }
}
new Car();
```
modification: Car's constructor doesn't call super(). What happens?
question: What's the result?
options: [Prints both messages, Compile error — must call super(type), Only prints "Car ready"]
correct: 1
explanation: If parent has NO default (no-arg) constructor, the child MUST explicitly call super(args). Java can't auto-call super() because Vehicle requires a String parameter. This is "constructor chaining" — every child must satisfy parent's constructor.

## CONTRAST
label: Inheritance vs just copying code:
codeA:
```java
class Dog {
    String name;
    void eat() { /*...*/ }
    void sleep() { /*...*/ }
    void bark() { /*...*/ }
}
class Cat {
    String name;
    void eat() { /*...*/ }   // duplicated!
    void sleep() { /*...*/ } // duplicated!
    void meow() { /*...*/ }
}
```
codeB:
```java
class Animal {
    String name;
    void eat() { /*...*/ }
    void sleep() { /*...*/ }
}
class Dog extends Animal { void bark() {} }
class Cat extends Animal { void meow() {} }
```
question: Why is Code B better?
options: [Less code duplication — fix eat() once fixes all animals, Code B runs faster, No real difference, Code A is more readable]
correct: 0
explanation: DRY principle (Don't Repeat Yourself). If eat() has a bug, Code A requires fixing it in EVERY class. Code B — fix it once in Animal, all children get the fix automatically.

## CODE
```java
// Constructor chaining: what runs when?
class A {
    A() { System.out.println("A created"); }
}
class B extends A {
    B() { 
        super();  // ← Java adds this automatically if not written
        System.out.println("B created"); 
    }
}
class C extends B {
    C() { 
        super();
        System.out.println("C created"); 
    }
}

new C();
// Output:
// A created    ← grandparent first
// B created    ← parent second
// C created    ← child last
```
highlight: [7, 19, 20, 21]
annotation: Constructors chain UP the hierarchy. Parent is ALWAYS created before child. This guarantees parent fields are initialized before child tries to use them. When classes have a "has-a" relationship (Car HAS an Engine), use composition (fields) instead of inheritance. Inheritance is only for "is-a" (Dog IS an Animal).

## BREAK_IT
setup:
```java
class Shape {
    double area() { return 0; }
}
class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    double area() { return 3.14 * radius * radius; }
}

Shape s = new Circle(5);
System.out.println(s.area());
```
modification: s is declared as Shape but created as Circle. Which area() runs?
question: What does s.area() return?
options: [0 (Shape's version), 78.5 (Circle's version), Compile error]
correct: 1
explanation: The OBJECT is a Circle, so Circle's area() runs — even though the variable type says Shape. This is polymorphism (next unit!). Java calls the method based on the ACTUAL object type, not the declared variable type.

## EXPLAIN_BACK
mode: pick_best
prompt: When should you NOT use inheritance?
options: [When classes have a has-a relationship — use composition instead, When the child has more methods than the parent, When you need polymorphism in your code, When the parent class is in a different package]
correct: 0

## CONNECT
text: In Selenium (Phase 7), inheritance powers your entire framework:
```java
class BasePage {
    protected WebDriver driver;
    
    BasePage(WebDriver driver) {
        this.driver = driver;
    }
    
    protected void click(By locator) { /*...*/ }
    protected void type(By locator, String text) { /*...*/ }
}

class LoginPage extends BasePage {
    LoginPage(WebDriver driver) { super(driver); }
    
    public void login(String user, String pass) {
        type(By.id("user"), user);  // inherited from BasePage!
        click(By.id("submit"));     // inherited from BasePage!
    }
}
```
note: Every page extends BasePage, gets click/type/wait methods for free. Write utility methods once, use everywhere. That's inheritance in a real framework.
