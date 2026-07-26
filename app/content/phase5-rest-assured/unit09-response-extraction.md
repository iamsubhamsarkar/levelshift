---
unit: p5u9
title: Response Extraction
teaches: [restassured.extract_path, restassured.extract_pojo, restassured.response_logging]
requires: [restassured.body_matchers, restassured.jsonpath, restassured.post]
---

## HOOK
question: You POST a user and get an ID back. How do you use that ID in the NEXT request?
```java
String id = given().body(user).post("/users").jsonPath().getString("id");
given().get("/users/{id}", id).then().statusCode(200);
```

## FAIL_FIRST
prompt: This extraction returns null. The response clearly has data. Why?
```java
String name = given()
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .extract().path("first_name");
```
hint: Look at the actual JSON structure — is first_name at the root level?
expected: The JSON is {"data": {"first_name": "George"}}. The correct path is "data.first_name". Missing the nested structure causes null return.

## ANALOGY
Extraction is like mining. The response is a mountain of JSON ore. extract().path() is a precision drill — you specify exact coordinates ("data.id") and pull out one gem. extract().as(POJO.class) is a smelter — it melts the entire response into a structured object you can work with programmatically. Choose based on whether you need one value or the whole thing.

## CODE
```java
// Precision drill — extract a single value
String email = given().get("/users/1")
    .jsonPath().getString("data.email");

// Smelter — extract as POJO (full deserialization)
User user = given().get("/users/1")
    .then().extract().as(User.class);

// Validate-then-drill — assert THEN extract in one chain
String id = given().body(payload).post("/users")
    .then()
        .statusCode(201)
    .extract()
        .path("id");
```
highlight: [2, 3, 6, 7, 10, 11, 12, 13, 14]
annotation: Three extraction patterns: jsonPath().getString() is the precision drill for quick single values. .extract().as(Class) is the smelter for full deserialization into a POJO. .extract().path() after .then() is the validate-then-drill — assert the response is valid (201) BEFORE pulling out the gem. The third pattern is most common in test frameworks because it fails fast on bad responses. Store extracted values in local variables, then pass them to the next request using pathParam() for chaining API calls.

## BREAK_IT
setup:
```java
List<String> names = given().get("/users?page=1")
    .jsonPath().getList("data.first_name");
System.out.println(names.size()); // 6
```
modification: Change getList to getString
question: What does getString return for an array path?
options: [First element only, Comma-separated string, Exception thrown]
correct: 0
explanation: getString() on an array path returns only the first element as a String, silently discarding the rest — like drilling for one gem when there's a vein of six. Always match your extraction method to the expected type — getList() for arrays, getString() for single values, getInt() for numbers.

## CONTRAST
label: extract().path() vs jsonPath().getString():
codeA:
```java
// Validate-then-drill (after .then())
String id = given().get("/users/1")
    .then().statusCode(200)
    .extract().path("data.id");
```
codeB:
```java
// Direct drill (no prior validation)
String id = given().get("/users/1")
    .jsonPath().getString("data.id");
```
question: Which approach is safer in a test?
options: [codeA — validates before extracting, codeB — simpler and faster, Both equally safe, Neither validates]
correct: 0
explanation: codeA uses the validate-then-drill pattern — it asserts the response is valid (statusCode 200) BEFORE extracting the gem. codeB drills blindly — if the request failed (500), you'd extract null or wrong data from bad ore and only catch the problem later. Always validate the mountain before mining.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do you chain API calls that depend on previous responses?
sentence: Extract values using _____ after validating with statusCode(), store them in _____, and pass them to the next request via _____ to fill URL placeholders.
blanks: [.extract().path(), local variables, pathParam()]
distractors: [.body().get(), global fields, queryParam(), .parse().find(), static maps, header()]

## CONNECT
text: Amazon tests chain extractions for end-to-end workflows:
```java
// Create order → get tracking → verify shipment
String orderId = given().body(order).post("/orders")
    .then().statusCode(201).extract().path("orderId");
String trackingId = given().get("/orders/{id}/tracking", orderId)
    .then().statusCode(200).extract().path("trackingId");
given().get("/shipments/{id}", trackingId)
    .then().body("status", equalTo("IN_TRANSIT"));
```
note: Real integration tests are multi-step workflows. Each step validates + extracts. If step 2 fails, you know exactly which link in the chain broke. This pattern is daily work for Amazon SDETs.
