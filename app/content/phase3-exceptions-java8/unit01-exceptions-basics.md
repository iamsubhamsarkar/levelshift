---
unit: p3u1
title: Exceptions Basics
teaches: [exceptions.trycatch, exceptions.hierarchy, exceptions.checked, exceptions.unchecked]
requires: [oop.inheritance, oop.interfaces]
---

## HOOK
question: This code compiles fine. But one version FORCES you to handle the error, the other doesn't. What's different?
```java
// Version A — compiles without try/catch
Integer.parseInt("abc");

// Version B — WON'T compile without try/catch
new FileReader("missing.txt");
```

## FAIL_FIRST
prompt: Run this code mentally. What happens at runtime?
```java
public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(nums[5]);
        System.out.println("Done!");
    }
}
```
hint: Java stops at the crash line — "Done!" never prints
expected: ArrayIndexOutOfBoundsException

## ANALOGY
Exceptions are like a fire alarm system in a building. When something goes wrong (fire/error), an alarm is THROWN. Someone must CATCH it and handle the situation — or the building evacuates (program crashes). Java has two types: 1) Fire code violations the inspector catches at BUILD time (checked exceptions — you MUST have a plan). 2) Unexpected fires at RUNTIME (unchecked exceptions — no advance plan required by the compiler).

## CODE
```java
try {
    int result = 10 / 0;           // risky code
} catch (ArithmeticException e) {  // handle specific error
    System.out.println("Can't divide by zero: " + e.getMessage());
} finally {
    System.out.println("Always runs — cleanup here");
}
```
highlight: [1, 3, 5]
annotation: try = attempt risky code. catch = handle specific exception type. finally = runs ALWAYS (even if exception occurs). The exception hierarchy is Throwable → Error | Exception. RuntimeException (unchecked) extends Exception. IOException, SQLException (checked) also extend Exception. Checked exceptions are verified at COMPILE time — the compiler forces you to catch or declare them with throws. Unchecked exceptions extend RuntimeException and are NOT checked at compile time.

## BREAK_IT
setup:
```java
public static int getValue() {
    try {
        return 1;
    } finally {
        return 2;
    }
}
System.out.println(getValue());
```
modification: What does this print?
question: When both try and finally have return statements, which wins?
options: [1, 2, Compile error, Exception thrown]
correct: 1
explanation: The finally block runs ALWAYS — even after a return in try. The finally block's return overrides the try block's return. Never put return in finally blocks in real code.

## CONTRAST
label: "throw" creates an exception, "throws" DECLARES one
codeA:
```java
// throw = actually LAUNCH the exception
public void validate(int age) {
    if (age < 0)
        throw new IllegalArgumentException("Invalid");
}
```
codeB:
```java
// throws = WARNING LABEL on the method
public void readFile(String path)
        throws IOException {
    new FileReader(path); // might fail
}
```
question: Which keyword actually creates the exception object?
options: [throw, throws, Both, Neither]
correct: 0
explanation: throw is the action — it creates and launches an exception, like pulling the fire alarm. throws is a declaration on the method — it tells callers this method MIGHT throw a checked exception, so the caller must catch it or declare it. Think of throw as the alarm being THROWN, throws as the warning sign on the building.

## BREAK_IT
setup:
```java
try {
    Integer.parseInt("abc");
} catch (Exception e) {
    System.out.println("A");
} catch (NumberFormatException e) {
    System.out.println("B");
}
```
modification: What happens when you compile this?
question: Can you catch a parent exception BEFORE a child exception?
options: [Prints A, Prints B, Compile error, Runtime error]
correct: 2
explanation: Compile error. In the exception hierarchy, NumberFormatException extends Exception. Catching Exception first makes the second catch unreachable. Java requires specific exception types before general ones — most specific catch first, like catching a specific fire alarm before the building-wide alarm.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain the difference between checked and unchecked exceptions in Java.
sentence: Checked exceptions are verified at _____ time and the compiler forces you to _____ them or declare them with _____.
blanks: [COMPILE, catch, throws]
distractors: [RUNTIME, throw, finally]

## CONNECT
text: In REST Assured tests, exceptions appear everywhere:
```java
@Test
public void testInvalidEndpoint() {
    try {
        given().get("/invalid").then().statusCode(200);
    } catch (AssertionError e) {
        // Test framework throws when assertion fails
        System.out.println("Expected failure: " + e.getMessage());
    }
}
```
note: REST Assured throws AssertionError (unchecked) for failed assertions. Selenium throws NoSuchElementException (unchecked) when elements aren't found. Understanding the exception hierarchy helps you write better test error handling and custom wait strategies.
