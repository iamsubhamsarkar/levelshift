---
unit: p8u7
title: API Testing in Playwright
teaches: [playwright.api_request, playwright.api_mock, typescript.generics, playwright.route]
requires: [playwright.auto_wait, typescript.promises, typescript.interfaces]
---

## HOOK
question: API + UI in one test. No Postman needed. Can you create a user via API and verify it shows up in the UI — in 5 lines?
```typescript
import { test, expect } from '@playwright/test';

test('create user via API, verify in UI', async ({ page, request }) => {
  // API: Create user
  const res = await request.post('/api/users', { data: { name: 'Alice', role: 'admin' } });
  expect(res.ok()).toBeTruthy();

  // UI: Verify user appears in dashboard
  await page.goto('/admin/users');
  await expect(page.locator('text=Alice')).toBeVisible();
});
```

## FAIL_FIRST
prompt: Write a test that GETs a list of products from `/api/products`, verifies the response status is 200, and checks that the response body contains at least 3 products. Type the response using a generic.
```typescript
import { test, expect } from '@playwright/test';

interface Product {
  id: number;
  name: string;
  price: number;
}

test('fetch products from API', async ({ request }) => {
  // TODO: Make a GET request to '/api/products'
  // TODO: Assert status is 200
  // TODO: Parse body as Product[] and assert length >= 3
});
```
hint: Use `request.get()`, then `response.json()` and cast with `as Product[]` or use a generic helper.
expected: The test should call `const response = await request.get('/api/products')`, assert `expect(response.status()).toBe(200)`, then parse with `const products: Product[] = await response.json()` and assert `expect(products.length).toBeGreaterThanOrEqual(3)`.

## ANALOGY
Think of Playwright's API testing like being both the customer and the restaurant inspector. As a customer (UI testing), you sit at the table and verify the food arrives correctly. As an inspector (API testing), you go into the kitchen and check the ingredients directly. Playwright's `request` context lets you do both in the same visit — you can call the kitchen (API) to place an order, then sit at the table (UI) to verify it shows up on the menu board. And `route()` is like replacing the real kitchen with a mock one: you intercept orders and serve predetermined responses, letting you test the dining room (frontend) without needing a working kitchen (backend).

## CODE
```typescript
import { test, expect, APIRequestContext } from '@playwright/test';

// Generic helper to type API responses
async function getJson<T>(request: APIRequestContext, url: string): Promise<T> {
  const response = await request.get(url);
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<T>;
}

interface User {
  id: number;
  name: string;
  email: string;
}

test('full CRUD lifecycle', async ({ request }) => {
  // CREATE
  const created = await request.post('/api/users', {
    data: { name: 'Bob', email: 'bob@test.com' }
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();

  // READ
  const user = await getJson<User>(request, `/api/users/${id}`);
  expect(user.name).toBe('Bob');

  // UPDATE
  const updated = await request.put(`/api/users/${id}`, {
    data: { name: 'Robert' }
  });
  expect(updated.ok()).toBeTruthy();

  // DELETE
  const deleted = await request.delete(`/api/users/${id}`);
  expect(deleted.status()).toBe(204);
});
```
highlight: [4, 5, 6, 7, 18, 19, 20]
annotation: Lines 4-7 show a generic helper function — `getJson<T>` accepts a type parameter and returns `Promise<T>`, giving you fully-typed API responses. The `<T>` is a TypeScript generic: it's a placeholder type that gets filled in when you call the function (line 26 fills it with `User`). Lines 18-20 show how `request.post` works — the `data` option automatically serializes to JSON and sets Content-Type headers.

## BREAK_IT
setup:
```typescript
import { test, expect } from '@playwright/test';

test('mock slow API response', async ({ page }) => {
  await page.route('**/api/dashboard', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ widgets: ['sales', 'traffic', 'users'] }),
  }));

  await page.goto('/dashboard');
  await expect(page.locator('.widget')).toHaveCount(3);
});
```
modification: Change `route.fulfill(...)` to `route.abort()` — this simulates a network failure instead of a successful response.
question: What happens when the API route is aborted instead of fulfilled?
options: [The page shows an error state because the fetch to /api/dashboard fails with a network error, The test times out because the page keeps retrying the request indefinitely, The route.abort() throws an error because you can only abort navigation requests]
correct: 0
explanation: `route.abort()` simulates a network-level failure (like ERR_FAILED). The frontend's fetch call will reject with a TypeError ('Failed to fetch'), and a well-built app will show an error state. This is a powerful testing pattern — you can verify error handling without needing a real server failure. If the app doesn't handle errors gracefully, the `.widget` count assertion would fail because no widgets rendered.

## CONTRAST
label: Real API calls vs Mocked API routes
codeA:
```typescript
// Real API call — hits actual backend
test('real API test', async ({ request }) => {
  const response = await request.get('https://api.example.com/users');
  const users: User[] = await response.json();
  expect(users).toHaveLength(5);
  expect(users[0]).toHaveProperty('email');
});
```
codeB:
```typescript
// Mocked route — intercepts browser's network
test('mocked API test', async ({ page }) => {
  await page.route('**/api/users', route => route.fulfill({
    status: 200,
    body: JSON.stringify([
      { id: 1, name: 'Mock User', email: 'mock@test.com' }
    ]),
  }));
  await page.goto('/users');
  await expect(page.locator('.user-card')).toHaveCount(1);
});
```
question: What is the fundamental difference between `request.get()` and `page.route()` + fulfill?
options: [request.get() is faster because it skips the browser rendering engine, request.get() makes a real HTTP call from Node.js while page.route() intercepts the browser's network and serves fake responses, request.get() only works for GET requests while page.route() works for all HTTP methods, page.route() is deprecated in favor of request.get() for API testing]
correct: 1
explanation: `request.get()` (from APIRequestContext) makes a real HTTP call from the Node.js test process directly to the server — no browser involved. It's for testing APIs in isolation. `page.route()` intercepts network requests made by the browser during page interactions and lets you fulfill them with mock data. Use `request` when you want to test the API itself. Use `page.route()` when you want to test how the UI behaves with controlled API responses. They serve completely different purposes and complement each other.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain the difference between Playwright's request context and route mocking, using generics for type safety.
sentence: The _____ context makes real HTTP calls for API testing, while page.route() _____ browser network requests, and generics like <T> let you _____ API response types.
blanks: [request, intercepts, strongly type]
distractors: [page, redirects, validate]

## CONNECT
text: API testing patterns feed directly into fixtures (Unit 8). Instead of calling the API in every test to set up data, you'll create fixtures that handle API setup/teardown automatically. The generic patterns you learned here (`<T>`) will become essential when typing custom fixtures with test.extend<T>.
```typescript
// Preview: Fixture that creates test data via API (Unit 8)
import { test as base } from '@playwright/test';

interface TestUser { id: number; name: string; token: string; }

const test = base.extend<{ testUser: TestUser }>({
  testUser: async ({ request }, use) => {
    // Setup: Create user via API (from this unit!)
    const res = await request.post('/api/users', {
      data: { name: 'fixture-user', role: 'tester' }
    });
    const user: TestUser = await res.json();

    await use(user); // Provide to test

    // Teardown: Clean up via API
    await request.delete(`/api/users/${user.id}`);
  },
});

test('uses auto-created user', async ({ page, testUser }) => {
  // testUser already exists — created by fixture!
  await page.goto(`/profile/${testUser.id}`);
});
```
note: The generic `<T>` you learned for typing API responses is the same syntax used to type fixtures. Master generics now, and Unit 8's fixture typing becomes trivial.
