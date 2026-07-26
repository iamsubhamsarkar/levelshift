---
unit: p6u4
title: CI/CD Integration for API Tests
teaches: [apistrategy.ci-execution, apistrategy.parallel-tests, apistrategy.test-tagging]
requires: [restassured.requests, apistrategy.positive-negative, apistrategy.dataprovider]
---

## HOOK
question: Your test suite takes 45 minutes to run. A developer pushes code and waits... and waits. They stop running tests. How do you make 200 API tests run in under 5 minutes?
```xml
<!-- 200 tests × 1 second each = 200 seconds sequentially -->
<!-- But what if we run them 10 at a time? -->
<!-- 200 / 10 = 20 seconds. That's the power of parallel execution. -->
```

## FAIL_FIRST
prompt: Configure Maven to run only tests tagged as "smoke" — not the full suite.
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <!-- How do you tell Maven: only run @Tag("smoke") tests? -->
</plugin>
```
hint: Surefire's `<groups>` element filters by TestNG groups or JUnit tags.
expected: Only smoke-tagged tests execute in CI

## ANALOGY
CI test execution is like an assembly line in a factory. Without organization, you'd test every car part individually — slow. With tagging, you create lanes: "smoke tests" go through the fast lane (every commit), "regression tests" go through the slow lane (nightly). Parallel execution adds more workers to each lane. The build pipeline is the conveyor belt — it runs automatically when code arrives.

## CODE
```java
// TestNG XML for parallel execution with groups
// testng.xml
// <suite name="API" parallel="methods" thread-count="10">
//   <test name="Smoke"><groups><run><include name="smoke"/></run></groups>
//     <classes><class name="UserApiTest"/></classes></test></suite>

@Test(groups = "smoke")
public void testHealthCheck() { get("/health").then().statusCode(200); }

@Test(groups = "regression")
public void testComplexFlow() { /* longer test */ }
```
highlight: [7, 8]
annotation: `groups` tag tests into categories. CI runs `smoke` on every commit (fast feedback in under 2 minutes), `regression` nightly (comprehensive coverage). `parallel="methods"` runs test methods concurrently — 10 threads means 10 tests execute simultaneously. Tests MUST be independent with no shared mutable state for parallel execution to work correctly.

## BREAK_IT
setup:
```java
static int counter = 0;

@Test(groups = "smoke") void testA() { counter++; assertEquals(counter, 1); }
@Test(groups = "smoke") void testB() { counter++; assertEquals(counter, 2); }
```
modification: Run these tests with `parallel="methods" thread-count="2"`.
question: What happens to these tests in parallel?
options: [Both pass, Random failures, Both always fail, Compile error]
correct: 1
explanation: Shared mutable state (`static int counter`) causes race conditions in parallel execution. Both threads increment simultaneously — counter might be 2 when testA checks it. Rule: parallel tests MUST be independent. No shared state, no execution order dependencies.

## CONTRAST
label: Maven Surefire vs Gradle Test Task
codeA:
```xml
<!-- Maven pom.xml -->
<plugin>
  <artifactId>maven-surefire-plugin</artifactId>
  <configuration>
    <groups>smoke</groups>
    <parallel>methods</parallel>
    <threadCount>5</threadCount>
  </configuration>
</plugin>
```
codeB:
```groovy
// Gradle build.gradle
test {
    useTestNG()
    maxParallelForks = 5
    include '**/*Smoke*'
    testLogging { events "passed", "failed" }
}
```
question: Which build tool are you more likely to use at Amazon?
options: [Maven, Gradle, Both are common, Neither]
correct: 2
explanation: Both tools configure the same concepts — parallelism via thread count, filtering by groups or tags, and test report generation. Maven uses `<groups>` and `<parallel>` in Surefire configuration; Gradle uses `maxParallelForks` and `include`. Tests must be independent with no shared state for parallel execution to work in either tool.

## EXPLAIN_BACK
mode: pick_best
prompt: Why can't you just run all tests on every commit?
options: [A tiered strategy uses groups — smoke tests run on every commit for fast feedback while regression tests run nightly, All tests should always run on every commit, Running all tests is faster than filtering, Test tagging is only for documentation]
correct: 0

## CONNECT
text: At Amazon, pipelines run tests at multiple stages:
```
Commit → Smoke tests (2 min) → Deploy to beta
Beta → Integration tests (10 min) → Deploy to gamma
Gamma → Full regression (30 min) → Deploy to prod
```
note: As an SDET-1, you'll configure test execution in your team's pipeline. You'll tag tests appropriately, ensure parallel execution works (no shared state), and maintain test execution time under the pipeline's SLA. A slow test suite that blocks deployments is a high-priority bug.
