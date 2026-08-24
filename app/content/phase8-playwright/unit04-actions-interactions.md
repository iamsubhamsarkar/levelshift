---
unit: p8u4
title: Actions & Interactions
teaches: [playwright.actions, playwright.fill, playwright.click, typescript.functions, typescript.arrow_functions]
requires: [playwright.assertions, playwright.locators, typescript.interfaces]
---

## HOOK
question: It finds the field by LABEL, not by ID or CSS class. Blind users navigate forms by label. So does Playwright. Why does that matter for test stability?
```typescript
await page.getByLabel('Email').fill('test@example.com');
// Not page.fill('#email-input', '...')
// Not page.fill('[data-cy="email"]', '...')
// The LABEL. The thing humans actually read.
```

## FAIL_FIRST
prompt: Write a test that fills out a contact form with Name, Email, Message fields, selects a "Priority" dropdown option of "High", checks a "Send copy to me" checkbox, and clicks Submit. Use typed test data.
```typescript
import { test, expect } from '@playwright/test';

interface ContactForm {
  // Define the shape
}

test('submit contact form', async ({ page }) => {
  await page.goto('/contact');
  
  const formData: ContactForm = {
    // Fill in test data
  };

  // Fill the form fields
  
  // Select dropdown option
  
  // Check the checkbox
  
  // Click submit
  
  // Assert success message
});
```
hint: Use `getByLabel()` for form fields, `selectOption()` for dropdowns, `check()` for checkboxes, and `getByRole('button')` for the submit button.
expected: Interface has name (string), email (string), message (string), priority ('low' | 'medium' | 'high'), sendCopy (boolean). The test uses `page.getByLabel('Name').fill(formData.name)`, `page.getByLabel('Priority').selectOption(formData.priority)`, `page.getByLabel('Send copy to me').check()`, and `page.getByRole('button', { name: 'Submit' }).click()`.

## ANALOGY
Playwright actions are like a very precise robot arm on an assembly line. When you say `fill('hello')`, it doesn't just type — it first clears the field, focuses it, then types each character with realistic timing. When you say `click()`, it scrolls the element into view, waits for it to be actionable (visible, enabled, not covered by another element), then clicks the exact center. Compare this to a human QA tester: they don't just slam the keyboard — they look at the field, move to it, clear any existing text, then type. Playwright mimics this human-like sequence automatically. Arrow functions in TypeScript are like shorthand instructions to this robot: instead of saying "Dear Robot, please perform the following function...", you just say "do this → that."

## CODE
```typescript
import { test, expect } from '@playwright/test';

// Arrow function — concise helper for repetitive actions
const fillField = async (page, label: string, value: string): Promise<void> => {
  await page.getByLabel(label).fill(value);
};

// Function type — defines what shape a function must have
type FormAction = (page: any, data: string) => Promise<void>;

test('complete checkout form', async ({ page }) => {
  await page.goto('/checkout');

  // Direct actions
  await page.getByLabel('Card Number').fill('4111111111111111');
  await page.getByLabel('Expiry').fill('12/28');
  await page.getByLabel('CVV').fill('123');

  // Dropdown selection
  await page.getByLabel('Country').selectOption('United States');

  // Checkbox
  await page.getByLabel('Save card for future').check();

  // Click with role
  await page.getByRole('button', { name: 'Pay Now' }).click();

  // Verify success
  await expect(page.getByText('Payment successful')).toBeVisible();
});
```
highlight: [4, 9, 15, 20, 23]
annotation: Line 4 — arrow function `async (page, label, value) => {}` is a concise way to write reusable helpers. The `: Promise<void>` return type says "this function is async and returns nothing." Line 9 — `type FormAction` defines the SIGNATURE any function must match to be a FormAction. Line 15 — `fill()` clears existing text then types. Line 20 — `selectOption()` works with value, label, or index. Line 23 — `check()` is idempotent — if already checked, it does nothing (unlike `click()` which would UNCHECK it).

## BREAK_IT
setup:
```typescript
import { test, expect } from '@playwright/test';

test('toggle checkbox correctly', async ({ page }) => {
  await page.goto('/settings');
  
  const newsletter = page.getByLabel('Subscribe to newsletter');
  
  // Check the box
  await newsletter.check();
  await expect(newsletter).toBeChecked();
  
  // Uncheck the box
  await newsletter.uncheck();
  await expect(newsletter).not.toBeChecked();
});
```
modification: Replace `await newsletter.uncheck();` with `await newsletter.click();` and keep the assertion as `await expect(newsletter).not.toBeChecked();`
question: If the checkbox was already checked and you use click() instead of uncheck(), what happens?
options: [click() and uncheck() do exactly the same thing, click() toggles the state so it unchecks — test passes, click() ignores the current state and always checks — test fails]
correct: 1
explanation: `click()` toggles a checkbox — if checked, it unchecks; if unchecked, it checks. In this case it works the same as `uncheck()`. BUT here's the danger: `uncheck()` is idempotent (safe to call even if already unchecked), while `click()` always toggles. If a previous step failed and the checkbox was never checked, `click()` would CHECK it (opposite of intent) while `uncheck()` would safely do nothing. Always use `check()`/`uncheck()` for checkboxes — they express INTENT, not just mechanics.

## CONTRAST
label: Arrow functions vs Traditional functions — Syntax and behavior in test helpers
codeA:
```typescript
// Traditional function declaration
async function loginUser(
  page: any,
  email: string,
  password: string
): Promise<void> {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

// Has its own 'this' context, can be hoisted
```
codeB:
```typescript
// Arrow function expression
const loginUser = async (
  page: any,
  email: string,
  password: string
): Promise<void> => {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

// Inherits 'this' from surrounding scope, NOT hoisted
```
question: You need a helper function that other test files import. You call it BEFORE its declaration in the file. Which syntax works?
options: [Arrow function — it's always better, Traditional function — it gets hoisted above its usage, Both work — JavaScript handles ordering automatically, Neither — you must always declare before use]
correct: 1
explanation: Traditional function declarations are "hoisted" — JavaScript moves them to the top of their scope during compilation, so you can call them before the line they appear on. Arrow functions stored in `const` are NOT hoisted — calling `loginUser()` before the `const loginUser = ...` line throws a ReferenceError. In practice for test helpers, arrow functions are preferred for inline callbacks and short utilities, while traditional functions work better for standalone helpers that need flexible placement. Most Playwright test suites use arrow functions for page object methods and callbacks.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how Playwright actions and TypeScript functions work together for form automation.
sentence: The _____ method clears existing text before typing new content, an _____ function uses => syntax and inherits the surrounding scope, and the _____ parameter syntax lets you omit arguments that aren't always needed.
blanks: [fill(), arrow, optional (?)]
distractors: [type(), traditional, required (!)]

## CONNECT
text: You can now find elements, verify them, and interact with them. But as your test suite grows, you'll notice repeated code — every test that needs login repeats the same 5 lines. Unit 5 introduces the Page Object Model pattern, using TypeScript classes to encapsulate page interactions into reusable, maintainable objects.
```typescript
// Coming in Unit 5 — Page Object Model eliminates repetition
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test('admin accesses dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboard = await loginPage.loginAs('admin@test.com', 'Pass123!');
  
  // One line does what used to take 5 lines of fill/click/wait
  await dashboard.expectWelcomeMessage('Welcome, Admin');
});
```
note: The arrow functions and action methods you learned here will become the building blocks of Page Object methods. Every `fill()`, `click()`, `check()` you just practiced will be wrapped inside class methods with descriptive names like `submitPayment()` or `selectShippingMethod()` — making tests read like plain English.
