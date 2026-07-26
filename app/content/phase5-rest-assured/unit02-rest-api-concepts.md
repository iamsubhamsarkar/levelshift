---
unit: p5u2
title: REST API Concepts
teaches: [http.rest_principles, http.resources, http.json_structure]
requires: [http.methods, http.status_codes]
---

## HOOK
question: Why is it `/users/1` and NOT `/getUser?id=1`? What rule is being followed?
```
GET  /users       → list all users
GET  /users/1     → get user 1
POST /users       → create user
PUT  /users/1     → update user 1
DELETE /users/1   → delete user 1
```

## FAIL_FIRST
prompt: Which of these URIs breaks REST conventions? Why?
```
A) GET /users/1/orders
B) POST /createNewUser
C) DELETE /users/1
D) GET /users?status=active
```
hint: REST uses nouns for resources, HTTP methods for actions
expected: B — the verb "create" belongs in the METHOD (POST), not in the URI

## ANALOGY
REST is like a library system. Resources are the BOOKS (nouns: /books, /members). The HTTP method is what you DO with them (GET = read, POST = donate a new book, DELETE = remove). The URI is the shelf address. You don't say "goGetBookFromShelf3" — you say GET /shelf/3. The resource stays the same; the action changes via the method.

## CODE
```java
// REST = Representational State Transfer
// Core constraints:
// 1. Client-Server separation
// 2. Stateless (no server-side sessions — each request carries ALL info)
// 3. Uniform Interface (resources identified by URIs + HTTP methods)
// 4. JSON is the standard representation format:

// Example resource representation:
// GET /users/1 →
// {"id": 1, "name": "Subham", "roles": ["tester", "dev"]}
```
highlight: [4, 5, 10]
annotation: "Stateless" means each request carries ALL info needed (auth token, params) — the server doesn't remember previous requests. "Uniform Interface" means resources are nouns (/users, /orders) and HTTP methods are verbs (GET, POST, PUT, DELETE). This is why you send an Authorization header on EVERY call.

## BREAK_IT
setup:
```json
{
  "user": {
    "name": "Subham",
    "skills": ["Java", "REST"]
  }
}
```
modification: What if you access this JSON with path "user.skills[2]"?
question: What happens when you access an index that doesn't exist?
options: [null/empty, IndexOutOfBoundsException, Returns last item]
correct: 0
explanation: JSON path traversal returns null or empty for missing indices — it doesn't throw exceptions. In REST Assured, asserting on a missing path gives null, which can silently pass if you're not careful. Always validate the array size first.

## CONTRAST
label: RESTful vs Non-RESTful API design:
codeA:
```
RESTful:
GET    /orders/42
POST   /orders
PUT    /orders/42
DELETE /orders/42
```
codeB:
```
Non-RESTful (RPC-style):
GET /getOrder?id=42
POST /createOrder
POST /updateOrder
POST /deleteOrder
```
question: Why do companies prefer RESTful design for public APIs?
options: [Predictable URL patterns, HTTP caching works naturally, Standard tooling support, All of the above]
correct: 3
explanation: RESTful APIs use the Uniform Interface — the method is the verb, the URI is the noun (like the library system where GET /shelf/3 is self-explanatory). This makes URLs predictable, GET responses cacheable (reading a book doesn't change it), and every HTTP client already understands the methods. Non-RESTful APIs put verbs in URIs, breaking the shelf-address pattern.

## EXPLAIN_BACK
mode: pick_best
prompt: What does "stateless" mean in REST?
options: [Each request carries all info needed — the server doesn't remember previous requests, The server stores session data between calls, Clients must re-authenticate only once, The API never changes state]
correct: 0

## CONNECT
text: At Amazon, every internal service exposes REST APIs. When you test them:
```java
given()
  .basePath("/api/v1")
.when()
  .get("/products/{id}", 42)
.then()
  .body("name", notNullValue());
```
note: Understanding REST design helps you predict endpoint patterns during exploratory testing — if you know GET /orders works, you can guess GET /orders/1/items exists without reading docs.
