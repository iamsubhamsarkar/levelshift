---
unit: p7u9
title: Selenium Grid & CI/CD Integration
teaches: [selenium.grid, selenium.remote-webdriver, selenium.docker-grid, selenium.ci-pipeline]
requires: [selenium.webdriver-setup, selenium.testng-integration, selenium.parallel-selenium, apistrategy.ci-execution]
---

## HOOK
question: Your laptop runs 5 Chrome instances before it freezes. But you have 200 UI tests. Selenium Grid lets you run tests on 50 machines simultaneously — without installing Chrome on your laptop.
```java
// Your code runs HERE (laptop)
// Browsers run THERE (Grid nodes — cloud machines with Chrome/Firefox)
// Same test code. Massive parallelism.
```

## FAIL_FIRST
prompt: Run your test on a REMOTE browser instead of local Chrome.
```java
WebDriver driver = new ChromeDriver(); // runs locally
driver.get("https://example.com");
// How do you point this to a remote Grid server?
// ChromeDriver() only uses your local machine...
```
hint: Replace ChromeDriver with RemoteWebDriver + URL of the Grid hub.
expected: Use new RemoteWebDriver(hubUrl, capabilities) to connect to Grid

## ANALOGY
Selenium Grid is like a taxi dispatch center. You (the test) say "I need a Chrome browser." The Hub (dispatcher) finds an available Node (taxi) with Chrome installed and connects you. You don't care WHICH machine runs your browser — you just drive (run tests). The Hub handles load balancing, queuing, and routing.

## CODE
```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless");
URL gridUrl = new URL("http://grid-hub:4444");
WebDriver driver = new RemoteWebDriver(gridUrl, options);
driver.get("https://example.com");
assertEquals(driver.getTitle(), "Example Domain");
driver.quit();
```
highlight: [3, 4]
annotation: `RemoteWebDriver` sends commands over HTTP to the Grid Hub at port 4444. The Hub routes them to a Node with matching capabilities (Chrome in this case). Your test code is IDENTICAL to local execution — only the driver initialization changes from `new ChromeDriver(options)` to `new RemoteWebDriver(gridUrl, options)`. This makes local↔Grid switching trivial with a config flag or environment variable. Use Allure for CI-integrated reporting. Set a failure threshold (e.g., <5% failures = pass) to prevent flaky tests from blocking deployments.

## BREAK_IT
setup:
```java
URL gridUrl = new URL("http://grid-hub:4444");
WebDriver driver = new RemoteWebDriver(gridUrl, new ChromeOptions());
driver.get("https://example.com");
```
modification: The Grid has 3 nodes, each with max 2 Chrome sessions. You launch 10 tests simultaneously.
question: What happens to the extra 4 tests?
options: [They fail immediately, They queue and wait for a free slot, Grid crashes, Tests share sessions]
correct: 1
explanation: Grid 4 queues excess requests. Tests wait until a node slot becomes available. If the queue timeout expires (default 5 min), THEN they fail. Plan capacity: total parallel tests ≤ total Grid node sessions. Use Docker to auto-scale nodes on demand.

## CONTRAST
label: Local ChromeDriver vs Docker Selenium Grid
codeA:
```java
// Local: simple but doesn't scale
WebDriver driver = new ChromeDriver();
// Limited by YOUR machine's RAM/CPU
// Only one Chrome version available
```
codeB:
```yaml
# docker-compose.yml: Grid in 3 lines
services:
  hub: { image: selenium/hub:4.10 }
  chrome: { image: selenium/node-chrome:4.10,
    environment: [SE_EVENT_BUS_HOST=hub],
    deploy: { replicas: 5 } }
```
question: What's the biggest advantage of Docker-based Grid?
options: [Faster tests, Reproducible environment across CI, Cheaper, Simpler code]
correct: 1
explanation: Docker ensures every CI run uses the exact same Chrome version and configuration — no "works on my machine" issues. Tests use `RemoteWebDriver(gridUrl, options)` to send commands to the Hub, which routes them to Nodes with matching capabilities. Scaling is just changing `replicas: 5` to `replicas: 20`. If more tests arrive than available sessions, Grid queues them until a slot opens.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do you integrate Selenium tests into a CI/CD pipeline?
sentence: Tests connect to Selenium Grid via _____ with the hub URL, run in parallel using TestNG with ThreadLocal drivers, attach screenshots to _____ reports on failure, and the pipeline gates deployment if pass rate falls below the _____.
blanks: [RemoteWebDriver, Allure, threshold]
distractors: [ChromeDriver, JUnit, timeout]

## CONNECT
text: At Amazon, UI test infrastructure runs on Grid at scale:
```yaml
# Pipeline test stage
- spin up Selenium Grid (10 Chrome nodes)
- run 200 tests parallel (thread-count=10)
- collect Allure report + screenshots
- tear down Grid
- gate: fail pipeline if pass rate < 95%
```
note: As an SDET-1, you'll own the CI integration for your team's UI tests. This means configuring the Grid, tuning parallelism, maintaining Docker images, and ensuring the pipeline gives fast, reliable feedback. A broken CI pipeline blocks ALL deployments — it's a tier-1 responsibility.
