---
unit: p1u3
title: Classes & Objects
teaches: [oop.classes, oop.constructors, oop.this]
requires: [basics.methods, basics.types]
---

## HOOK
question: This creates a Dog. But WHERE does "Rex" go? What makes new Dog("Rex") work?
```java
Dog rex = new Dog("Rex");
System.out.println(rex.name); // "Rex"
```

## FAIL_FIRST
prompt: Create a class called Car with a "brand" field. Make new Car("Toyota") store the brand.
```java
class Car {
    // 1. Declare a field to store brand
    // 2. Create a constructor that accepts brand
}
```
```java
class Car {
    String brand;
    Car(String brand) {
        this.brand = brand;
    }
}
// Test: System.out.println(new Car("Toyota").brand);
```
hint: A constructor has the same name as the class, no return type. Use "this." to refer to the field.
expected: Toyota

## ANALOGY
A class is a blueprint (or cookie cutter). An object is an instance (an actual cookie) created with the "new" keyword. One cutter (class) can make hundreds of cookies (objects). Each cookie has the same SHAPE (fields, methods) but different DECORATIONS (values). You define the cutter once, then stamp out as many objects as you need with "new".

## CODE
```java
class Dog {
    String name;        // ← field (what the object stores)
    int age;

    Dog(String name, int age) {    // ← constructor
        this.name = name;          // ← this.name = field, name = parameter
        this.age = age;
    }

    String bark() {                // ← method (what the object does)
        return name + " says Woof!";
    }
}

Dog rex = new Dog("Rex", 3);     // create object
System.out.println(rex.bark());  // "Rex says Woof!"
```
highlight: [5, 6]
annotation: "this" means "the current object." this.name refers to the FIELD. name (without this) refers to the PARAMETER. Without "this.", you'd assign the parameter to itself (field stays null).

## BREAK_IT
setup:
```java
class Dog {
    String name;
    Dog(String name) {
        name = name; // ← BUG: no "this."
    }
}
Dog d = new Dog("Rex");
System.out.println(d.name);
```
modification: What does d.name print without "this."?
question: What is d.name?
options: [Rex, null, Compile error]
correct: 1
explanation: Without "this.", "name = name" assigns the PARAMETER to ITSELF. The FIELD stays at its default value (null for String). This is the #1 constructor bug beginners make. Always use "this." when field and parameter names match.

## CONTRAST
label: Two ways to create a Dog — what's different?
codeA:
```java
Dog rex;
rex.bark(); // ???
```
codeB:
```java
Dog rex = new Dog("Rex", 3);
rex.bark(); // works!
```
question: Why does Code A crash?
options: [rex is null — never created with new, bark() doesn't exist, Dog class is wrong, Both compile fine]
correct: 0
explanation: "Dog rex;" only DECLARES a variable (a label with nothing in the box). It's null. Calling a method on null = NullPointerException. "new" actually CREATES the object in memory. Declaration ≠ creation.

## CODE
```java
class Employee {
    String name;
    String department;
    int salary;

    // Constructor
    Employee(String name, String department, int salary) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    // Method
    String summary() {
        return name + " | " + department + " | $" + salary;
    }
}

// Creating multiple objects from one class:
Employee e1 = new Employee("Alice", "Engineering", 120000);
Employee e2 = new Employee("Bob", "QA", 95000);
```
highlight: [7, 8, 9]
annotation: This Employee class is EXACTLY what you'll build as a POJO in REST Assured (Phase 5). Request/response bodies map directly to classes like this. Every field = a JSON key.

## BREAK_IT
setup:
```java
class Counter {
    int count = 0;
    void increment() { count++; }
}
Counter a = new Counter();
Counter b = a;
b.increment();
System.out.println(a.count);
```
modification: b = a. Then we increment b. What's a.count?
question: What does a.count print?
options: [0, 1, Compile error]
correct: 1
explanation: "Counter b = a" doesn't copy the object — it copies the REFERENCE. Both a and b point to the SAME object in memory. Changing b changes a (they're the same thing). This is fundamental to understanding how Java passes objects.

## EXPLAIN_BACK
mode: fill_blank
prompt: What's the difference between a class and an object?
sentence: A class is a _____ that defines fields and methods. An object is an _____ created using the _____ keyword.
blanks: [blueprint, instance, new]
distractors: [interface, variable, static, class]

## CONNECT
text: In REST Assured (Phase 5), every API response maps to a class exactly like this:
```java
class UserResponse {
    String name;
    String email;
    int id;
}

// Deserialize API response into an object:
UserResponse user = response.as(UserResponse.class);
System.out.println(user.name); // from JSON!
```
note: The class you just learned to write IS the POJO that REST Assured auto-fills from JSON. Same constructor. Same fields. Direct connection.
