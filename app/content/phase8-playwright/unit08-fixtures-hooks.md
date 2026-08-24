---
unit: p8u8
title: Fixtures & Hooks
teaches: [playwright.fixtures, playwright.extend, typescript.generics_advanced, playwright.hooks]
requires: [playwright.pom, typescript.generics, typescript.classes]
---

## HOOK
question: Every test gets a fresh logged-in page. Zero setup code in tests. How?
```typescript
import { test } from './fixtures';

// No login code. No page setup. Just the test.
test('admin can view user list', async ({ adminPage }) => {
  await adminPage.goto('/admin/users');
  await adminPage.locator('.user-row').first().waitFor();
  // adminPage is already logged in as admin — the fixture handled it
});

test('admin can delete user', async ({ adminPage }) => {
  await adminPage.goto('/admin/users');
  await adminPage.locator('[data-action="delete"]').first().click();
  // Still logged in. Fresh context. No state leakage from previous test.
});
```

## FAIL_FIRST
prompt: Create a custom fixture that provides a `todoPage` — a page already navigated to the todo app with one pre-existing todo item created via the UI. Use test.extend to define it.
```typescript
import { test as base, Page } from '@playwright/test';

// TODO: Define a fixture type that includes todoPage: Page
// TODO: Use base.extend to create the fixture
// TODO: In the fixture, navigate to /todos, add "Buy milk", then provide the page

// Export the extended test
```
hint: Use `base.extend<{ todoPage: Page }>({ todoPage: async ({ page }, use) => { ... await use(page); } })`.
expected: The fixture should navigate to '/todos', fill an input with 'Buy milk', click add, then call `await use(page)`. The exported test type includes todoPage. Tests using this fixture get a page that's already at /todos with one item.

## ANALOGY
Fixtures are like a hotel room service preparing your room before you arrive. You don't check in and then call housekeeping for sheets, pillows, and towels (that's hooks in beforeEach — you do the setup yourself). With fixtures, you just request "a room with ocean view and extra pillows" and it's ready when you walk in. Each guest (test) gets their own fresh room — no sharing, no leftover mess from previous guests. And just like the hotel handles checkout cleanup (stripping beds, restocking), fixtures handle teardown after each test. The `use()` call is the moment you hand the room key to the guest — everything before it is setup, everything after is teardown.

## CODE
```typescript
import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

// Define fixture types with advanced generics
type MyFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
  dashboardPage: DashboardPage;
};

const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Setup: Log in
    await page.goto('/login');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    await page.waitForURL('/dashboard');

    await use(page); // Test runs here with authenticated page

    // Teardown: Log out
    await page.click('#logout');
  },

  dashboardPage: async ({ authenticatedPage }, use) => {
    // Depends on authenticatedPage fixture — Playwright resolves order
    const dashboard = new DashboardPage(authenticatedPage);
    await use(dashboard);
  },
});

export { test, expect };
```
highlight: [6, 7, 8, 9, 12, 27, 30, 32]
annotation: Lines 6-9 define the fixture type using a TypeScript type alias — this tells test.extend exactly what fixtures exist and their types. Line 12 passes this type as a generic parameter `<MyFixtures>` to base.extend. Line 27 is the `use()` boundary — everything above is setup, everything below is teardown. Line 30 shows teardown code. Line 32 shows fixture dependencies — `dashboardPage` depends on `authenticatedPage`, and Playwright automatically resolves the dependency chain (authenticatedPage runs first).

## BREAK_IT
setup:
```typescript
import { test as base } from '@playwright/test';

type Fixtures = { userToken: string };

const test = base.extend<Fixtures>({
  userToken: async ({ request }, use) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'user@test.com', password: 'pass123' }
    });
    const { token } = await res.json();
    await use(token);

    // Teardown: invalidate token
    await request.post('/api/auth/logout', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
});

test('first test', async ({ userToken, page }) => {
  await page.setExtraHTTPHeaders({ Authorization: `Bearer ${userToken}` });
  await page.goto('/profile');
});

test('second test', async ({ userToken, page }) => {
  await page.setExtraHTTPHeaders({ Authorization: `Bearer ${userToken}` });
  await page.goto('/settings');
});
```
modification: Change `test = base.extend<Fixtures>` to use a worker-scoped fixture by adding `{ scope: 'worker' }` to the userToken definition: `userToken: [async ({ request }, use) => { ... }, { scope: 'worker' }]`.
question: What changes when userToken becomes a worker-scoped fixture?
options: [Both tests share the same token — login happens once per worker instead of once per test, The fixture throws an error because request is not available in worker scope, Nothing changes because scope only affects parallel execution]
correct: 0
explanation: Worker-scoped fixtures run once per worker process and are shared across all tests in that worker. This means login happens once, and both tests reuse the same token. The teardown (logout) only runs when the worker shuts down. This is efficient for expensive setup (like authentication) but dangerous if tests modify shared state. Test-scoped fixtures (the default) create fresh instances per test — slower but isolated. Choose worker scope for read-only shared resources.

