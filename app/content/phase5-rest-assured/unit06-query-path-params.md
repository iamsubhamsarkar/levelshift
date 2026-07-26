---
unit: p5u6
title: Query & Path Parameters
teaches: [restassured.query_params, restassured.path_params, restassured.parameterized_tests]
requires: [restassured.given_when_then, http.resources]
---

## HOOK
question: What's the difference between `/users/1` and `/users?id=1`? When do you use which?
```java
given().pathParam("id", 1).get("/users/{id}");       // path param
given().queryParam("page", 2).get("/users");         // query param
```

## FAIL_FIRST
prompt: This test throws IllegalArgumentException. Why?
```java
given()
.when()
    .get("/users/{userId}")
.then()
    .statusCode(200);
```
hint: You used a path parameter placeholder but never provided its value
expected: Add .pathParam("userId", 1) in the given() section, or use .get("/users/{userId}", 1) shorthand

## ANALOGY
Path params are like a house ADDRESS — /street/42 identifies a specific house. You can't list all houses at /street/42. Query params are like FILTERS at a real estate website — /houses?bedrooms=3&price_max=500k narrows the list. Path = identity, Query = filtering/pagination.

## CODE
```java
// Path param — identifies a specific resource (the house address)
given()
    .pathParam("id", 1)
.when()
    .get("/users/{id}")
.then()
    .statusCode(200);

// Query params — filter/paginate a collection (the website filters)
given()
    .queryParam("page", 2)
    .queryParam("per_page", 5)
.when()
    .get("/users")
.then()
    .body("data", hasSize(5));
```
highlight: [3, 5, 11, 12]
annotation: pathParam("id", 1) fills the {id} placeholder in the URL path — this is the house address identifying ONE resource. queryParam("page", 2) appends ?page=2 to the URL — these are the website filters that narrow a collection. REST Assured handles URL encoding automatically for both.

## BREAK_IT
setup:
```java
given()
    .queryParam("page", 1)
.when()
    .get("/users")
.then()
    .body("data", hasSize(6));
```
modification: Change queryParam("page", 1) to queryParam("page", 9999)
question: What happens with a page number beyond the data?
options: [Empty array returned, 404 Not Found, 500 Server Error]
correct: 0
explanation: Most APIs return 200 with an empty data array for out-of-range pages — they don't throw errors. Your hasSize(6) assertion fails with "expected 6 but was 0". Always test boundary cases like empty pages.

## CONTRAST
label: Inline path param vs named path param:
codeA:
```java
// Inline — quick and simple
given()
.when()
    .get("/users/{id}", 1)
.then()
    .statusCode(200);
```
codeB:
```java
// Named — explicit and readable
given()
    .pathParam("id", 1)
.when()
    .get("/users/{id}")
.then()
    .statusCode(200);
```
question: When is the named approach better?
options: [Multiple path params in one URL, Single param tests, They're always equivalent, Named is deprecated]
correct: 0
explanation: For a URL with multiple addresses like /users/{userId}/orders/{orderId}, inline .get(url, 1, 42) is confusing — which number is which house? Named pathParam("userId", 1).pathParam("orderId", 42) is self-documenting — each address is labeled, just like a house number on a mailbox.

## EXPLAIN_BACK
mode: pick_best
prompt: What is the purpose of queryParam() in REST Assured?
options: [Appends ?key=value filters to the URL for narrowing a collection, Fills {placeholder} values in the URL path to identify a resource, Sets HTTP headers on the request, Defines the request body content]
correct: 0

## CONNECT
text: Amazon services use complex nested path params:
```java
given()
    .pathParam("marketplaceId", "ATVPDKIKX0DER")
    .pathParam("sellerId", "A1B2C3D4E5")
    .queryParam("status", "SHIPPED")
    .queryParam("createdAfter", "2024-01-01")
.when()
    .get("/marketplaces/{marketplaceId}/sellers/{sellerId}/orders");
```
note: Real APIs have deeply nested resources. Named path params + query filters let you build readable tests for complex endpoints without string concatenation.
