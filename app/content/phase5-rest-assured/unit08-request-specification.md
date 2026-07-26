---
unit: p5u8
title: Request Specification
teaches: [restassured.request_spec_builder, restassured.reusable_specs, restassured.base_config]
requires: [restassured.given_when_then, restassured.bearer_token, restassured.query_params]
---

## HOOK
question: You have 50 tests that all need the same base URI, auth header, and content type. Do you copy-paste into each test?
```java
// Before: repeated in EVERY test
given().baseUri("https://api.example.com").header("Authorization","Bearer xyz").contentType(JSON)...
```

## FAIL_FIRST
prompt: This spec is built but tests still hit localhost. Why?
```java
RequestSpecification spec = new RequestSpecBuilder()
    .setBaseUri("https://api.example.com")
    .addHeader("Authorization", "Bearer token")
    .build();

@Test
void getUser() {
    given().when().get("/users/1").then().statusCode(200);
}
```
hint: You built the spec but never used it in the test
expected: Add .spec(spec) after given(): given().spec(spec).when().get(...)

## ANALOGY
A RequestSpec is a reusable test TEMPLATE — like a pre-filled form at the doctor's office. Your name, address, insurance are already printed (base URI, auth, headers). Each visit, you only fill in "reason for visit" (the endpoint + specific params). It eliminates duplicated setup — without it, you'd rewrite your address on 50 forms.

## CODE
```java
RequestSpecification baseSpec = new RequestSpecBuilder()
    .setBaseUri("https://reqres.in/api")
    .setContentType(ContentType.JSON)
    .addHeader("Authorization", "Bearer " + token)
    .build();

@Test
void getUser() {
    given()
        .spec(baseSpec)
    .when()
        .get("/users/1")
    .then()
        .statusCode(200);
}
```
highlight: [1, 2, 3, 4, 5, 10]
annotation: RequestSpecBuilder is the template printer — setBaseUri() is the address, setContentType() is the format preference, addHeader() is the insurance info. .build() finalizes the form. In the test, .spec(baseSpec) applies the pre-filled template so you only add what's unique — the specific endpoint and assertions.

## BREAK_IT
setup:
```java
RequestSpecification spec = new RequestSpecBuilder()
    .setBaseUri("https://api.example.com")
    .setContentType(ContentType.JSON)
    .build();

given().spec(spec).contentType(ContentType.XML).post("/data");
```
modification: The spec sets JSON but the test overrides with XML. Which wins?
question: What Content-Type is actually sent?
options: [JSON (spec wins), XML (test override wins), Error — conflict]
correct: 1
explanation: Test-level settings OVERRIDE spec settings. The template is a default, not a lock — like crossing out "insurance: BlueCross" on the form and writing a new one. This lets you have a JSON template but override for that one XML endpoint.

## CONTRAST
label: Global config vs RequestSpec:
codeA:
```java
// Global — affects ALL tests in the class
@BeforeAll
static void setup() {
    RestAssured.baseURI = "https://api.example.com";
    RestAssured.basePath = "/api/v1";
}
```
codeB:
```java
// RequestSpec — explicit template per test/group
RequestSpecification spec = new RequestSpecBuilder()
    .setBaseUri("https://api.example.com")
    .setBasePath("/api/v1")
    .build();
// used via given().spec(spec)
```
question: When would you use RequestSpec over global config?
options: [Tests hit multiple different APIs, All tests hit the same API, Spec is slower, Global is deprecated]
correct: 0
explanation: Global config is like having ONE pre-filled form for the whole office — fine when all tests visit the same doctor. RequestSpec lets you create separate templates — adminSpec, userServiceSpec, paymentSpec — so each test picks its own form via .spec(). When your suite tests multiple services, you need multiple templates, not one global setting.

## EXPLAIN_BACK
mode: pick_best
prompt: What problem does RequestSpecBuilder solve in a REST Assured test suite?
options: [Eliminates duplicated setup by creating a reusable template with base URI and headers that tests apply via .spec(), Improves test execution speed by caching HTTP connections, Automatically generates test data for each request, Replaces the need for @BeforeAll setup methods entirely]
correct: 0

## CONNECT
text: At Amazon, test frameworks define specs per service:
```java
public class BaseApiTest {
    protected static RequestSpecification orderService;
    protected static RequestSpecification paymentService;

    @BeforeAll static void init() {
        orderService = new RequestSpecBuilder()
            .setBaseUri(Config.get("order.service.url"))
            .addHeader("x-api-key", Config.get("order.api.key"))
            .build();
    }
}
```
note: Professional test frameworks have a spec-per-service pattern. Tests inherit from BaseApiTest and pick the right spec. This is the architecture interviewers expect you to describe.
