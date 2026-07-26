---
unit: p5u3
title: Your First GET Request
teaches: [restassured.given_when_then, restassured.static_imports, restassured.base_uri]
requires: [http.methods, http.status_codes, http.rest_principles]
---

## HOOK
question: What if testing an API was as readable as writing English?
```java
given().when().get("/users/1").then().statusCode(200);
```

## FAIL_FIRST
prompt: This test compiles but fails at runtime. Why?
```java
import io.restassured.RestAssured;

public class FirstTest {
    @Test
    void getUser() {
        get("/users/1").then().statusCode(200);
    }
}
```
hint: Where is REST Assured sending this request to?
expected: No base URI set — it defaults to localhost:8080. You need RestAssured.baseURI = "https://api.example.com"

## ANALOGY
REST Assured's pattern is a courtroom trial. GIVEN sets the scene (evidence = headers, auth, params). WHEN is the action (the charge = HTTP method + URL). THEN is the verdict (assertions = status code, body checks). You wouldn't skip to the verdict without presenting evidence and stating the charge.

## CODE
```java
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@BeforeAll
static void setup() {
    baseURI = "https://reqres.in/api";
}

@Test
void getUserReturns200() {
    given()
    .when()
        .get("/users/1")
    .then()
        .statusCode(200)
        .body("data.first_name", equalTo("George"));
}
```
highlight: [1, 2, 6, 11, 12, 13, 14, 15, 16]
annotation: Static imports (line 1-2) make the DSL readable — given(), get(), equalTo() all come from them. baseURI (line 6) is set ONCE in setup, so all tests use it. The given-when-then chain (lines 11-16) reads like the courtroom trial: set the scene, perform the action, deliver the verdict.

## BREAK_IT
setup:
```java
given()
.when()
    .get("/users/1")
.then()
    .statusCode(200);
```
modification: Change the endpoint to /users/9999 (non-existent user)
question: What status code will you actually get?
options: [200 with empty body, 404 Not Found, 500 Internal Server Error]
correct: 1
explanation: A well-designed REST API returns 404 for non-existent resources. Your test fails with "Expected 200 but got 404." This is the power of REST Assured — immediate feedback on unexpected responses.

## CONTRAST
label: With static imports vs without:
codeA:
```java
// Clean — with static imports
given()
.when()
    .get("/users/1")
.then()
    .statusCode(200);
```
codeB:
```java
// Verbose — without static imports
RestAssured.given()
.when()
    .get("/users/1")
.then()
    .statusCode(200);
```
question: Why do we prefer static imports in REST Assured?
options: [Better performance, Readability — reads like English, Required by the framework, Fewer imports needed]
correct: 1
explanation: Both compile and run identically. Static imports remove the "RestAssured." prefix noise — the test reads like the courtroom trial: "given (the scene), when I GET /users/1, then status code is 200." This readable DSL is REST Assured's killer feature, made possible by the static imports shown in the CODE section.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain the given-when-then pattern in REST Assured.
sentence: In REST Assured, _____ sets up preconditions like headers and auth, _____ performs the HTTP method and endpoint call, and _____ asserts the response with status code and body checks.
blanks: [given(), when(), then()]
distractors: [setup(), execute(), verify(), before(), request(), assert()]

## CONNECT
text: At Amazon, service integration tests follow this exact pattern:
```java
given()
    .header("x-amz-request-id", UUID.randomUUID())
.when()
    .get("/products/{sku}", "B00ABC123")
.then()
    .statusCode(200)
    .body("availability", equalTo("IN_STOCK"));
```
note: Amazon SDETs write hundreds of these daily. The pattern never changes — only the setup, endpoint, and assertions vary. Master this structure and you can test ANY API.
