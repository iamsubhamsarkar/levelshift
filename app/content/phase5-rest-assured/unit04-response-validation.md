---
unit: p5u4
title: Response Validation
teaches: [restassured.status_validation, restassured.body_matchers, restassured.jsonpath]
requires: [restassured.given_when_then, http.json_structure]
---

## HOOK
question: How do you assert that a JSON array has exactly 6 items AND the first item's name is "George"?
```java
.body("data", hasSize(6))
.body("data[0].first_name", equalTo("George"));
```

## FAIL_FIRST
prompt: This test passes but it shouldn't. What's the bug?
```java
given()
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .body("data.email", notNullValue());
```
hint: notNullValue() passes even if the field exists but contains garbage
expected: Use equalTo("george.bluth@reqres.in") for exact validation. notNullValue() only checks existence, not correctness.

## ANALOGY
Hamcrest matchers are like quality control inspectors on an assembly line. equalTo() is the strict inspector — "this MUST be exactly 5cm." hasSize() counts items on the belt. hasItem() checks "is this specific part present anywhere?" containsString() looks inside a package. Each inspector has ONE job but you can chain them for full coverage.

## CODE
```java
given()
.when()
    .get("/users?page=1")
.then()
    .statusCode(200)
    .body("page", equalTo(1))
    .body("data", hasSize(6))
    .body("data.first_name", hasItem("George"))
    .body("total", greaterThan(10));
```
highlight: [6, 7, 8, 9]
annotation: Chain multiple .body() calls for comprehensive validation. Each takes a JsonPath expression (dot notation for nested objects, [index] for arrays) + a Hamcrest matcher (the inspector). equalTo() checks exact value, hasSize() counts the belt, hasItem() finds a part in the collection, greaterThan() sets a minimum threshold.

## BREAK_IT
setup:
```java
.body("data[0].first_name", equalTo("George"))
```
modification: Change to equalTo("george") — lowercase 'g'
question: What happens?
options: [Passes — case insensitive, Fails — expected george but was George, Compile error]
correct: 1
explanation: equalTo() is CASE SENSITIVE — the strict inspector rejects anything that isn't an exact match. The response has "George" but you asserted "george". Use equalToIgnoringCase() if case doesn't matter, but in interviews, always clarify whether validation should be case-sensitive.

## CONTRAST
label: JsonPath from body() vs standalone extraction:
codeA:
```java
// Inline validation (preferred for assertions)
given().when().get("/users/1")
.then()
    .body("data.first_name", equalTo("George"));
```
codeB:
```java
// Standalone extraction (for complex logic)
String name = given().when().get("/users/1")
    .jsonPath().getString("data.first_name");
assertEquals("George", name);
```
question: When would you use extraction over inline body()?
options: [When you need the value in a variable for later use, When the assertion is simple, Always use extraction, Never use extraction]
correct: 0
explanation: Inline .body() chains the inspector directly on the assembly line — readable and immediate. Extraction (jsonPath().getString()) pulls the value off the belt into a variable. Use extraction when you need that value for conditional logic, passing to another request, or assertions that the chained inspectors (Hamcrest matchers) can't express alone.

## EXPLAIN_BACK
mode: pick_best
prompt: Which Hamcrest matcher checks if a collection contains a specific element regardless of position?
options: [hasItem() — finds a specific part anywhere in the collection, equalTo() — checks exact value match, hasSize() — counts items in the collection, notNullValue() — checks the field exists]
correct: 0

## CONNECT
text: Amazon API tests validate contract compliance — every field matters:
```java
.body("orderId", matchesPattern("[A-Z0-9\\-]{36}"))
.body("items", hasSize(greaterThan(0)))
.body("status", oneOf("PENDING", "SHIPPED", "DELIVERED"))
.body("createdAt", notNullValue());
```
note: In production test suites, you validate not just values but formats (UUID patterns), enums (valid statuses), and invariants (non-empty arrays). Hamcrest matchers compose to express any contract rule.
