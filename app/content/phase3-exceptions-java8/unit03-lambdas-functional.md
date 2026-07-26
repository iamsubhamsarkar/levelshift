---
unit: p3u3
title: Lambdas & Functional Interfaces
teaches: [java8.lambdas, java8.functional, java8.methodreferences]
requires: [oop.interfaces, oop.abstract, exceptions.trycatch]
---

## HOOK
question: These two blocks do the SAME thing. One is 5 lines, one is 1 line. Which would you rather read in a test?
```java
// Version A
Comparator<String> comp = new Comparator<String>() {
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// Version B
Comparator<String> comp = (a, b) -> a.length() - b.length();
```

## FAIL_FIRST
prompt: Replace this anonymous class with a lambda. What's the shortest version?
```java
Runnable task = new Runnable() {
    public void run() {
        System.out.println("Running");
    }
};
```
hint: Lambda syntax: (parameters) -> expression OR (parameters) -> { statements; }
expected: Runnable task = () -> System.out.println("Running");

## ANALOGY
A lambda is like a Post-it note with one instruction on it. Instead of creating a full employee profile (class), hiring them (instantiation), and asking them to do one task (method call) — you just write the instruction on a Post-it and hand it off. The Post-it note only works if there's exactly ONE slot to stick it (one abstract method = functional interface).

## CODE
```java
// The 4 core functional interfaces:
Predicate<String> isLong    = s -> s.length() > 5;   // test: T → boolean
Function<String, Integer> len = s -> s.length();      // apply: T → R
Consumer<String> printer    = s -> System.out.println(s); // accept: T → void
Supplier<String> greeting   = () -> "Hello!";         // get: () → T
```
highlight: [2, 3, 4, 5]
annotation: These 4 interfaces from java.util.function cover 90% of lambda use cases. Predicate = filter/condition (test method). Function = transform (apply method). Consumer = side effect like print/log/save (accept method). Supplier = factory/lazy value (get method). A functional interface has exactly ONE abstract method. The @FunctionalInterface annotation enforces this at compile time. Method references (ClassName::method) are shorthand for lambdas that just delegate to one existing method.

## BREAK_IT
setup:
```java
Function<String, Integer> parse = s -> Integer.parseInt(s);
System.out.println(parse.apply("42"));
```
modification: Change to: Function<String, Integer> parse = Integer::parseInt;
question: What is Integer::parseInt called, and does it still work?
options: [Method reference — works identically, Static import — different behavior, Compile error, Only works with no-arg methods]
correct: 0
explanation: Integer::parseInt is a method reference — shorthand for a lambda where you just delegate to one existing method. The compiler converts it to the same Function that calls apply. Three forms exist: ClassName::staticMethod, object::instanceMethod, ClassName::instanceMethod.

## CONTRAST
label: Lambda vs Method Reference — same result, different style
codeA:
```java
// Lambda: explicit parameter
List<String> names = List.of("a", "bb");
names.forEach(s -> System.out.println(s));
names.stream()
    .map(s -> s.toUpperCase())
    .forEach(s -> System.out.println(s));
```
codeB:
```java
// Method reference: cleaner delegation
List<String> names = List.of("a", "bb");
names.forEach(System.out::println);
names.stream()
    .map(String::toUpperCase)
    .forEach(System.out::println);
```
question: When should you prefer method references over lambdas?
options: [When the lambda just calls one existing method, Always, Never — lambdas are clearer, Only for static methods]
correct: 0
explanation: Use method references when the lambda ONLY delegates to a single existing method with no extra logic. If you need to transform the parameter, add conditions, or call multiple methods — stick with a lambda. It's like the Post-it note analogy: a method reference is when the Post-it just says "ask that person" instead of writing out the full instruction.

## BREAK_IT
setup:
```java
interface Validator {
    boolean validate(String input);
    boolean check(String input);  // second abstract method
}

Validator v = s -> s.length() > 0;  // Lambda here
```
modification: Can a lambda implement an interface with TWO abstract methods?
question: What happens when you assign a lambda to a non-functional interface?
options: [Works fine, Compile error — not a functional interface, Runtime error, Picks the first method]
correct: 1
explanation: Lambdas ONLY work with functional interfaces — interfaces with exactly ONE abstract method. Two abstract methods means the compiler can't determine which method the lambda implements. A functional interface has one slot for the Post-it note; two slots means the compiler doesn't know where to stick it. The @FunctionalInterface annotation enforces this rule at compile time.

## EXPLAIN_BACK
mode: fill_blank
prompt: What is a functional interface and why do lambdas require one?
sentence: A functional interface has exactly _____ abstract method, and lambdas need one because the compiler must know which method to implement via the _____ annotation.
blanks: [ONE, @FunctionalInterface]
distractors: [TWO, @Override, ZERO, @Lambda]

## CONNECT
text: REST Assured and Selenium use lambdas extensively:
```java
// REST Assured — lambda in assertion
given().get("/users")
    .then().body("users.name", everyItem(
        matchesPattern(s -> s.startsWith("User"))
    ));

// Selenium — explicit wait with lambda condition
WebElement el = new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(d -> d.findElement(By.id("submit")));
```
note: Selenium's ExpectedCondition is a functional interface. WebDriverWait.until() takes a Function<WebDriver, T>. Understanding lambdas lets you write custom wait conditions instead of relying only on built-in ones.
