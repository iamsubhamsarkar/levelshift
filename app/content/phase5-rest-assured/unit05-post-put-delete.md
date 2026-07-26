---
unit: p5u5
title: POST, PUT & DELETE
teaches: [restassured.post, restassured.put, restassured.delete, restassured.request_body]
requires: [restassured.given_when_then, restassured.body_matchers]
---

## HOOK
question: GET reads data. But how do you CREATE, UPDATE, and DELETE via tests?
```java
given().body("{\"name\":\"Subham\"}").when().post("/users").then().statusCode(201);
```

## FAIL_FIRST
prompt: This POST request returns 415 instead of 201. Fix it.
```java
given()
    .body("{\"name\": \"Subham\", \"job\": \"SDET\"}")
.when()
    .post("/users")
.then()
    .statusCode(201);
```
hint: The server doesn't know the body format — what header is missing?
expected: Add .contentType(ContentType.JSON) before .body(). Without Content-Type, the server can't parse JSON.

## ANALOGY
POST is mailing a package (you send something, get a tracking number back). PUT is returning a defective item with a replacement (same address, new contents). DELETE is a cancellation — you reference the order ID and it's gone. In all cases, you need to tell the post office WHAT FORMAT your package is in (Content-Type).

## CODE
```java
Map<String, String> user = Map.of("name", "Subham", "job", "SDET");

given()
    .contentType(ContentType.JSON)
    .body(user)
.when()
    .post("/users")
.then()
    .statusCode(201)
    .body("name", equalTo("Subham"));
```
highlight: [1, 4, 5, 9]
annotation: REST Assured auto-serializes Maps and POJOs to JSON when contentType(ContentType.JSON) is set — no manual JSON string building needed. The Map (line 1) is your package contents, contentType (line 4) is the format label on the package, .body(user) (line 5) is handing the package to the post office. The response .body() (line 9) confirms what was created. DELETE returns 204 No Content on success, or 404 Not Found if the resource doesn't exist.

## BREAK_IT
setup:
```java
given().contentType(ContentType.JSON)
    .body(Map.of("name", "Subham"))
.when().put("/users/1")
.then().statusCode(200);
```
modification: Change PUT to PATCH — what's the difference?
question: PUT vs PATCH — which replaces the ENTIRE resource?
options: [PUT replaces entirely, PATCH replaces entirely, Both are the same]
correct: 0
explanation: PUT replaces the FULL resource — like sending a full replacement item to the same address. If you omit a field, it's deleted. PATCH modifies only the fields you send — partial update. Sending {"name":"Subham"} via PUT could erase the "job" field. PATCH would keep existing fields intact.

## CONTRAST
label: Request body as String vs Map vs POJO:
codeA:
```java
// String — fragile, no type safety
given().contentType(ContentType.JSON)
    .body("{\"name\": \"Subham\"}")
.when().post("/users");
```
codeB:
```java
// POJO — type-safe, reusable
User user = new User("Subham", "SDET");
given().contentType(ContentType.JSON)
    .body(user)
.when().post("/users");
```
question: Why are POJOs preferred over JSON strings in test frameworks?
options: [Better performance, Compile-time safety + IDE autocomplete, Strings are deprecated, No difference]
correct: 1
explanation: Both set contentType(ContentType.JSON) and pass the body to the post office (POST). But POJOs catch typos at compile time and provide IDE autocomplete — the package contents are validated before you even mail them. JSON strings are like handwritten labels — a missing quote or comma only fails when the post office (server) tries to read it at runtime.

## EXPLAIN_BACK
mode: fill_blank
prompt: Describe the CRUD lifecycle test pattern for a REST resource.
sentence: First _____ creates the resource and captures the ID, then _____ verifies it exists, then _____ modifies it, then _____ removes it, and a final GET confirms _____ status.
blanks: [POST, GET, PUT, DELETE, 404]
distractors: [PATCH, OPTIONS, HEAD, TRACE, 500]

## CONNECT
text: Amazon SDET interviews often ask you to write CRUD tests live:
```java
String id = given().contentType(JSON).body(payload)
    .post("/orders").jsonPath().getString("id");
given().delete("/orders/{id}", id).then().statusCode(204);
given().get("/orders/{id}", id).then().statusCode(404);
```
note: This "create-verify-cleanup" pattern prevents test data pollution. Every test creates its own data and deletes it — tests stay independent and repeatable.
