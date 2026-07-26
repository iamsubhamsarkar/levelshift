---
unit: p2u1
title: ArrayList Basics
teaches: [collections.arraylist, collections.autoboxing]
requires: [basics.types, basics.arrays]
---

## HOOK
question: This code compiles and runs. But what's the size of the list?
```java
ArrayList<Integer> nums = new ArrayList<>();
nums.add(10);
nums.add(20);
nums.remove(0);
nums.add(30);
System.out.println(nums.size());
```

## FAIL_FIRST
prompt: Create an ArrayList of Strings, add 3 fruit names, and print the second one.
```java
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        // Create ArrayList, add 3 fruits, print second
    }
}
```
hint: ArrayList<String> fruits = new ArrayList<>(); then use .add() and .get()
expected: banana

## FAIL_FIRST
prompt: Remove "banana" from your list by value (not index). Print the remaining size.
```java
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> fruits = new ArrayList<>();
        fruits.add("apple");
        fruits.add("banana");
        fruits.add("cherry");
        // Remove banana, print size
    }
}
```
hint: .remove() can take an object OR an index
expected: 2

## ANALOGY
An array is a row of lockers bolted to the wall — fixed size, numbered 0 to N. An ArrayList is a stretchy backpack: throw items in, take them out, and it expands or shrinks automatically. You trade a tiny bit of speed for massive flexibility.

## CODE
```java
ArrayList<String> names = new ArrayList<>();
names.add("Alice");           // [Alice]
names.add("Bob");             // [Alice, Bob]
names.get(0);                 // "Alice"
names.remove("Bob");          // [Alice]
names.size();                 // 1
```
highlight: [1, 2]
annotation: ArrayList uses generics (<String>) to enforce type safety at compile time. You CANNOT add an int to an ArrayList<String>. The diamond operator <> on the right lets Java infer the type. When using ArrayList<Integer>, .remove() is overloaded — remove(int index) removes by position, remove(Integer.valueOf(x)) removes by value. This autoboxing ambiguity is a common trap.

## BREAK_IT
setup:
```java
ArrayList<Integer> nums = new ArrayList<>();
nums.add(1);
nums.add(2);
nums.add(3);
nums.remove(1);
System.out.println(nums);
```
modification: What does nums.remove(1) actually remove?
question: What prints?
options: [[1, 3], [1, 2], [2, 3]]
correct: 0
explanation: remove(1) removes the element at INDEX 1 (which is "2"), NOT the Integer value 1. To remove by value, use remove(Integer.valueOf(1)). This is the autoboxing ambiguity — .remove() is overloaded for both index and object.

## CONTRAST
label: Fixed array vs dynamic ArrayList
codeA:
```java
String[] arr = new String[3];
arr[0] = "a";
arr[1] = "b";
// arr[3] = "d"; // CRASH!
System.out.println(arr.length);
```
codeB:
```java
ArrayList<String> list = new ArrayList<>();
list.add("a");
list.add("b");
list.add("d"); // No problem!
System.out.println(list.size());
```
question: What's the key advantage of ArrayList over arrays?
options: [Dynamic resizing, Faster access, Less memory, Type safety]
correct: 0
explanation: An array has fixed size set at creation — like lockers bolted to the wall. An ArrayList is a stretchy backpack that grows and shrinks automatically. Both give O(1) random access via index. ArrayList uses generics for type safety and provides built-in methods like .add(), .remove(), and .size().

## EXPLAIN_BACK
mode: fill_blank
prompt: How does ArrayList compare to a fixed array?
sentence: An ArrayList is like a _____ that expands or shrinks automatically, uses _____ to enforce type safety, and provides methods like .add() and _____.
blanks: [stretchy backpack, generics, .remove()]
distractors: [fixed locker, primitives, .length, autoboxing]

## CONNECT
text: In test automation, you'll collect dynamic results into ArrayLists constantly:
```java
List<String> failures = new ArrayList<>();
for (TestCase tc : testSuite) {
    if (!tc.passed()) failures.add(tc.name());
}
assertEquals(0, failures.size());
```
note: Notice we declared as List<String> (interface), not ArrayList<String>. You'll learn why interfaces matter in Phase 3.
