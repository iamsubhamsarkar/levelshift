---
unit: p5u7
title: Authentication in API Tests
teaches: [restassured.basic_auth, restassured.bearer_token, restassured.oauth2]
requires: [restassured.given_when_then, http.headers]
---

## HOOK
question: Why does this request return 401 when the endpoint clearly exists?
```java
given().when().get("/secure/users").then().statusCode(401); // Unauthorized!
```

## FAIL_FIRST
prompt: This test should work — the credentials are correct. Why does it fail?
```java
given()
    .header("Authorization", "admin:password123")
.when()
    .get("/secure/profile")
.then()
    .statusCode(200);
```
hint: Basic Auth requires a specific format with Base64 encoding
expected: Use .auth().basic("admin", "password123") or header value must be "Basic " + Base64("admin:password123"). Raw credentials in the header won't work.

## ANALOGY
Authentication is like airport security. Basic Auth is showing your passport (credentials sent every time — simple but exposed). Bearer Token is a boarding pass (issued once after ID check, shown at every gate). OAuth2 is the full check-in process — you prove identity once, get a token, and use it everywhere without re-proving.

## CODE
```java
// Basic Auth — shows passport every time (auto-encodes to Base64)
given()
    .auth().basic("admin", "password123")
.when()
    .get("/secure/profile")
.then()
    .statusCode(200);

// Bearer Token — shows boarding pass at each gate
given()
    .header("Authorization", "Bearer " + token)
.when()
    .get("/secure/users")
.then()
    .statusCode(200);

// OAuth2 shortcut — equivalent to Bearer header
given()
    .auth().oauth2(token)
.when()
    .get("/secure/data")
.then()
    .statusCode(200);
```
highlight: [3, 10, 18]
annotation: .auth().basic() is the passport — auto-encodes credentials to Base64 and sends them every time. .header("Authorization", "Bearer " + token) is the boarding pass — a pre-issued token shown at each gate. .auth().oauth2(token) is a REST Assured shortcut that does the same thing as the Bearer header. In test suites, use @BeforeAll to fetch the token once, then share it across all tests in the class.

## BREAK_IT
setup:
```java
given()
    .auth().oauth2("valid-token-here")
.when()
    .get("/secure/data")
.then()
    .statusCode(200);
```
modification: Use an expired token (tokens typically expire in 1 hour)
question: What status code do you get with an expired token?
options: [401 Unauthorized, 403 Forbidden, 200 with empty body]
correct: 0
explanation: 401 means "who are you?" — the boarding pass has expired, show a new one. 403 means "I know who you are, but you can't access this" — valid pass, wrong terminal. Expired tokens = 401. Valid token + wrong role = 403.

## CONTRAST
label: 401 Unauthorized vs 403 Forbidden:
codeA:
```java
// 401 — expired boarding pass
given()
    .auth().oauth2("expired-token")
.when()
    .get("/admin/users")
.then()
    .statusCode(401); // "show me a valid pass"
```
codeB:
```java
// 403 — valid pass, wrong terminal
given()
    .auth().oauth2("regular-user-token")
.when()
    .get("/admin/users")
.then()
    .statusCode(403); // "this gate isn't for you"
```
question: Your test gets 403. Is it an auth problem or authorization problem?
options: [Authentication (identity), Authorization (permissions), Both, Neither]
correct: 1
explanation: 403 means the boarding pass is valid (authentication passed — the server knows who you are) but you're at the wrong terminal (authorization failed — you lack permission for /admin). Fix by using a token with the right role, not by re-authenticating with better credentials.

## EXPLAIN_BACK
mode: fill_blank
prompt: How do you handle authentication in REST Assured tests?
sentence: For Basic Auth use _____ which auto-encodes credentials, for token-based APIs use _____ as a header value, and centralize token fetching in a _____ method so tests don't manage auth themselves.
blanks: [.auth().basic(), "Bearer " + token, @BeforeAll]
distractors: [.header().auth(), "Token " + secret, @AfterEach, .credentials(), "Basic " + raw, @Test]

## CONNECT
text: Amazon internal services use SigV4 signing, but external API tests use Bearer:
```java
private static String token;

@BeforeAll
static void authenticate() {
    token = given().contentType(JSON)
        .body(Map.of("username", "test", "password", "pass"))
        .post("/auth/login").jsonPath().getString("token");
}
```
note: Token management is a framework concern, not a test concern. Tests should call getToken() — they shouldn't know HOW authentication works. This separation is what interviewers look for in your framework design.
