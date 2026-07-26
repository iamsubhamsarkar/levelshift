---
unit: p5u1
title: HTTP Fundamentals
teaches: [http.methods, http.status_codes, http.headers]
requires: [basics.types, basics.strings]
---

## HOOK
question: You hit a URL in your browser. What VERB did you just use without knowing it?
```
GET https://api.github.com/users/octocat
```

## FAIL_FIRST
prompt: Match each status code to its meaning — which one means "created successfully"?
```
200 → ?
201 → ?
404 → ?
500 → ?
```
hint: 2xx = success, 4xx = client error, 5xx = server error
expected: 200=OK, 201=Created, 404=Not Found, 500=Internal Server Error

## ANALOGY
HTTP is a conversation between a waiter (client) and kitchen (server). The METHOD is what you ask ("I'd like to ORDER" = POST, "What's on the menu?" = GET). The STATUS CODE is the kitchen's reply ("Here you go" = 200, "We don't have that" = 404). HEADERS are side notes on the order slip — "no nuts" (Accept: application/json), "table 5" (Authorization: Bearer token).

## CODE
```java
// HTTP Request anatomy:
// METHOD  URL                        (what + where)
// GET     https://api.example.com/users/1
// Headers: Accept: application/json  (metadata)
// Body:    (empty for GET)           (payload)

// HTTP Response anatomy:
// Status:  200 OK
// Headers: Content-Type: application/json
// Body:    {"id": 1, "name": "Subham"}
```
highlight: [2, 3, 4, 5]
annotation: Every HTTP exchange has a METHOD (the verb — GET, POST, PUT, DELETE), a URL (the address), HEADERS (metadata like Accept and Content-Type), and an optional BODY (the payload). GET/DELETE typically have no body. POST/PUT carry a body. Headers travel in BOTH directions — request and response.

## BREAK_IT
setup:
```
POST /users
Content-Type: application/json
Body: {"name": "Subham"}
→ Response: 201 Created
```
modification: What if you send POST without Content-Type header?
question: What likely happens?
options: [200 OK, 415 Unsupported Media Type, 404 Not Found]
correct: 1
explanation: The server doesn't know how to parse the body without Content-Type. It returns 415 — "I don't understand this format." Always set Content-Type when sending a body.

## CONTRAST
label: GET vs POST — when to use which:
codeA:
```
GET /users/1
(No body, safe, idempotent)
→ 200 + user data
```
codeB:
```
POST /users
Body: {"name": "New User"}
(Has body, NOT idempotent)
→ 201 + created user
```
question: Why can't you use GET to create a resource?
options: [GET has no body to send data, GET is idempotent by contract, Both reasons, It's just convention]
correct: 2
explanation: GET has no body (as shown in the request anatomy — "empty for GET") and is idempotent like the kitchen answering "What's on the menu?" the same way every time. POST is "I'd like to ORDER" — it creates something new each time. Using GET to create would break both the no-body rule and the idempotent contract.

## EXPLAIN_BACK
mode: fill_blank
prompt: Describe what a client sends in an HTTP request.
sentence: A client sends a _____ (the verb like GET or POST), a _____ (the address), _____ (metadata like Content-Type), and an optional _____ (the data payload).
blanks: [METHOD, URL, HEADERS, BODY]
distractors: [RESPONSE, STATUS CODE, COOKIE, PROTOCOL]

## CONNECT
text: Every REST Assured test maps directly to this anatomy:
```java
given()                          // headers, auth, params
  .header("Accept", "application/json")
.when()                          // method + URL
  .get("/users/1")
.then()                          // validate response
  .statusCode(200);
```
note: REST Assured's DSL is literally "given this request setup, when I call this method, then I expect this response." You now know what each piece means at the HTTP level.
