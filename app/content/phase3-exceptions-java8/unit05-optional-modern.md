---
unit: p3u5
title: Optional & Modern Java
teaches: [java8.optional, java8.chaining, java.var, java.textblocks]
requires: [java8.lambdas, java8.streams, exceptions.trycatch]
---

## HOOK
question: This code has a bug that crashes production once a week. The fix is ONE word. What is it?
```java
public String getUserCity(User user) {
    return user.getAddress().getCity().toUpperCase();
    // NullPointerException — but WHICH call returned null?
}
```

## FAIL_FIRST
prompt: Rewrite this null-check chain using Optional. How much shorter can you make it?
```java
String city = "Unknown";
if (user != null) {
    Address addr = user.getAddress();
    if (addr != null) {
        String c = addr.getCity();
        if (c != null) {
            city = c.toUpperCase();
        }
    }
}
```
hint: Optional.ofNullable(user).map(...).map(...).map(...).orElse("Unknown")
expected: One fluent chain replacing 8 lines of null checks

## ANALOGY
Optional is like a gift box that MIGHT be empty. Instead of reaching in blindly (and cutting your hand on null), you first CHECK: is there something inside? Then you decide: use what's inside (map/get), provide a backup gift (orElse), or panic appropriately (orElseThrow). The box makes the "might be empty" part VISIBLE in the type system — no more surprise nulls.

## CODE
```java
Optional<String> maybeName = Optional.ofNullable(getName());

// Safe extraction patterns:
String name1 = maybeName.orElse("Guest");           // default value
String name2 = maybeName.orElseGet(() -> fetchDefault()); // lazy default
String name3 = maybeName.orElseThrow(              // fail explicitly
    () -> new NoSuchElementException("Name required"));
```
highlight: [4, 5, 6]
annotation: Three creation methods: Optional.of(value) — throws NullPointerException if null. Optional.ofNullable(value) — safely wraps nullable, returns empty if null. Optional.empty() — explicitly empty. NEVER call .get() without .isPresent() — use orElse/orElseGet/orElseThrow instead. Optional means "this value might not exist" — use it for return types, NOT for fields or parameters.

## BREAK_IT
setup:
```java
Optional<String> opt = Optional.of(null);
System.out.println(opt.orElse("default"));
```
modification: What happens at the first line?
question: What does Optional.of(null) do?
options: [Returns Optional.empty(), NullPointerException immediately, Returns Optional with null inside, Compile error]
correct: 1
explanation: Optional.of(null) throws NullPointerException immediately. Use Optional.ofNullable(null) for values that might be null — it safely returns Optional.empty(). Think of it like the gift box analogy: .of() means "I guarantee there's a gift inside." .ofNullable() means "this box might be empty, handle it."

## CONTRAST
label: orElse vs orElseGet — eager vs lazy default
codeA:
```java
// orElse: ALWAYS evaluates the default
String name = findUser()
    .map(User::getName)
    .orElse(expensiveDbCall());
// expensiveDbCall() runs EVEN IF user exists!
```
codeB:
```java
// orElseGet: evaluates ONLY when empty
String name = findUser()
    .map(User::getName)
    .orElseGet(() -> expensiveDbCall());
// expensiveDbCall() runs ONLY if Optional is empty
```
question: When does the performance difference matter?
options: [When the default value is expensive to compute, Always — orElseGet is better, Never — they're identical, Only with database calls]
correct: 0
explanation: orElse(value) ALWAYS evaluates its argument — even if Optional has a value inside. orElseGet(supplier) only calls the supplier when the Optional IS empty — it's the lazy default. For cheap defaults like "Guest", orElse is fine. For expensive operations, ALWAYS use orElseGet to avoid unnecessary work. It's like providing a backup gift (orElse opens it regardless) vs having a backup gift on standby (orElseGet only unwraps if needed).

## CODE
```java
// Modern Java: var (Java 10) + text blocks (Java 15)
var users = List.of("Alice", "Bob", "Charlie"); // type inferred

var json = """
    {
        "name": "TestUser",
        "role": "SDET"
    }
    """; // multi-line string, no escaping needed
```
highlight: [2, 4]
annotation: var infers the type from the right side — it's still statically typed, just less verbose. Use for local variables where the type is obvious. var cannot infer the type of null since null has no type information. Text blocks (triple quotes) eliminate escape characters and preserve formatting — perfect for JSON, SQL, and HTML in tests.

## BREAK_IT
setup:
```java
var x = null;
System.out.println(x);
```
modification: Can var infer the type of null?
question: What happens when you assign null to a var variable?
options: [Compiles as Object, Compile error — can't infer type, Prints null, NullPointerException]
correct: 1
explanation: Compile error. var must infer the type from the initializer — null has no type information, so the compiler can't determine what x should be. var isn't dynamic typing — it's type inference. The compiler still needs a concrete type at compile time. Similarly, var x; without an initializer won't compile.

## EXPLAIN_BACK
mode: pick_best
prompt: When should you use Optional vs just returning null?
options: [Use Optional as a return type when a value might legitimately not exist — it makes the might-be-empty contract visible in the type system, Use Optional everywhere including fields and method parameters, Use Optional only when null would cause a compile error, Use null always because Optional adds too much overhead]
correct: 0

## CONNECT
text: Optional and modern features appear in test framework APIs:
```java
// Selenium — findElements returns List, but findElement can fail
Optional<WebElement> maybeButton = driver.findElements(By.id("submit"))
    .stream().findFirst();

maybeButton.ifPresent(WebElement::click);

// REST Assured — extract nullable JSON fields safely
var response = given().get("/user/999");
Optional<String> email = Optional.ofNullable(
    response.jsonPath().getString("email")
);
String display = email.orElse("no-email@test.com");
```
note: Modern SDET interviews expect fluent Optional chains, stream integration, and var usage. Text blocks are essential for embedding JSON payloads in tests without escape-character hell. These aren't "nice to know" — they're daily tools.
