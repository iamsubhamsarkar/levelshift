---
unit: p6u3
title: Contract Testing
teaches: [apistrategy.schema-validation, apistrategy.contract-testing, apistrategy.pact-basics]
requires: [restassured.requests, restassured.assertions, apistrategy.positive-negative]
---

## HOOK
question: The frontend team says your API suddenly broke their app. You say "I didn't change anything!" But you renamed a JSON field from `userName` to `user_name`. Whose fault is it?
```json
// Before: {"userName": "John", "age": 25}
// After:  {"user_name": "John", "age": 25}
// Frontend code: response.data.userName → undefined
```

## FAIL_FIRST
prompt: Validate that a response ALWAYS contains an "id" field that is an integer.
```java
@Test
public void testResponseStructure() {
    given()
        .get("/users/1")
    .then()
        .statusCode(200);
    // How do you enforce that "id" MUST be integer?
    // What if someone adds a field? Removes one?
}
```
hint: JSON Schema defines the "contract" — the structure every response must follow.
expected: Validation against a schema file

## ANALOGY
A contract test is like a legal contract between two businesses. The producer (API server) promises "I will always return these fields in this format." The consumer (frontend/client) promises "I only need these fields." If either side breaks the agreement, the contract test CATCHES it before production. It's not testing behavior — it's testing the SHAPE of communication.

## CODE
```java
@Test
public void testUserSchemaContract() {
    given()
        .get("/users/1")
    .then()
        .assertThat()
        .body(matchesJsonSchemaInClasspath("user-schema.json"));
}
```
highlight: [6]
annotation: `matchesJsonSchemaInClasspath` validates the response body against a JSON Schema file in src/test/resources. The schema defines required fields, types, and formats — it is the contract between producer and consumer. If the API removes a field or changes a type, this test fails immediately — before any consumer is affected. Unlike integration tests that verify behavior, schema validation verifies the shape of communication. The schema acts as a shared contract between producer and consumer — if the shape changes, the test fails immediately.

## BREAK_IT
setup:
```java
// user-schema.json: {"required":["id","name"],"properties":{"id":{"type":"integer"}}}
given().get("/users/1").then()
    .body(matchesJsonSchemaInClasspath("user-schema.json"));
```
modification: The API team adds a new optional field `"avatar": "url"`. Does this test fail?
question: Does adding a NEW optional field break schema validation?
options: [Yes - unknown fields fail, No - only required/type changes fail, Depends on schema settings]
correct: 2
explanation: By default, JSON Schema allows additional properties. If you set `"additionalProperties": false` in your schema, new fields WILL break the test. Choose based on your contract strictness — strict schemas catch accidental additions, lenient schemas allow evolution.

## CONTRAST
label: Schema Validation vs Pact Contract Testing
codeA:
```java
// Schema: producer-side validation
// "Does MY response match MY schema?"
given().get("/users/1").then()
    .body(matchesJsonSchemaInClasspath("schema.json"));
```
codeB:
```java
// Pact: consumer-driven contract
// "Does the producer return what I (consumer) NEED?"
@Pact(consumer = "Frontend")
public RequestResponsePact userPact(PactDslWithProvider builder) {
    return builder.given("user exists")
        .uponReceiving("get user").path("/users/1")
        .willRespondWith().status(200).body("{\"id\":1}").toPact();
}
```
question: Who defines the contract in Pact?
options: [The producer (API server), The consumer (client/frontend), Both together, Neither]
correct: 1
explanation: Pact is consumer-driven — the consumer defines "I need these fields" and the producer verifies it can fulfill that contract. Schema validation is producer-side — `matchesJsonSchemaInClasspath` checks the response against the producer's own schema file. Pact flips this by having clients specify their needs, ensuring producers never break what consumers actually use.

## EXPLAIN_BACK
mode: fill_blank
prompt: Why do you need contract tests if you already have integration tests?
sentence: Integration tests verify behavior at a point in time, but _____ tests verify the agreement between services over time by validating the _____ of communication, and Pact runs without real HTTP calls because the contract is _____ between producer and consumer.
blanks: [contract, shape, shared]
distractors: [performance, speed, encrypted]

## CONNECT
text: At Amazon, microservices communicate via APIs constantly. When one team changes their API shape:
```
Team A: Changes response field name
Team A's tests: ✅ PASS (they updated their tests)
Team B's code:  💥 BREAKS in production

With contract tests:
Team A's build: ❌ FAIL - breaks Team B's contract
→ Caught BEFORE deployment
```
note: As an SDET-1, you'll maintain schema contracts for your service's API. When a developer makes a breaking change, YOUR contract test catches it in the build pipeline — preventing production incidents that would require a COE.
