---
unit: p8u5
title: Page Object Model
teaches: [playwright.pom, typescript.classes, typescript.constructors, playwright.page_abstraction]
requires: [playwright.actions, typescript.functions, playwright.assertions]
---

## HOOK
question: Same test. 75% less code. What changed?
```typescript
// BEFORE — 20 lines of raw selectors repeated in every test
test('user logs in and sees dashboard', async ({ page }) => {
  await page.goto('https://app.example.com/login');
  await page.getByLabel('Email address').fill('admin@test.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading')).toHaveText('Welcome back, Admin');
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/.*settings/);
  await page.getByLabel('Display Name').fill('Admin User');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Settings saved')).toBeVisible();
});

// AFTER — 5 lines using Page Objects
test('user logs in and updates settings', async ({ page }) => {
  const login = new LoginPage(page);
  const dashboard = await login.loginAs('admin@test.com', 'SecurePass123!');
  const settings = await dashboard.navigateToSettings();
  await settings.updateDisplayName('Admin User');
  await settings.expectSaveConfirmation();
});
```

## FAIL_FIRST
prompt: Create a `LoginPage` class with a constructor that accepts a Playwright Page object, a `goto()` method, and a `login(email, password)` method that fills the form and clicks submit. Use proper TypeScript access modifiers.
```typescript
import { type Page, type Locator } from '@playwright/test';

class LoginPage {
  // Declare private page property
  // Declare readonly locators

  constructor(/* what goes here? */) {
    // Initialize page and locators
  }

  async goto(): Promise<void> {
    // Navigate to login page
  }

  async login(email: string, password: string): Promise<void> {
    // Fill email, fill password, click submit
  }
}
```
hint: The constructor receives a `Page` object and stores it as a private property. Locators can be initialized in the constructor using `this.page.getByLabel(...)` and stored as `readonly` properties.
expected: The class should have `private readonly page: Page` and readonly Locator properties for email, password, and submit button. The constructor takes `page: Page` and initializes all locators. `goto()` calls `this.page.goto('/login')`. `login()` fills both fields and clicks submit using the stored locators.

## ANALOGY
A Page Object Model is like the remote control for a TV. Without a remote (without POM), you'd walk to the TV every time, find the right button on the panel, press it, walk back — and every family member would need to know where each button is on that specific TV model. The remote (POM) gives you labeled buttons: "Volume Up", "Channel 3", "Mute". You don't know or care HOW the TV processes the signal — you just press the meaningful button. If the TV manufacturer moves the physical buttons (devs change CSS classes), you get a new remote (update one class) and every family member (every test) keeps working without relearning anything. The class constructor is like the remote's battery compartment — it sets up everything the remote needs to function.

## CODE
```typescript
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async loginAs(email: string, password: string): Promise<DashboardPage> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await expect(this.page).toHaveURL(/.*dashboard/);
    return new DashboardPage(this.page);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
```
highlight: [3, 4, 10, 23, 28]
annotation: Line 3 — `export class` makes it importable by test files. Line 4 — `private readonly` means only this class can access `page`, and it can never be reassigned after construction. Line 10 — the constructor is called once with `new LoginPage(page)` and sets up all locators eagerly (they don't query the DOM until used). Line 23 — `loginAs()` returns a `DashboardPage` object, enabling method chaining that models real navigation flow. Line 28 — returning a new page object tells the test "after login, you're now on the dashboard" — the type system enforces correct page transitions.

## BREAK_IT
setup:
```typescript
import { type Page, type Locator, expect } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;
  public readonly addToCartBtn: Locator;
  private readonly cartCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartBtn = page.getByRole('button', { name: 'Add to Cart' });
    this.cartCount = page.getByTestId('cart-count');
  }

  async addToCart(): Promise<void> {
    await this.addToCartBtn.click();
  }

  async getCartCount(): Promise<string> {
    return await this.cartCount.textContent() ?? '0';
  }
}
```
modification: Change `private readonly cartCount: Locator` to `private cartCount: Locator` (remove `readonly`), then add `this.cartCount = page.getByTestId('wrong-id');` inside the `addToCart()` method.
question: What happens when you remove readonly and accidentally reassign a locator inside a method?
options: [TypeScript error — readonly prevents reassignment, No error — cartCount silently points to wrong element and getCartCount() returns wrong data forever after addToCart() is called, Runtime crash — locators cannot be reassigned]
correct: 1
explanation: Without `readonly`, TypeScript allows the reassignment. After `addToCart()` runs, `this.cartCount` permanently points to `'wrong-id'` instead of `'cart-count'`. Every subsequent call to `getCartCount()` queries the wrong element — and the bug is incredibly hard to trace because the test might pass or fail depending on whether `addToCart()` was called first. `readonly` prevents this entire category of bugs. It's not just about intent — it's a safety net against accidental mutations in complex page objects that multiple tests share.

## CONTRAST
label: Flat test vs Page Object Model — Maintainability at scale
codeA:
```typescript
// Flat test — selectors scattered across 50 test files
test('login success', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('user@test.com');
  await page.getByLabel('Password').fill('Pass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
});

test('login failure', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('wrong@test.com');
  await page.getByLabel('Password').fill('bad');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid credentials');
});
```
codeB:
```typescript
// Page Object — selectors defined ONCE, used everywhere
test('login success', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  const dashboard = await loginPage.loginAs('user@test.com', 'Pass123!');
  await dashboard.expectLoaded();
});

test('login failure', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('wrong@test.com', 'bad');
  await loginPage.expectError('Invalid credentials');
});
```
question: The devs change the login button text from "Sign in" to "Log in". With 50 test files using flat tests, how many places need updating vs using POM?
options: [50 files vs 50 files — same effort either way, 50 files vs 1 file (the LoginPage class), 50 files vs 0 files — POM auto-updates, 1 file vs 1 file — find-and-replace handles both]
correct: 1
explanation: With POM, the selector `getByRole('button', { name: 'Sign in' })` exists in exactly ONE place — the LoginPage constructor. Change it there and all 50 test files work immediately. With flat tests, you'd need to find and update every single file that references that button. This is the core value of POM — it creates a single source of truth for page structure. When the UI changes (and it WILL change), you update one class, not your entire test suite.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how TypeScript classes and the Page Object Model pattern improve test maintenance.
sentence: A _____ stores the Page object and creates Locators once in the _____, and the _____ keyword prevents properties from being accidentally reassigned after initialization.
blanks: [constructor, constructor, readonly]
distractors: [function, method, private]

## CONNECT
text: The Page Object Model is the foundation of professional test architecture. In real SDET work, you'll build entire frameworks with page objects for every page, component objects for reusable widgets, and fixture extensions that provide pre-built page objects. Future units will cover advanced patterns like fixtures, test hooks, parallel execution, and API testing — all built on top of the POM foundation.
```typescript
// Where POM leads — Playwright fixtures that auto-provide page objects
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// Custom fixture extends base test with typed page objects
type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

// Now tests get page objects automatically — zero setup per test
test('quick test', async ({ loginPage, dashboardPage }) => {
  const dash = await loginPage.loginAs('admin@co.com', 'pass');
  await dash.expectWelcomeMessage('Admin');
});
```
note: You've now completed the foundational Playwright + TypeScript units. You can write structured tests, find elements accessibly, assert outcomes, interact with forms, and organize code into maintainable page objects. The next phases will build on this — adding API testing, visual regression, CI/CD integration, and advanced TypeScript patterns like generics and decorators.
