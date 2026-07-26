---
unit: p2u2
title: HashMap & HashSet
teaches: [collections.hashmap, collections.hashset]
requires: [basics.types, collections.arraylist]
---

## HOOK
question: This adds 5 items. What's the size of the set?
```java
HashSet<String> tags = new HashSet<>();
tags.add("java");
tags.add("test");
tags.add("java");
tags.add("TEST");
tags.add("test");
System.out.println(tags.size());
```

## FAIL_FIRST
prompt: Create a HashMap that maps country codes to country names. Add "US" → "United States" and "IN" → "India". Print the value for "IN".
```java
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        // Create map, add 2 entries, print value for "IN"
    }
}
```
hint: HashMap<String, String> map = new HashMap<>(); then .put() and .get()
expected: India

## FAIL_FIRST
prompt: Check if key "UK" exists in your map. Print true or false.
```java
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, String> map = new HashMap<>();
        map.put("US", "United States");
        map.put("IN", "India");
        // Check if "UK" exists, print result
    }
}
```
hint: Use .containsKey() — returns a boolean
expected: false

## ANALOGY
A HashMap is a phone contacts app: you look up a name (key) to get the number (value) instantly — no scrolling. A HashSet is a guest list at a party: you only care if someone's name IS on it or NOT — no duplicates, no ordering, just presence.

## CODE
```java
HashMap<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.get("Alice");           // 95
scores.containsKey("Bob");     // true
scores.getOrDefault("Eve", 0); // 0
```
highlight: [6]
annotation: getOrDefault() avoids NullPointerException when a key doesn't exist. Without it, .get("Eve") returns null, and unboxing null to int crashes. Always prefer getOrDefault() for numeric values. HashMap keys are UNIQUE — putting the same key again overwrites the previous value silently with no error or warning.

## BREAK_IT
setup:
```java
HashMap<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.put("b", 2);
map.put("a", 99);
System.out.println(map.get("a"));
```
modification: We put "a" twice with different values.
question: What does map.get("a") return?
options: [1, 99, Error, null]
correct: 1
explanation: HashMap keys are UNIQUE. Putting the same key again overwrites the previous value silently — no error, no warning. The second .put("a", 99) replaces 1 with 99, so .get("a") returns 99.

## CONTRAST
label: HashMap vs HashSet — when to use which
codeA:
```java
// Need key→value lookup?
HashMap<String, String> config = new HashMap<>();
config.put("env", "prod");
config.put("region", "us-west-2");
String env = config.get("env");
```
codeB:
```java
// Need "is this present?" check?
HashSet<String> visited = new HashSet<>();
visited.add("page1");
visited.add("page2");
boolean seen = visited.contains("page1");
```
question: When should you pick HashSet over HashMap?
options: [When you only need to check membership, When you need key-value pairs, When order matters, When you need duplicates]
correct: 0
explanation: HashSet is a guest list — you only care about presence, no duplicates, no ordering. HashMap is a contacts app — you look up a key to get a value. Use HashSet for membership checks; use HashMap for key-value lookup. Neither preserves insertion order.

## CODE
```java
// Iterating over a HashMap
HashMap<String, Integer> map = new HashMap<>();
map.put("x", 1);
map.put("y", 2);
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}
```
highlight: [5]
annotation: entrySet() gives you both key and value in one pass. Use keySet() if you only need keys, values() if you only need values. Never call get() inside a keySet() loop — it's redundant work. Use containsKey() to check if a key exists before relying on .get() results when null is a valid value.

## EXPLAIN_BACK
mode: pick_best
prompt: HashMap.get() returned null. What can you conclude?
options: [The key might not exist OR the value was explicitly set to null — use containsKey() to distinguish, The key definitely does not exist in the map, The map is empty, The value was set to null and the key exists]
correct: 0

## CONNECT
text: In API testing, you'll use HashMaps to build request payloads and validate response fields:
```java
Map<String, Object> body = new HashMap<>();
body.put("name", "TestUser");
body.put("role", "SDET");
given().body(body).post("/users");
```
note: REST Assured converts HashMap directly to JSON. Keys become field names, values become field values. You'll use this pattern dozens of times in Phase 5.
