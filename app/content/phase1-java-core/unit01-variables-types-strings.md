---
unit: p1u1
title: Variables, Types & Strings
teaches: [basics.types, basics.strings]
requires: []
---

## HOOK
question: What does this print? (It's NOT "123")
```java
System.out.println(1 + "2" + 3);
```

## FAIL_FIRST
prompt: Make this code print your name. (Just one line needed)
```java
public class Main {
    public static void main(String[] args) {
        // Print your name here
    }
}
```
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```
hint: System.out.println("text") prints text
expected: Hello

## ANALOGY
A variable is a labeled box. You write a name on the outside (the variable name), and store something inside (the value). In Java, you also write what TYPE of thing is allowed in the box — only numbers? only text? This is called "static typing."

## CODE
```java
String name = "LevelShift";   // text
int version = 1;              // whole number
double score = 99.5;          // decimal number
boolean ready = true;         // true or false
char grade = 'A';             // single character
```
highlight: [1, 2]
annotation: Java has 8 primitive types (int, double, boolean, char, byte, short, long, float) and reference types (String, arrays, objects). Primitives store values directly. References point to objects in memory.

## BREAK_IT
setup:
```java
String a = "Hello";
String b = "Hello";
System.out.println(a == b);
```
modification: What if we change it to: String b = new String("Hello");
question: What does a == b print now?
options: [true, false, Compile error]
correct: 1
explanation: == compares memory addresses for objects. "Hello" (literal) reuses the same object from the String pool. new String() creates a NEW object at a different address. Always use .equals() for String comparison.

## CONTRAST
label: Same value, different behavior:
codeA:
```java
int x = 5;
int y = 5;
System.out.println(x == y); // true
```
codeB:
```java
String x = new String("hi");
String y = new String("hi");
System.out.println(x == y); // false!
```
question: Why does == work for int but NOT for String?
options: [Primitives compare values directly, Strings are special, It's a Java bug, Both compare values]
correct: 0
explanation: Primitives (int, double, boolean) compare VALUES with ==. Objects (String, Integer) compare MEMORY ADDRESSES with ==. Use .equals() for object content comparison.

## CODE
```java
String name = "Java";

// Essential String methods:
name.length();           // 4
name.charAt(0);          // 'J'
name.toUpperCase();      // "JAVA"
name.toLowerCase();      // "java"
name.contains("av");     // true
name.equals("Java");     // true (use this, NOT ==)
name.substring(0, 2);    // "Ja"
name + " rocks";         // "Java rocks" (concatenation)
```
highlight: [7]
annotation: .equals() compares STRING CONTENT. == compares memory addresses. This distinction is asked in EVERY interview. Strings are immutable — they can't be changed after creation. This enables string pool reuse, thread safety (no synchronization needed), and security (file paths/URLs can't be tampered).

## BREAK_IT
setup:
```java
String s = "Hello";
s.toUpperCase();
System.out.println(s);
```
modification: What does this print?
question: After calling toUpperCase(), what is s?
options: [HELLO, Hello, Compile error]
correct: 1
explanation: Strings are IMMUTABLE in Java. toUpperCase() returns a NEW string — it doesn't modify the original. You'd need s = s.toUpperCase(); to capture the result.

## EXPLAIN_BACK
mode: fill_blank
prompt: Why are Strings immutable in Java?
sentence: Strings are immutable for _____ reuse, _____ safety, and _____ (can't tamper with file paths).
blanks: [string pool, thread, security]
distractors: [garbage collection, inheritance, speed]

## CONNECT
text: In REST Assured (Phase 5), you'll compare response strings constantly:
```java
given()
  .get("/users/1")
.then()
  .body("name", equalTo("Subham"));  // String comparison
```
note: equalTo() uses .equals() internally — not ==. Today you learned WHY that matters.
