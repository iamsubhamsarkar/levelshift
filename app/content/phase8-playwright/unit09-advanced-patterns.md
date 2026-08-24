---
unit: p8u9
title: Advanced Patterns
teaches: [playwright.multi_page, playwright.iframes, playwright.downloads, playwright.visual, typescript.utility_types]
requires: [playwright.fixtures, playwright.api_mock, typescript.generics_advanced]
---

## HOOK
question: One line catches visual bugs. It pixel-diffs against a golden image. How can a single assertion replace hours of manual visual QA?
```typescript
import { test, expect } from '@playwright/test';

test('homepage looks correct', async ({ page }) => {
  await page.goto('https://demo.example.com');
  await expect(page).toHaveScreenshot(); // That's it. Pixel-perfect comparison.
});
// First run: saves a golden screenshot in __snapshots__/
// Subsequent runs: diffs current page against golden image
// Fails if >0.2% pixels differ (configurable threshold)
```

## FAIL_FIRST
prompt: Write a test that opens a popup window (new tab) when clicking a "Open Preview" button, then verifies the popup shows the text "Preview Mode". Use page.waitForEvent to catch the new page.
```typescript
import { test, expect } from '@playwright/test';

test('handle popup window', async ({ page }) => {
  await page.goto('https://editor.example.com');
  // TODO: Click "Open Preview" button and capture the popup page
  // TODO: Wait for the popup to load
  // TODO: Assert the popup contains "Preview Mode"
});
```
hint: Use `const [popup] = await Promise.all([page.waitForEvent('popup'), page.click('#open-preview')])` to catch the new page.
expected: The solution uses Promise.all to register the popup listener before clicking, then uses the returned Page object to assert content: `await expect(popup.locator('h1')).toContainText('Preview Mode')`.

## ANALOGY
Think of advanced Playwright patterns like being a film director managing multiple camera angles simultaneously. A regular test is one camera following one actor. Multi-page testing is having cameras in different rooms catching different actors at the same time. iframes are like TVs within the scene — you need to "zoom into" the TV screen to interact with what's playing on it. File downloads are like props being handed off-stage — you need to watch for the handoff and verify the prop is correct. And visual regression is like comparing today's footage frame-by-frame against yesterday's approved cut — any unintended change gets flagged immediately. TypeScript's utility types are your director's shorthand: "give me this actor's costume but without the hat (Omit)" or "only their shoes and jacket (Pick)."

## CODE
```typescript
import { test, expect, Page, BrowserContext } from '@playwright/test';

// Utility types for test configuration
type FullConfig = {
  baseURL: string;
  apiURL: string;
  timeout: number;
  retries: number;
  viewport: { width: number; height: number };
};

// Partial<T> — all properties optional (for overrides)
type ConfigOverride = Partial<FullConfig>;

// Pick<T, K> — only selected properties
type MinimalConfig = Pick<FullConfig, 'baseURL' | 'timeout'>;

// Omit<T, K> — everything except specified
type PublicConfig = Omit<FullConfig, 'apiURL'>;

// Record<K, V> — typed dictionary
type BrowserViewports = Record<'mobile' | 'tablet' | 'desktop', { width: number; height: number }>;

const viewports: BrowserViewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

test('multi-context: admin and user see different views', async ({ browser }) => {
  const adminCtx: BrowserContext = await browser.newContext();
  const userCtx: BrowserContext = await browser.newContext();

  const adminPage: Page = await adminCtx.newPage();
  const userPage: Page = await userCtx.newPage();

  // Admin logs in and navigates
  await adminPage.goto('/login');
  await adminPage.fill('#email', 'admin@example.com');
  await adminPage.fill('#password', 'admin123');
  await adminPage.click('#submit');

  // User logs in separately
  await userPage.goto('/login');
  await userPage.fill('#email', 'user@example.com');
  await userPage.fill('#password', 'user123');
  await userPage.click('#submit');

  // Verify different views
  await expect(adminPage.locator('[data-role="admin-panel"]')).toBeVisible();
  await expect(userPage.locator('[data-role="admin-panel"]')).toBeHidden();

  await adminCtx.close();
  await userCtx.close();
});
```
highlight: [13, 16, 19, 22, 30, 31, 32, 33]
annotation: Lines 13, 16, 19, 22 show the four key utility types — Partial makes all fields optional (perfect for config overrides), Pick selects specific fields, Omit removes fields, Record creates typed maps. Lines 30-33 show multi-context setup — each `browser.newContext()` creates an isolated browser session with separate cookies, storage, and auth state. This enables testing multi-user scenarios without interference.

