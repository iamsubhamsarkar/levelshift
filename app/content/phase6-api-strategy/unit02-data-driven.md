---
unit: p6u2
title: Data-Driven API Testing
teaches: [apistrategy.dataprovider, apistrategy.external-data, apistrategy.parameterized]
requires: [restassured.requests, restassured.assertions, apistrategy.positive-negative]
---

## HOOK
question: You need to test a login API with 50 different username/password combinations. Do you write 50 separate test methods?
```java
@Test void testLogin1() { /* user1/pass1 */ }
@Test void testLogin2() { /* user2/pass2 */ }
// ... 48 more? Really?
```

## FAIL_FIRST
prompt: Run the same test with 3 different user IDs without duplicating code.
```java
@Test
public void testGetUser() {
    int userId = 1; // How do we run this for 1, 2, 3?
    given()
        .get("/users/" + userId)
    .then()
        .statusCode(200);
}
```
hint: TestNG's @DataProvider feeds different inputs to the same test method.
expected: One method, multiple executions with different data

## ANALOGY
A DataProvider is like a vending machine's input tray. You load it with rows of test data, and the test method is the machine — it processes each row identically. Same machine, different inputs, different outputs to verify. You don't build a separate machine for every candy bar.

## CODE
```java
@DataProvider(name = "userIds")
public Object[][] userData() {
    return new Object[][] {{1, 200}, {2, 200}, {999, 404}};
}

@Test(dataProvider = "userIds")
public void testGetUser(int id, int expectedStatus) {
    given().get("/users/" + id).then().statusCode(expectedStatus);
}
```
highlight: [1, 6]
annotation: @DataProvider returns a 2D array. Each inner array becomes one test execution. The test method parameters MUST match the array columns in order. TestNG runs the test once per row — 3 rows = 3 test executions in reports.

## BREAK_IT
setup:
```java
@DataProvider(name = "data")
public Object[][] data() {
    return new Object[][] {{"admin", 200}, {"", 400}};
}
@Test(dataProvider = "data")
public void test(String user, int code) { /* ... */ }
```
modification: What if the DataProvider name doesn't match — `@Test(dataProvider = "wrongName")`?
question: What happens at runtime?
options: [Test skips silently, TestNG throws an exception, Test runs with null values]
correct: 1
explanation: TestNG throws `org.testng.TestNGException: Method test requires a @DataProvider named: wrongName`. The name string must match EXACTLY. This is a common mistake — always copy-paste the name.

## CONTRAST
label: Inline DataProvider vs External JSON
codeA:
```java
@DataProvider
public Object[][] inlineData() {
    return new Object[][] {{"a@b.com", 201}, {"bad", 400}};
}
```
codeB:
```java
@DataProvider
public Object[][] jsonData() throws Exception {
    String json = new String(Files.readAllBytes(Paths.get("testdata.json")));
    JSONArray arr = new JSONArray(json);
    return parseToArray(arr); // convert to Object[][]
}
```
question: When would you prefer external JSON over inline data?
options: [When data changes frequently, When data is less than 5 rows, When tests run in CI, Always use inline]
correct: 0
explanation: External files let teams update test data without modifying code. The DataProvider still returns a 2D array — each row feeds the test method parameters in order. Use inline for small, stable datasets (3-5 rows). Use external JSON when data changes often or is shared across multiple test methods.

## EXPLAIN_BACK
mode: pick_best
prompt: Why is DataProvider superior to a for-loop inside the test method?
options: [Each DataProvider row becomes a separate test in reports with independent pass/fail, DataProvider is faster to write, For-loops cause compile errors in TestNG, DataProvider uses less memory]
correct: 0

## CONNECT
text: At Amazon, SDETs test APIs across multiple regions, account types, and permission levels:
```java
@DataProvider
public Object[][] regionData() {
    return new Object[][] {
        {"us-east-1", "admin", 200},
        {"eu-west-1", "readonly", 403},
        {"ap-south-1", "expired", 401}
    };
}
```
note: In your SDET-1 role, you'll maintain test data files that cover multiple AWS regions and customer account types. DataProviders keep your test logic clean while the data file grows with each new edge case discovered in production.
