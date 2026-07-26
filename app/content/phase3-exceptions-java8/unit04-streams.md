---
unit: p3u4
title: Streams API
teaches: [java8.streams, java8.filter, java8.map, java8.collect, java8.reduce]
requires: [java8.lambdas, java8.functional, basics.collections]
---

## HOOK
question: Both produce the same result. One screams "WHAT I want." The other screams "HOW to do it." Which would you hire?
```java
// Version A
List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.length() > 3) {
        result.add(name.toUpperCase());
    }
}

// Version B
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

## FAIL_FIRST
prompt: What's wrong with this stream? It compiles, but produces NO output.
```java
List<String> names = List.of("Alice", "Bob", "Charlie");
names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase);
// Where did the result go?
```
hint: Streams are LAZY — nothing executes without a terminal operation
expected: Missing terminal operation (collect, forEach, count, etc.)

## ANALOGY
A stream is like a factory assembly line. Raw materials (data source) enter one end. Workers at stations along the belt transform or filter items (intermediate operations). At the END of the belt, a packer boxes the results (terminal operation). Key insight: NO worker does ANYTHING until the packer at the end starts requesting items. The line is lazy — it pulls items through on demand, not pushes them.

## CODE
```java
List<Integer> prices = List.of(120, 45, 89, 200, 30, 150);

long count = prices.stream()
    .filter(p -> p > 50)             // keep prices > 50
    .map(p -> p * 0.9)               // apply 10% discount
    .filter(p -> p < 150)            // keep under 150
    .count();                        // terminal: count results
```
highlight: [3, 4, 5, 6]
annotation: Stream pipeline = Source → Intermediate ops (lazy) → Terminal op (triggers execution). Intermediate: filter, map, sorted, distinct, limit, skip, flatMap — they return a new Stream and do nothing until triggered. Terminal: collect, forEach, count, reduce, findFirst, anyMatch — they trigger the pipeline and produce a final result. A stream can only be consumed ONCE — after a terminal operation, the stream is closed. Reusing throws IllegalStateException.

## BREAK_IT
setup:
```java
List<String> names = List.of("Alice", "Bob");
Stream<String> s = names.stream();
s.forEach(System.out::println);
s.forEach(System.out::println);  // second use
```
modification: What happens when you use a stream twice?
question: Can you call a terminal operation on the same stream object again?
options: [Prints names twice, IllegalStateException, Empty output second time, Compile error]
correct: 1
explanation: A stream can ONLY be consumed once. After a terminal operation like forEach, the stream is closed. Attempting to reuse it throws IllegalStateException. Always create a new stream from the source if you need to process again — just like the factory assembly line can't rewind; you must feed new raw materials from the start.

## CONTRAST
label: collect() vs reduce() — building collections vs computing a single value
codeA:
```java
// collect: accumulate into a collection
List<String> upper = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
// Result: ["ALICE", "BOB", "CHARLIE"]
```
codeB:
```java
// reduce: combine all elements into ONE value
int total = prices.stream()
    .reduce(0, (sum, price) -> sum + price);
// Result: 634 (single value)
```
question: When do you use collect() vs reduce()?
options: [collect for collections — reduce for single values, They're interchangeable, reduce is deprecated, collect only works with Strings]
correct: 0
explanation: collect() is a terminal operation that builds a new collection (List, Set, Map). reduce() is a terminal operation that combines all elements into a single value (sum, max). Both trigger the pipeline, but collect produces a collection while reduce produces one result — like the packer at the end of the assembly line either boxes items into a crate (collect) or weighs the total (reduce).

## BREAK_IT
setup:
```java
List<String> names = List.of("Alice", "Bob", "Charlie");
names.stream()
    .peek(n -> System.out.println("Processing: " + n))
    .filter(n -> n.length() > 10);
```
modification: Run this code. How many "Processing:" lines appear?
question: Does peek() execute without a terminal operation?
options: [3 lines print, 0 lines print — no terminal op, 1 line prints, Compile error]
correct: 1
explanation: ZERO output. Streams are lazy — without a terminal operation, NO intermediate operations execute. peek is intermediate, just like filter and map. The assembly line workers do nothing until the packer (terminal operation) at the end starts requesting items. Add .count() or .collect() to trigger the pipeline.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain the difference between intermediate and terminal operations in streams.
sentence: Intermediate operations like filter and map are _____ and return a new Stream, while terminal operations like collect and count _____ the pipeline and a stream can only be consumed _____.
blanks: [lazy, trigger, ONCE]
distractors: [eager, pause, twice, skip]

## CONNECT
text: Streams power test data handling and assertion patterns:
```java
// REST Assured — extract and process response list
List<String> activeUsers = given().get("/users")
    .jsonPath().getList("users")
    .stream()
    .filter(u -> u.get("active").equals(true))
    .map(u -> u.get("name").toString())
    .collect(Collectors.toList());

// Test data generation
List<Map<String, String>> testData = IntStream.range(1, 11)
    .mapToObj(i -> Map.of("user", "test" + i, "pass", "pwd" + i))
    .collect(Collectors.toList());
```
note: In real SDET work, streams replace 90% of for-loops when processing API responses, filtering test data, and generating parameterized inputs. Master filter→map→collect and you'll write cleaner, faster test code.
