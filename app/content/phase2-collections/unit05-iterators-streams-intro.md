---
unit: p2u5
title: Iterators & Streams Intro
teaches: [collections.iterators, collections.streams_intro]
requires: [collections.arraylist, collections.generics]
---

## HOOK
question: This crashes. But the logic LOOKS fine. Why?
```java
List<String> names = new ArrayList<>(List.of("a", "bb", "ccc"));
for (String s : names) {
    if (s.length() > 1) names.remove(s);
}
```

## FAIL_FIRST
prompt: Use an Iterator to safely remove all strings longer than 2 characters from this list.
```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("hi", "hello", "ok", "world"));
        // Use Iterator to remove words with length > 2
        System.out.println(words);
    }
}
```
hint: Get an Iterator with .iterator(). Use while(it.hasNext()), it.next(), and it.remove()
expected: [hi, ok]

## FAIL_FIRST
prompt: Use a stream to filter this list to only even numbers and collect into a new list.
```java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);
        // Use .stream().filter().collect() to get evens
    }
}
```
hint: nums.stream().filter(n -> n % 2 == 0).collect(Collectors.toList())
expected: [2, 4, 6]

## ANALOGY
An Iterator is a bookmark in a book — it tracks your position and lets you move forward one page at a time (and optionally rip out the current page safely). A Stream is a conveyor belt in a factory: items flow through stations (filter, transform, collect) and you get the finished product at the end without touching the original pile.

## CODE
```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Dave");
List<String> long_names = names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
// Result: [ALICE, CHARLIE, DAVE]
```
highlight: [3, 4]
annotation: filter() keeps elements matching a condition. map() transforms each element. collect() gathers results into a new collection. The original list is NEVER modified — streams are non-mutating pipelines. A stream can only be consumed ONCE — after a terminal operation (forEach, collect), it is closed. Reusing a consumed stream throws IllegalStateException. The for-each loop uses an Iterator internally; calling list.remove() directly during iteration causes ConcurrentModificationException because the Iterator's modification count becomes out of sync. Use Iterator.remove() to safely remove during iteration.

## BREAK_IT
setup:
```java
List<Integer> nums = List.of(1, 2, 3, 4, 5);
Stream<Integer> s = nums.stream().filter(n -> n > 2);
s.forEach(System.out::println);
s.forEach(System.out::println);  // second use
```
modification: We call forEach() on the same stream TWICE.
question: What happens on the second forEach()?
options: [Prints 3,4,5 again, Prints nothing, IllegalStateException, Compile error]
correct: 2
explanation: A stream can only be consumed ONCE. After a terminal operation like forEach or collect, the stream is closed. Reusing a consumed stream throws IllegalStateException. Create a new stream from the source to process again.

## CONTRAST
label: Traditional loop vs Stream pipeline
codeA:
```java
// Imperative: HOW to do it
List<String> result = new ArrayList<>();
for (String s : names) {
    if (s.length() > 3) {
        result.add(s.toUpperCase());
    }
}
```
codeB:
```java
// Declarative: WHAT to do
List<String> result = names.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```
question: What's the main advantage of the stream approach?
options: [Reads like a description of intent, Faster performance, Less memory, Modifies original list]
correct: 0
explanation: A stream is a conveyor belt — items flow through stations (filter, transform, collect) describing WHAT you want, not HOW. The original list is never modified. Streams are non-mutating pipelines that read like a description of intent rather than step-by-step instructions.

## EXPLAIN_BACK
mode: fill_blank
prompt: Why is removing elements during a for-each loop unsafe?
sentence: The for-each loop uses an _____ internally; calling list.remove() directly causes _____ because the modification count is out of sync. Use Iterator.remove() to safely _____ during iteration.
blanks: [Iterator, ConcurrentModificationException, remove]
distractors: [Stream, IllegalStateException, filter, collect]

## CONNECT
text: In test automation, streams transform API response data into assertions cleanly:
```java
List<User> users = response.jsonPath().getList("users", User.class);
List<String> activeEmails = users.stream()
    .filter(User::isActive)
    .map(User::getEmail)
    .collect(Collectors.toList());
assertTrue(activeEmails.contains("sdet@amazon.com"));
```
note: This pattern — extract list from response, filter, transform, assert — is the backbone of collection-based API testing. You'll master it in Phase 5.
