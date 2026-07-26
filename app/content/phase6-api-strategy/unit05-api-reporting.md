---
unit: p6u5
title: API Test Reporting & Logging
teaches: [apistrategy.allure-reports, apistrategy.logging, apistrategy.failure-analysis]
requires: [restassured.requests, apistrategy.ci-execution, apistrategy.positive-negative]
---

## HOOK
question: Your nightly test run shows "47 tests failed." Your manager asks "What broke?" You open the report and see... just red X marks. No logs, no request/response bodies, no context. How long until you find the bug?
```
❌ testCreateUser - AssertionError: expected 201 but got 500
// Cool. But WHY did it return 500? What was the request body?
```

## FAIL_FIRST
prompt: Add logging to capture the FULL request and response when a test fails.
```java
@Test
public void testCreateUser() {
    given()
        .body("{\"name\":\"John\"}")
        .post("/users")
    .then()
        .statusCode(201);
    // When this fails, you see NOTHING about what was sent/received.
    // How do you capture that context?
}
```
hint: RestAssured has `.log().all()` and Allure has `@Step` annotations.
expected: Full request/response visible in failure reports

## ANALOGY
A test report without context is like a doctor saying "you're sick" without running tests. Allure reports are like a complete medical chart — symptoms (assertion failure), history (request sent), lab results (response received), and diagnosis (root cause). Good reporting means ANY team member can diagnose a failure without re-running the test or asking you.

## CODE
```java
@Test
@Description("Verify user creation returns 201")
@Severity(SeverityLevel.CRITICAL)
public void testCreateUser() {
    Response resp = given().filter(new AllureRestAssured())
        .body("{\"name\":\"John\"}").post("/users");
    Allure.addAttachment("Response", resp.asString());
    assertEquals(resp.statusCode(), 201);
}
```
highlight: [5, 7]
annotation: `AllureRestAssured()` filter automatically captures request/response in Allure reports. `addAttachment` lets you attach extra context — response bodies, screenshots, environment info. When this test fails, the Allure report shows EXACTLY what was sent and received.

## BREAK_IT
setup:
```java
given()
    .log().all()  // logs to console
    .post("/users")
.then()
    .statusCode(201);
```
modification: Tests run in CI with 50 parallel threads. Where do these logs GO?
question: What's wrong with `.log().all()` in CI?
options: [Console logs get interleaved and unreadable, It slows tests down, Nothing wrong, It causes test failures]
correct: 0
explanation: With parallel execution, console logs from 50 threads mix together — you can't tell which request belongs to which test. Use structured logging (Allure attachments, test listeners) that attach logs PER TEST instead of dumping to shared console output.

## CONTRAST
label: Allure Reports vs ExtentReports
codeA:
```java
// Allure: annotation-driven, integrates with CI
@Step("Create user with name: {name}")
public void createUser(String name) {
    given().body("{\"name\":\"" + name + "\"}")
        .post("/users").then().statusCode(201);
}
```
codeB:
```java
// ExtentReports: programmatic, custom dashboards
ExtentTest test = extent.createTest("Create User");
Response r = given().body("{\"name\":\"John\"}").post("/users");
test.log(Status.INFO, "Response: " + r.asString());
test.log(r.statusCode()==201 ? Status.PASS : Status.FAIL, "Status check");
```
question: Which is better for a large SDET team?
options: [Allure - less boilerplate and CI plugins, ExtentReports - more control, Depends on team needs, Neither]
correct: 0
explanation: Allure uses `@Step` annotations and the `AllureRestAssured()` filter to capture request/response automatically with minimal code. It attaches context via `addAttachment` and integrates with CI out of the box. ExtentReports requires programmatic logging for every action. For large teams, Allure's annotation-driven approach means less boilerplate and consistent reporting across all test classes.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do you debug a test that passed yesterday and failed today with no code change?
sentence: I check the _____ report which shows the exact request body and full response received, the environment state, and the _____ tab showing when it last passed — common causes include test data pollution from _____ runs.
blanks: [Allure, history, parallel]
distractors: [JUnit, summary, sequential]

## CONNECT
text: At Amazon, test reports are reviewed daily in operational dashboards:
```
Test Suite: UserService API
Pass Rate: 98.2% (196/200)
Failed: testRateLimit (timeout), testBulkCreate (500)
Trend: ↓ from 99.5% since Tuesday
Action: Rate limit test needs longer timeout for gamma
```
note: As an SDET-1, your test reports are a SERVICE HEALTH SIGNAL. When tests fail, on-call engineers read YOUR reports to decide if it's a test issue or a real service bug. Clear reporting with request/response context saves hours of debugging during incidents.