## CONTRAST
label: beforeEach hooks vs Custom fixtures
codeA:
```typescript
// hooks approach — setup in beforeEach
import { test, expect, Page } from '@playwright/test';

let loggedInPage: Page;

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'admin@test.com');
  await page.fill('#password', 'admin123');
  await page.click('#submit');
  await page.waitForURL('/dashboard');
  loggedInPage = page;
});

test('view users', async () => {
  await loggedInPage.goto('/admin/users');
  await expect(loggedInPage.locator('.user-row')).toHaveCount(5);
});
```
codeB:
```typescript
// fixture approach — encapsulated, typed, composable
import { test as base, expect } from '@playwright/test';
import { AdminPage } from './pages/admin.page';

const test = base.extend<{ adminPage: AdminPage }>({
  adminPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@test.com');
    await page.fill('#password', 'admin123');
    await page.click('#submit');
    await page.waitForURL('/dashboard');
    await use(new AdminPage(page));
    await page.click('#logout'); // guaranteed teardown
  },
});

test('view users', async ({ adminPage }) => {
  await adminPage.navigateToUsers();
  await expect(adminPage.userRows).toHaveCount(5);
});
```
question: What are the key advantages of fixtures over beforeEach hooks?
options: [Fixtures are faster because they run in parallel, Fixtures provide automatic teardown + type safety + composability + on-demand instantiation, Fixtures skip browser setup entirely using mocks, Fixtures are just syntactic sugar — they compile to beforeEach internally]
correct: 1
explanation: Fixtures win in four ways. (1) Guaranteed teardown — code after `use()` always runs, even if the test fails. beforeEach has no teardown guarantee unless you pair it with afterEach. (2) Type safety — fixtures are typed via generics, so TypeScript catches wrong usage. (3) Composability — fixtures can depend on other fixtures, creating a dependency graph. (4) On-demand — fixtures only run if the test actually requests them. A beforeEach runs for ALL tests in the file, even those that don't need the setup. Fixtures are not just sugar; they're architecturally superior.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how Playwright fixtures work using test.extend and the use() callback pattern.
sentence: A fixture uses test.extend<_____> to declare types, runs _____ code before `use()`, and runs _____ code after `use()`.
blanks: [FixtureTypes, setup, teardown]
distractors: [TestConfig, assertion, cleanup]

## CONNECT
text: Fixtures are the foundation for advanced patterns in Unit 9. When you need multiple browser contexts (multi-user testing), you'll create fixtures that provide separate authenticated pages per role. Visual regression tests use fixtures to set up consistent viewport states. And in Unit 10 (Framework Project), your entire test architecture will be built on layered fixtures.
```typescript
// Preview: Multi-role fixture for e2e scenarios (Unit 9)
import { test as base, Browser, Page } from '@playwright/test';

type MultiUserFixtures = {
  adminPage: Page;
  customerPage: Page;
};

const test = base.extend<MultiUserFixtures>({
  adminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/login');
    await page.fill('#email', 'admin@test.com');
    await page.fill('#password', 'admin123');
    await page.click('#submit');
    await use(page);
    await ctx.close();
  },
  customerPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/login');
    await page.fill('#email', 'customer@test.com');
    await page.fill('#password', 'cust123');
    await page.click('#submit');
    await use(page);
    await ctx.close();
  },
});

test('admin sees customer order', async ({ adminPage, customerPage }) => {
  // Two browsers, two users, one test!
});
```
note: Multi-context fixtures enable real-world scenarios like chat apps, collaborative editing, and admin/customer flows. Unit 9 builds heavily on this pattern.