## BREAK_IT
setup:
```typescript
import { test, expect } from '@playwright/test';

test('interact with iframe payment form', async ({ page }) => {
  await page.goto('https://checkout.example.com');

  // Access iframe content
  const paymentFrame = page.frameLocator('#payment-iframe');

  // Fill card details inside iframe
  await paymentFrame.locator('#card-number').fill('4242424242424242');
  await paymentFrame.locator('#expiry').fill('12/28');
  await paymentFrame.locator('#cvc').fill('123');

  // Click pay button inside iframe
  await paymentFrame.locator('#pay-btn').click();

  // Verify success message on PARENT page
  await expect(page.locator('.payment-success')).toBeVisible();
});
```
modification: Change `page.frameLocator('#payment-iframe')` to `page.locator('#payment-iframe')` — using a regular locator instead of frameLocator.
question: What happens when you use page.locator() instead of page.frameLocator() for an iframe?
options: [The locator finds the iframe element itself but cannot reach inside it — subsequent .locator() calls fail to find elements within the iframe, The locator automatically detects it's an iframe and switches context, The test throws a compile error because locator doesn't accept iframe selectors]
correct: 0
explanation: `page.locator('#payment-iframe')` finds the `<iframe>` DOM element on the parent page. When you chain `.locator('#card-number')` on it, Playwright looks for #card-number as a child of the iframe element in the parent DOM — which doesn't exist there. The card input lives INSIDE the iframe's document, which is a separate browsing context. `frameLocator()` is specifically designed to cross this boundary — it returns a FrameLocator that resolves selectors within the iframe's document. This distinction is critical for testing payment forms, embedded widgets, and third-party integrations.

## CONTRAST
label: File download handling vs File upload handling
codeA:
```typescript
// Download: intercepting browser's file save
test('download report', async ({ page }) => {
  // Start waiting for download BEFORE clicking
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#export-csv').click(),
  ]);

  // Verify download metadata
  expect(download.suggestedFilename()).toBe('report.csv');

  // Save to filesystem and verify content
  const path = await download.path();
  const content = require('fs').readFileSync(path!, 'utf-8');
  expect(content).toContain('Total Revenue');
});
```
codeB:
```typescript
// Upload: setting files on an input element
test('upload avatar', async ({ page }) => {
  await page.goto('/profile/settings');

  // Set file on input[type="file"] — no file dialog opens
  await page.locator('#avatar-input').setInputFiles('./fixtures/avatar.png');

  // Verify preview shows
  await expect(page.locator('.avatar-preview img')).toHaveAttribute(
    'src', /blob:|data:/
  );

  // Upload multiple files
  await page.locator('#attachments').setInputFiles([
    './fixtures/doc1.pdf',
    './fixtures/doc2.pdf',
  ]);

  // Clear file selection
  await page.locator('#avatar-input').setInputFiles([]);
});
```
question: Why does download use Promise.all + waitForEvent while upload uses a simple setInputFiles call?
options: [Downloads are asynchronous events triggered by navigation while uploads are synchronous DOM mutations, Downloads are events you must listen for BEFORE the triggering action or you'll miss them while uploads directly set the file input's value without triggering events, Uploads are faster because they don't involve network transfer, Downloads require special permissions from the browser]
correct: 1
explanation: A download is a browser event — once you click the button, the browser starts the download immediately. If you're not already listening (waitForEvent registered BEFORE click), you'll miss it. That's why Promise.all is needed — it starts listening and clicking simultaneously. An upload is different — `setInputFiles()` directly manipulates the file input's property, programmatically setting which files are "selected." It doesn't trigger a file dialog or emit an event you could miss. It's a direct, synchronous(ish) operation on the DOM element.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how Playwright handles iframes and why a special API is needed.
sentence: An iframe creates a separate _____ context, so you need _____ to cross the boundary and locate elements _____ the iframe's document.
blanks: [browsing, frameLocator(), inside]
distractors: [rendering, switchTo(), outside]

## CONNECT
text: These advanced patterns culminate in Unit 10's Framework Project. Multi-context testing, visual regression, and file handling all need proper configuration in playwright.config.ts. You'll configure screenshot thresholds, download paths, and parallel workers. The utility types (Partial, Record) will type your config objects and environment maps.
```typescript
// Preview: Framework config using patterns from this unit (Unit 10)
import { defineConfig, devices } from '@playwright/test';

type EnvConfig = Record<'dev' | 'staging' | 'prod', {
  baseURL: string;
  apiURL: string;
}>;

const environments: EnvConfig = {
  dev: { baseURL: 'http://localhost:3000', apiURL: 'http://localhost:4000' },
  staging: { baseURL: 'https://staging.app.com', apiURL: 'https://api.staging.app.com' },
  prod: { baseURL: 'https://app.com', apiURL: 'https://api.app.com' },
};

const env = (process.env.TEST_ENV || 'dev') as keyof EnvConfig;

export default defineConfig({
  use: {
    baseURL: environments[env].baseURL,
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
});
```
note: Unit 10 ties everything together — your multi-context tests, visual assertions, downloads, and utility types all get configured in one framework. Think of Unit 10 as the architecture that houses everything you've built.
