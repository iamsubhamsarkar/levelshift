---
unit: p2u3
title: Generics
teaches: [collections.generics, collections.bounded_types]
requires: [basics.types, collections.arraylist, oop.classes]
---

## HOOK
question: This code compiles fine. But it CRASHES at runtime. Why?
```java
ArrayList list = new ArrayList();  // no <Type>
list.add("hello");
list.add(42);
String s = (String) list.get(1);  // 💥
```

## FAIL_FIRST
prompt: Write a generic class Box<T> that stores one item. Add a get() method that returns it.
```java
public class Box {
    // Make this generic so it can hold ANY type safely
    private ??? item;

    public void set(??? item) { this.item = item; }
    public ??? get() { return item; }
}
```
hint: Replace ??? with a type parameter like T. Declare it after the class name: Box<T>
expected: Box<String> b = new Box<>(); b.set("hi"); b.get() returns "hi"

## FAIL_FIRST
prompt: Write a generic method that prints any array. It should work for String[], Integer[], and Double[].
```java
public class Main {
    // Write a method: public static <T> void printAll(T[] arr)
    public static void main(String[] args) {
        String[] names = {"a", "b", "c"};
        Integer[] nums = {1, 2, 3};
        printAll(names);
        printAll(nums);
    }
}
```
hint: Put <T> before the return type. Use a for-each loop inside.
expected: a b c \n 1 2 3

## ANALOGY
Generics are like a label maker for containers. Without a label, you throw anything into a box and hope you remember what's inside. With a label (the <Type>), the compiler REJECTS wrong items at packing time — not when you unbox and get surprised.

## CODE
```java
public class Pair<K, V> {
    private K key;
    private V value;
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
    public K getKey() { return key; }
}
```
highlight: [1]
annotation: Multiple type parameters (K, V) let one class handle any combination of types. Pair<String, Integer> and Pair<Integer, Boolean> are both valid. The compiler enforces type safety for EACH usage independently. A bounded type like <T extends Comparable<T>> means BOTH arguments must be the same type T — the compiler rejects mismatches at compile time, not runtime.

## BREAK_IT
setup:
```java
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}
```
modification: Call max("hello", 42) — one String, one Integer.
question: What happens?
options: [Returns 42, Returns "hello", Compile error, Runtime error]
correct: 2
explanation: The bounded type <T extends Comparable<T>> means BOTH arguments must be the same type T. String and Integer are different types — the compiler rejects this at compile time, not runtime. Generics act like a label maker that catches wrong items at packing time.

## CONTRAST
label: Raw type (dangerous) vs Generic (safe)
codeA:
```java
// Raw type — NO safety
ArrayList list = new ArrayList();
list.add("text");
list.add(123);
String s = (String) list.get(1); // 💥 ClassCastException
```
codeB:
```java
// Generic — compiler protects you
ArrayList<String> list = new ArrayList<>();
list.add("text");
// list.add(123); // WON'T COMPILE
String s = list.get(0); // no cast needed
```
question: What's the main benefit of generics?
options: [Catches type errors at compile time, Runs faster, Uses less memory, Allows more types]
correct: 0
explanation: Without a label, you throw anything into a container and get a ClassCastException at runtime. With generics (the label maker), the compiler REJECTS wrong items at packing time. Type errors shift from runtime crashes to compile-time IDE warnings — no performance difference due to type erasure.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do generics improve type safety?
sentence: Generics are like a _____ for containers — the compiler rejects wrong items at _____, and bounded types like <T extends Comparable<T>> ensure both arguments are the _____.
blanks: [label maker, compile time, same type]
distractors: [bookmark, runtime, different type, any type]

## CONNECT
text: In test frameworks, generics power type-safe assertions and page objects:
```java
public class ApiResponse<T> {
    private T data;
    public T getData() { return data; }
}
ApiResponse<User> resp = client.get("/user/1", User.class);
assertEquals("Subham", resp.getData().getName());
```
note: Deserialization libraries (Jackson, Gson) use generics to return the exact type you expect — no casting. You'll build these patterns in Phase 5 with REST Assured.
