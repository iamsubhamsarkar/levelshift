---
unit: p6u1
title: Test Design for APIs
teaches: [apistrategy.positive-negative, apistrategy.boundary-values, apistrategy.equivalence-partitioning]
requires: [restassured.requests, restassured.assertions]
---

## HOOK
question: A login API accepts passwords 8-20 characters long. You need to write tests. How many tests do you ACTUALLY need — and which values do you pick?
```java
// Testing password length: 8-20 chars
// Do you test length 1, 2, 3, 4, 5... 100?
// Or is there a smarter strategy?
```

## FAIL_FIRST
prompt: Write a test for a GET /users/{id} endpoint. What happens when id = -1?
```java
@Test
public void testGetUser() {
    given()
        .pathParam("id", 1)
    .when()
        .get("/users/{id}")
    .then()
        .statusCode(200);
    // What about invalid IDs? What status code should they return?
}
```
hint: A positive test confirms it works. A negative test confirms it fails correctly.
expected: 400 or 404 for invalid IDs

## ANALOGY
Think of a bouncer at a club. A positive test is checking that a valid ID gets you in. A negative test is checking that a fake ID gets you rejected. Boundary testing is checking the exact age limit — if the rule is 21+, you test age 20, 21, and 22. Equivalence partitioning means you don't test every age from 1 to 100 — you pick ONE from the "under 21" group and ONE from the "21+" group. One representative per partition.

## CODE
```java
// Boundary values for age field (valid: 18-65)
@Test void testMinBoundary() { post(body(age(17))).then().statusCode(400); }
@Test void testMinValid()    { post(body(age(18))).then().statusCode(201); }
@Test void testMaxValid()    { post(body(age(65))).then().statusCode(201); }
@Test void testMaxBoundary() { post(body(age(66))).then().statusCode(400); }
```
highlight: [2, 3]
annotation: Boundary values test the EDGES — min-1, min, max, max+1. Most bugs hide at boundaries, not in the middle. Equivalence partitioning splits the input domain into groups where all values behave identically — you pick one representative from each group. Boundary value analysis tests the edges: 0, 1, max, max+1. Equivalence partitioning groups inputs into classes and tests one from each.

## BREAK_IT
setup:
```java
@Test void testCreateUser() {
    given().body("{\"name\":\"John\",\"age\":25}")
        .post("/users").then().statusCode(201);
}
```
modification: What if you send age as a string — `"age":"twenty-five"`?
question: What kind of test technique catches this?
options: [Boundary testing, Negative testing, Performance testing]
correct: 1
explanation: Negative testing verifies the API handles INVALID input gracefully — wrong types, missing fields, malformed JSON, SQL injection strings. The API should return 400, not 500.

## CONTRAST
label: Positive vs Negative Test Design
codeA:
```java
// Positive: valid input → success
given().body("{\"email\":\"a@b.com\"}")
    .post("/users")
    .then().statusCode(201);
```
codeB:
```java
// Negative: invalid input → graceful failure
given().body("{\"email\":\"not-an-email\"}")
    .post("/users")
    .then().statusCode(400)
    .body("error", notNullValue());
```
question: Which test catches more real-world bugs?
options: [Positive tests, Negative tests, Both are equally important, Neither]
correct: 2
explanation: A positive test confirms valid input returns 201. A negative test confirms invalid input returns 400 gracefully. You need both — positive tests prove it works like the bouncer letting a valid ID through, negative tests prove it rejects bad input. Boundary values catch bugs at the edges while equivalence partitioning keeps the suite small.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do you systematically choose test cases for an API?
sentence: I used _____ to divide inputs into valid and invalid groups, _____ to test edges like min-1 and max+1, and split tests into _____ cases for happy paths and negative cases for invalid data.
blanks: [equivalence partitioning, boundary value analysis, positive]
distractors: [load testing, regression testing, integration]

## CONNECT
text: At Amazon, SDETs write test plans BEFORE coding tests. A typical API test plan includes:
```
Positive: Valid request → 200/201
Negative: Missing required field → 400
Negative: Invalid auth token → 401
Boundary: Max payload size → 413
Boundary: Rate limit threshold → 429
```
note: Test design isn't "write random tests until you feel done." It's a systematic strategy that ensures coverage while keeping the suite maintainable. In your SDET-1 role, you'll create test plans using these exact techniques for service APIs.
