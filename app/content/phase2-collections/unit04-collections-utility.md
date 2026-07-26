---
unit: p2u4
title: Collections Utility
teaches: [collections.sorting, collections.immutable]
requires: [collections.arraylist, collections.generics]
---

## HOOK
question: This code sorts a list of names. But what order are they in?
```java
List<String> names = new ArrayList<>(List.of("Bob", "alice", "Charlie"));
Collections.sort(names);
System.out.println(names);
```

## FAIL_FIRST
prompt: Sort a list of integers in DESCENDING order (largest first). Print the result.
```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 9));
        // Sort descending, then print
    }
}
```
hint: Collections.sort() takes a second argument — a Comparator. Try Collections.reverseOrder()
expected: [9, 8, 5, 2, 1]

## FAIL_FIRST
prompt: Create an immutable list of 3 colors. Try to add a 4th — what happens?
```java
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> colors = List.of("red", "green", "blue");
        // Try adding "yellow" — what exception do you get?
    }
}
```
hint: List.of() creates an unmodifiable list. Call .add() and observe the error.
expected: UnsupportedOperationException

## ANALOGY
Comparable is teaching a class to sort ITSELF — like students who know their own rank order. Comparator is hiring an external judge — someone outside who can sort things by different criteria (height, weight, name) without changing the objects themselves.

## CODE
```java
List<String> items = new ArrayList<>(List.of("b", "a", "c"));
Collections.sort(items);            // [a, b, c] natural order
items.sort(Comparator.reverseOrder()); // [c, b, a]
items.sort(Comparator.comparingInt(String::length)); // by length

List<String> frozen = Collections.unmodifiableList(items);
// frozen.add("d"); // UnsupportedOperationException!
```
highlight: [4]
annotation: Comparator.comparingInt() extracts a numeric key from each element for sorting. This is the modern way — no anonymous classes needed. Chain with .thenComparing() for multi-level sorts. List.of() and List.copyOf() return immutable lists — any .add() or .remove() throws UnsupportedOperationException at runtime.

## BREAK_IT
setup:
```java
List<String> source = new ArrayList<>(List.of("a", "b"));
List<String> copy = List.copyOf(source);
copy.add("c");
```
modification: We call .add() on a List.copyOf() result.
question: What happens?
options: [Adds "c" successfully, UnsupportedOperationException, Compile error, NullPointerException]
correct: 1
explanation: List.copyOf() and List.of() return immutable lists. Any modification attempt like .add() or .remove() throws UnsupportedOperationException at runtime. Use these when you want to guarantee a list won't be accidentally modified.

## CONTRAST
label: Comparable (internal) vs Comparator (external)
codeA:
```java
// Class defines its OWN sort order
class Employee implements Comparable<Employee> {
    String name;
    public int compareTo(Employee o) {
        return this.name.compareTo(o.name);
    }
}
Collections.sort(employees); // uses compareTo
```
codeB:
```java
// External sort — no class change needed
List<Employee> employees = getEmployees();

employees.sort(Comparator
    .comparing(Employee::getName));

employees.sort(Comparator
    .comparingInt(Employee::getAge));
```
question: When should you use Comparator instead of Comparable?
options: [When you need multiple sort orders, When natural order suffices, When the class is yours, When sorting primitives]
correct: 0
explanation: Comparable teaches a class to sort ITSELF — one natural order, like students who know their own rank. Comparator is an external judge that can sort by different criteria (name, age, length) without changing the class. Use Comparator when you need flexibility with multiple sort orders.

## EXPLAIN_BACK
mode: pick_best
prompt: What happens when you call .add() on a list returned by List.of()?
options: [UnsupportedOperationException — List.of() returns an immutable list, The element is added successfully, NullPointerException, Compile error — .add() is not available]
correct: 0

## CONNECT
text: In test automation, immutable collections protect test data from accidental mutation:
```java
private static final List<String> VALID_STATUSES = 
    List.of("ACTIVE", "PENDING", "CLOSED");

@Test
void statusShouldBeValid() {
    String actual = getStatus();
    assertTrue(VALID_STATUSES.contains(actual));
}
```
note: Defining expected values as immutable constants prevents test pollution. If one test accidentally modifies shared data, other tests fail unpredictably — a classic source of flaky tests.
