---
unit: p5u10
title: Framework Structure
teaches: [restassured.base_test_class, restassured.config_management, restassured.ci_integration]
requires: [restassured.request_spec_builder, restassured.extract_path, restassured.bearer_token]
---

## HOOK
question: You have 200 API tests. Where does config go? How do tests share setup? What runs in CI?
```
src/test/java/
  ├── base/BaseApiTest.java      ← shared config
  ├── config/TestConfig.java     ← env-specific values
  ├── models/User.java           ← POJOs
  └── tests/UserApiTest.java     ← actual tests
```

## FAIL_FIRST
prompt: This framework breaks when switching from QA to staging. Why?
```java
public class UserTest {
    @BeforeAll static void setup() {
        RestAssured.baseURI = "https://qa.api.example.com";
    }
    @Test void getUser() { ... }
}
```
hint: The base URI is hardcoded — how do you switch environments?
expected: Externalize config: baseURI = System.getProperty("base.url", "https://qa.api.example.com"). Run with -Dbase.url=https://staging.api.example.com to switch environments without code changes.

## ANALOGY
A test framework is a factory floor. BaseApiTest is the assembly line itself (shared setup). TestConfig is the control panel (environment knobs). POJOs are the molds (data shapes). Test classes are workers on the line — they focus on their ONE job because the infrastructure handles everything else. Without this structure, each worker builds their own tools from scratch.

## CODE
```java
public abstract class BaseApiTest {
    protected static RequestSpecification spec;

    @BeforeAll static void globalSetup() {
        String baseUrl = System.getProperty("base.url", "https://qa.api.com");
        spec = new RequestSpecBuilder()
            .setBaseUri(baseUrl)
            .setContentType(ContentType.JSON)
            .addHeader("Authorization", "Bearer " + getToken())
            .build();
    }

    private static String getToken() {
        return System.getProperty("api.token", "default-qa-token");
    }
}

// Tests extend the base — workers on the assembly line
public class UserApiTest extends BaseApiTest {
    @Test void getUser() {
        given().spec(spec).get("/users/1").then().statusCode(200);
    }
}
```
highlight: [1, 5, 6, 7, 8, 9, 10, 19, 21]
annotation: Abstract base class (line 1) is the assembly line — never instantiated directly. System.getProperty() (line 5) reads from the control panel — config comes from CI or command line, not hardcoded. RequestSpecBuilder (lines 6-10) creates the shared template. Test classes (line 19) extend BaseApiTest and get spec for free — workers focus only on their job (line 21).

## BREAK_IT
setup:
```java
class UserTest extends BaseApiTest {
    @Test void createUser() {
        String id = given().spec(spec).body(user)
            .post("/users").jsonPath().getString("id");
        // test ends without cleanup
    }
}
```
modification: Run this test 100 times in CI
question: What problem emerges?
options: [Test data pollution — 100 orphaned users, No problem — APIs handle it, Memory leak, Slow response times]
correct: 0
explanation: Without cleanup, each run creates garbage data — like 100 workers leaving their scraps on the assembly line. Use @AfterEach to delete created resources, or use a test data factory with built-in cleanup. CI suites run thousands of times — leftover data causes flaky tests and obscures real failures.

## CONTRAST
label: Hardcoded config vs externalized config:
codeA:
```java
// Hardcoded — breaks on env switch
RestAssured.baseURI = "https://qa.api.com";
String token = "hardcoded-token-here";
```
codeB:
```java
// Externalized — reads from control panel
RestAssured.baseURI = System.getProperty("base.url");
String token = System.getProperty("api.token");
// Run: mvn test -Dbase.url=https://staging.api.com
```
question: Why is externalized config critical for CI pipelines?
options: [CI runs against multiple environments without code changes, Hardcoded is faster, Properties files are required, No real difference]
correct: 0
explanation: CI pipelines run the same assembly line against QA, staging, and pre-prod. System.getProperty() reads from the control panel — the pipeline passes environment-specific knobs at runtime (-Dbase.url=...). Hardcoded values mean a separate assembly line per environment — unmaintainable. The control panel pattern from the CODE section lets one factory serve all environments.

## EXPLAIN_BACK
mode: pick_best
prompt: What is the role of an abstract BaseApiTest class in a REST Assured framework?
options: [Centralizes shared setup like RequestSpec and token management so test classes inherit infrastructure and focus only on test logic, Runs tests in parallel across multiple threads for faster execution, Replaces the need for RequestSpecBuilder entirely, Handles database connections and test data generation automatically]
correct: 0

## CONNECT
text: Amazon's API test frameworks follow this exact layered pattern:
```java
// CI command — same tests, different environments
// mvn test -Pstaging -Dregion=us-west-2

// Base class handles per-region config, auth rotation,
// retry logic for flaky networks, and test isolation
public class OrderServiceTest extends BaseApiTest {
    @Test void placeOrder() {
        given().spec(orderSpec).body(testOrder)
            .post("/orders").then().statusCode(201);
    }
}
```
note: Framework architecture is the #1 SDET interview topic. They don't just want you to write tests — they want you to design the infrastructure that makes 500 tests maintainable. Base class + config + specs + cleanup = your answer.
