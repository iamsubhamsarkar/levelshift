---
unit: p1u2
title: Control Flow & Methods
teaches: [basics.controlflow, basics.methods]
requires: [basics.types]
---

## HOOK
question: This method returns "adult" for age 18. But what about age 18 EXACTLY? Look carefully.
```java
String check(int age) {
    if (age > 18) return "adult";
    else return "minor";
}
```

## FAIL_FIRST
prompt: Write an if/else that prints "even" if a number is even, "odd" otherwise. (Use the modulo operator %)
```java
int num = 7;
// Your code here — print "even" or "odd"
```
```java
int num = 7;
if (num % 2 == 0) {
    System.out.println("even");
} else {
    System.out.println("odd");
}
```
hint: num % 2 gives the remainder when divided by 2. If remainder is 0, it's even.
expected: odd

## ANALOGY
A method is like a vending machine. You put something IN (parameters), it does its work inside (body), and gives something back OUT (return value). Some machines take nothing in (no parameters) and some give nothing back (void). But they all DO something.

## CODE
```java
// Method anatomy:
static int add(int a, int b) {    // ← parameters IN
    int result = a + b;           // ← body (does work)
    return result;                // ← gives something OUT
}

// Calling it:
int sum = add(5, 3);  // sum = 8
```
highlight: [2, 4]
annotation: Return type (int) = what comes out. Parameters (int a, int b) = what goes in. "void" means nothing comes out. "static" means you can call it without an object (we'll cover this in Unit 3). Java picks which overloaded method to call based on the arguments you pass — matching parameter count and types.

## BREAK_IT
setup:
```java
static int multiply(int a, int b) {
    return a * b;
}
System.out.println(multiply(3, 4));
```
modification: What if we change return type to void? → static void multiply(int a, int b) { return a * b; }
question: What happens?
options: [Prints 12, Prints nothing, Compile error]
correct: 2
explanation: If return type is void, you CANNOT return a value. "return a * b;" in a void method is a compile error. Void methods can only use "return;" (with nothing) or simply end.

## CONTRAST
label: Same result, different approach:
codeA:
```java
// If-else chain
String grade(int score) {
    if (score >= 90) return "A";
    else if (score >= 80) return "B";
    else if (score >= 70) return "C";
    else return "F";
}
```
codeB:
```java
// Ternary operator
String status(int age) {
    return age >= 18 ? "adult" : "minor";
}
```
question: When would you use ternary vs if-else?
options: [Ternary for simple 2-way decisions, If-else for everything, They're identical, Ternary is faster]
correct: 0
explanation: Ternary (? :) is for simple A-or-B decisions in one line. If-else is for multiple conditions or complex logic. Use ternary when readability improves — don't nest ternaries (that's unreadable).

## CODE
```java
// For loop — when you know how many times
for (int i = 0; i < 5; i++) {
    System.out.println(i);  // 0, 1, 2, 3, 4
}

// While loop — when you don't know how many times
int count = 0;
while (count < 3) {
    count++;  // runs until condition is false
}

// For-each — iterating over collections
String[] names = {"A", "B", "C"};
for (String name : names) {
    System.out.println(name);
}
```
highlight: [2, 8, 13]
annotation: For-each (enhanced for) is what you'll use 90% of the time with Collections. It's cleaner than index-based for loops. You'll see this everywhere in test frameworks.

## BREAK_IT
setup:
```java
static void greet(String name) {
    System.out.println("Hello " + name);
}
greet(null);
```
modification: What happens when you pass null?
question: What's the output?
options: [Hello null, NullPointerException, Compile error]
correct: 0
explanation: Surprise! String concatenation with null produces "Hello null" (not an error). But if you called name.length() inside the method, THAT would throw NullPointerException. Concatenation is safe with null, method calls are not.

## EXPLAIN_BACK
mode: pick_best
prompt: Interviewer asks — "What is method overloading?"
options: [Same name but different parameters — Java picks based on arguments, Same name and same parameters but different return types, Overriding a parent method in a child class, Calling a method multiple times in a loop]
correct: 0

## CONNECT
text: In Selenium (Phase 7), you'll call methods constantly — and overloading is everywhere:
```java
driver.findElement(By.id("submit"));       // By ID
driver.findElement(By.cssSelector(".btn")); // By CSS
driver.findElement(By.xpath("//button"));   // By XPath
```
note: Same method name (findElement), different locator types. That's overloading in action — different parameter, different behavior.
