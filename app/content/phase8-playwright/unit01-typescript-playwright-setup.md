---
unit: p8u1
title: TypeScript & Playwright Setup
teaches: [typescript.types, typescript.const_let, playwright.setup, playwright.test_runner]
requires: []
---

## HOOK
question: This replaced 50 lines of Selenium WebDriver setup, waits, and teardown. Three lines. What language is this?
```typescript
import { test, expect } from '@playwright/test';

test('search engine works', async ({ page }) => {
  await page.goto('https://google.com');
  await page.getByLabel('Search').fill('Playwright testing');
  await page.getByLabel('Google Search').first().click();
});
```

## FAIL_FIRST
prompt: Without looking anything up, try to initialize a new Playwright project and run the example tests. What commands would you use?
```bash
# Step 1: Create a new directory and navigate into it
mkdir my-first-playwright-project
cd my-first-playwright-project

# Step 2: Initialize the project (fill in the command)
npm init playwright@latest

# Step 3: Run the tests (fill in the command)
npx playwright test
```
hint: Playwright has its own CLI initializer — you don't need to manually install packages or configure files.
expected: Running `npm init playwright@latest` scaffolds the project with config, example tests, and installs browsers. `npx playwright test` runs all tests in headless mode. You should see passing tests in the terminal output.

## ANALOGY
Setting up Playwright is like moving into a new apartment that comes fully furnished. When you run `npm init playwright@latest`, you get the testing framework (furniture), browser engines (utilities), config file (lease agreement), and example tests (instruction manual) — all ready to use immediately. Compare this to Selenium where you'd need to separately buy furniture (download drivers), call utility companies (configure browser paths), write your own manual (create config from scratch), and hope everything fits together. TypeScript is the building code that ensures everything is structurally sound — it catches mistakes at design time, not when the building is already built.

## CODE
```typescript
// playwright.config.ts is auto-generated — let's understand the key parts
import { defineConfig } from '@playwright/test';

// const = cannot be reassigned (like a permanent label)
const BASE_URL: string = 'https://demo.playwright.dev';
const TIMEOUT: number = 30000;
const IS_CI: boolean = !!process.env.CI;

// let = can be reassigned (like a sticky note you can move)
let retryCount: number = IS_CI ? 2 : 0;

export default defineConfig({
  testDir: './tests',
  timeout: TIMEOUT,
  retries: retryCount,
  use: { baseURL: BASE_URL },
});
```
highlight: [5, 6, 7, 10]
annotation: Lines 5-7 show `const` with type annotations — once assigned, BASE_URL will always be that string, TIMEOUT will always be that number, IS_CI will always be that boolean. Line 10 shows `let` — retryCount can change based on conditions. TypeScript enforces these types at compile time. Try assigning `TIMEOUT = 'fast'` and TypeScript will scream before you ever run a test.

## BREAK_IT
setup:
```typescript
const browserName: string = 'chromium';
const headless: boolean = true;
let timeout: number = 5000;

// This works fine
timeout = 10000;
```
modification: Change line 1 to `const browserName: string = 'chromium';` then add `browserName = 'firefox';` on a new line after it.
question: What happens when you try to reassign a const variable?
options: [TypeScript compiler error — cannot assign to a const variable, It silently changes to firefox at runtime, It throws a runtime error when the test executes]
correct: 0
explanation: `const` creates an immutable binding. TypeScript catches this at compile time with error TS2588 — 'Cannot assign to browserName because it is a constant.' This is caught BEFORE any test runs. This is why TypeScript is powerful for SDETs — bugs are caught while writing code, not during flaky test runs at 3 AM.

## CONTRAST
label: const vs let — When to use which in test automation
codeA:
```typescript
// Using const for test configuration
const LOGIN_URL: string = 'https://app.com/login';
const MAX_RETRIES: number = 3;
const ADMIN_EMAIL: string = 'admin@test.com';

// These NEVER change during a test run
```
codeB:
```typescript
// Using let for values that change during test flow
let currentPage: string = 'login';
let attemptCount: number = 0;
let isLoggedIn: boolean = false;

// These change as the test progresses
attemptCount = attemptCount + 1;
isLoggedIn = true;
currentPage = 'dashboard';
```
question: You're storing a test user's password that stays the same across all tests. Which declaration should you use?
options: [let because passwords are sensitive, const because the value never changes during execution, var because it needs global scope, Either works — it's just style preference]
correct: 1
explanation: Use `const` for any value that shouldn't change during test execution — URLs, credentials, selectors, timeouts, config values. Use `let` only when the value MUST change (counters, state trackers, loop variables). This isn't just style — it's a safety net. If someone accidentally tries to reassign your test URL mid-test, TypeScript will catch it immediately. In SDET work, predictable values should be `const`.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how TypeScript types and const/let work together in a Playwright project setup.
sentence: A _____ declaration prevents reassignment while a _____ annotation like _____ ensures only that data type can be stored in the variable.
blanks: [const, type, string | number | boolean]
distractors: [var, class, interface | object | array]

## CONNECT
text: Now that you have a Playwright project running with TypeScript basics, Unit 2 will teach you how to write your first real test — finding elements on the page using selectors. The `const` and type knowledge you just learned will be essential for storing locators and building reliable selectors.
```typescript
// Coming in Unit 2 — your first real test with typed selectors
import { test, expect } from '@playwright/test';

test('login page has correct elements', async ({ page }) => {
  const loginUrl: string = 'https://demo.playwright.dev/todomvc';
  await page.goto(loginUrl);
  
  // You'll learn what getByRole, getByText mean next
  const heading = page.getByRole('heading', { name: 'todos' });
  await expect(heading).toBeVisible();
});
```
note: Every Playwright test you write from now on will use const for fixed values and type annotations for clarity. This foundation makes your tests self-documenting — a teammate can read `const timeout: number = 5000` and instantly know what it is, what type it holds, and that it won't change.
