---
unit: p8u3
title: Assertions & TypeScript Types
teaches: [playwright.assertions, typescript.interfaces, typescript.unions, playwright.expect]
requires: [playwright.test_structure, typescript.async_await, playwright.locators]
---

## HOOK
question: This line auto-retries for 5 seconds, polling every 100ms, with zero sleep statements. How does it know when to stop?
```typescript
await expect(page.locator('.todo-list li')).toHaveCount(5);
// No Thread.sleep(). No explicit waits. No retry loops.
// It just... works. But HOW?
```

## FAIL_FIRST
prompt: Write a test that adds 3 todo items and then asserts that exactly 3 items are visible in the list. Also define a TypeScript interface for a TodoItem with title (string) and completed (boolean) properties.
```typescript
import { test, expect } from '@playwright/test';

// Define an interface for a TodoItem
interface TodoItem {
  // Add properties here
}

test('should display 3 items after adding them', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  
  const todos: TodoItem[] = [
    // Add 3 todo items using your interface
  ];

  for (const todo of todos) {
    // Add each todo
  }

  // Assert exactly 3 items exist
});
```
hint: An interface defines the SHAPE of data — what properties exist and what types they hold. Use `toHaveCount(3)` for asserting element count.
expected: The interface should have `title: string` and `completed: boolean`. The test loops through todos, fills the input and presses Enter for each, then uses `await expect(page.locator('.todo-list li')).toHaveCount(3)` which auto-retries until the count matches or times out.

## ANALOGY
Think of TypeScript interfaces like a form template at a doctor's office. The form says "Name: _____ (text), Age: _____ (number), Smoker: _____ (yes/no)" — it defines what information is needed and what format each field accepts. If you try to write your age in the name field, the receptionist rejects it. Similarly, if you try to put a string where a number belongs, TypeScript rejects it at compile time. Playwright assertions are like a patient waiting room with a pager — `expect(locator).toBeVisible()` doesn't check once and give up. It keeps buzzing every 100ms: "visible yet? visible yet? visible yet?" for up to 5 seconds. Only if the element NEVER appears does it finally declare failure. No manual `sleep()` needed.

## CODE
```typescript
import { test, expect } from '@playwright/test';

// Interface defines the shape of test data
interface UserCredentials {
  email: string;
  password: string;
  role: 'admin' | 'viewer' | 'editor'; // Union type — only these 3 values allowed
}

const testUser: UserCredentials = {
  email: 'qa@company.com',
  password: 'Test123!',
  role: 'admin',
};

test('admin user sees dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(testUser.email);
  await page.getByLabel('Password').fill(testUser.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Auto-retrying assertions — no manual waits needed
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading')).toHaveText('Admin Dashboard');
  await expect(page.getByRole('navigation')).toBeVisible();
});
```
highlight: [4, 7, 10, 23, 24]
annotation: Line 4 — `interface` defines the contract for user data; any object claiming to be `UserCredentials` MUST have all three fields with correct types. Line 7 — union type `'admin' | 'viewer' | 'editor'` restricts to ONLY these values; `role: 'superuser'` would be a compile error. Line 10 — TypeScript validates `testUser` matches the interface at compile time. Lines 23-24 — `toHaveURL` and `toHaveText` auto-retry until they pass or timeout. The test doesn't need `page.waitForNavigation()` because the assertion itself handles waiting.

## BREAK_IT
setup:
```typescript
import { test, expect } from '@playwright/test';

interface Product {
  name: string;
  price: number;
  inStock: boolean;
}

test('product displays correctly', async ({ page }) => {
  const product: Product = {
    name: 'Wireless Mouse',
    price: 29.99,
    inStock: true,
  };

  await page.goto('/products/wireless-mouse');
  await expect(page.getByRole('heading')).toHaveText(product.name);
  await expect(page.getByTestId('price')).toHaveText(`$${product.price}`);
});
```
modification: Change the `product` declaration to `const product: Product = { name: 'Wireless Mouse', price: '29.99', inStock: true };` (price as a string instead of number)
question: What happens when you assign a string to a property typed as number?
options: [Runtime error when the test runs in the browser, TypeScript compile error — Type 'string' is not assignable to type 'number', The test passes because '29.99' can be coerced to a number]
correct: 1
explanation: TypeScript catches this at compile time with error TS2322. The interface declares `price: number` but you're assigning `'29.99'` (a string). TypeScript doesn't care that the string LOOKS like a number — types must match exactly. This is the whole point of interfaces in test automation — they catch data errors before tests even run. Imagine a data-driven test with 500 entries; finding a type mismatch at compile time saves hours of debugging mysterious test failures.

## CONTRAST
label: Hard assertions vs Soft assertions — When tests should stop vs continue
codeA:
```typescript
// Hard assertions (default) — STOPS on first failure
test('checkout flow', async ({ page }) => {
  await page.goto('/checkout');

  // If this fails, test STOPS here. Lines below never run.
  await expect(page.getByText('Your Cart')).toBeVisible();
  await expect(page.getByTestId('item-count')).toHaveText('3');
  await expect(page.getByTestId('total')).toHaveText('$89.97');
});
```
codeB:
```typescript
// Soft assertions — CONTINUES after failure, reports all at end
test('checkout flow', async ({ page }) => {
  await page.goto('/checkout');

  // Collects ALL failures, reports them together at the end
  await expect.soft(page.getByText('Your Cart')).toBeVisible();
  await expect.soft(page.getByTestId('item-count')).toHaveText('3');
  await expect.soft(page.getByTestId('total')).toHaveText('$89.97');
});
```
question: You're testing a registration form with 10 required field validations. You want to know ALL fields that fail validation in one test run, not just the first one. Which approach do you use?
options: [Hard assertions — fail fast to save time, Soft assertions — collect all failures to see the full picture, A mix — hard for critical steps then soft for validations, It doesn't matter — both report the same information]
correct: 2
explanation: The best practice is to use hard assertions for critical navigation/setup steps (if the page doesn't load, nothing else matters) and soft assertions for validation checks where you want the complete picture. If you use only hard assertions, you'd need 10 test runs to find all 10 broken validations. Soft assertions let you see all failures in one run — crucial for regression testing where you need to know the full scope of breakage quickly.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how TypeScript interfaces and Playwright assertions work together to create reliable tests.
sentence: An _____ defines the shape of test data at compile time, a _____ assertion auto-retries until it passes or times out, and a _____ type restricts a variable to only specific allowed values.
blanks: [interface, Playwright (expect), union]
distractors: [class, manual (sleep-based), generic]

## CONNECT
text: You now know how to FIND elements (Unit 2) and VERIFY them (Unit 3). Next, you'll learn to INTERACT — clicking buttons, filling forms, selecting dropdowns. The interfaces you learned here will structure the form data you submit, and assertions will verify the results of those interactions.
```typescript
// Coming in Unit 4 — form interactions with typed data
import { test, expect } from '@playwright/test';

interface RegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  plan: 'free' | 'pro' | 'enterprise';
}

test('complete registration form', async ({ page }) => {
  const formData: RegistrationForm = {
    firstName: 'Alice', lastName: 'Tester',
    email: 'alice@qa.dev', age: 28, plan: 'pro',
  };
  
  await page.goto('/register');
  await page.getByLabel('First Name').fill(formData.firstName);
  // More interactions coming in Unit 4...
});
```
note: Interfaces become increasingly powerful as your test suites grow. A single `UserCredentials` interface used across 200 tests means if the API changes a field name, TypeScript tells you exactly which 200 places need updating — instantly, at compile time, before a single test runs.
