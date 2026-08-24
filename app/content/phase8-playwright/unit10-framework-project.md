---
unit: p8u10
title: Framework Project
teaches: [playwright.config, playwright.reporters, playwright.ci, playwright.parallel, typescript.project_structure]
requires: [playwright.fixtures, playwright.multi_page, playwright.visual]
---

## HOOK
question: Same tests take 30 minutes locally. In CI, 200 tests finish in 2 minutes across 4 shards. How?
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push]
jobs:
  test:
    strategy:
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]  # 4 parallel machines
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}
      - uses: actions/upload-artifact@v4
        with:
          name: report-${{ matrix.shard }}
          path: playwright-report/
# Result: 200 tests ÷ 4 shards = ~50 tests per machine = 2 min total
```

## FAIL_FIRST
prompt: Create a playwright.config.ts that configures: 3 parallel workers, a 30-second test timeout, baseURL from an environment variable (defaulting to localhost:3000), and two projects — one for Chromium desktop and one for Mobile Safari.
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // TODO: Set workers to 3
  // TODO: Set timeout to 30 seconds
  // TODO: Set baseURL from process.env.BASE_URL or 'http://localhost:3000'
  // TODO: Define two projects: 'Desktop Chrome' and 'Mobile Safari'
});
```
hint: Use `devices['Desktop Chrome']` and `devices['iPhone 13']` from @playwright/test for device emulation projects.
expected: The config should have `workers: 3`, `timeout: 30_000`, `use: { baseURL: process.env.BASE_URL || 'http://localhost:3000' }`, and a `projects` array with `{ name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } }` and `{ name: 'Mobile Safari', use: { ...devices['iPhone 13'] } }`.

## ANALOGY
Think of a Playwright framework project like designing a restaurant franchise. A single test file is like one restaurant — it can function alone. But a framework is the franchise blueprint: the standard kitchen layout (project structure), the approved suppliers (dependencies in tsconfig), the quality checklist every location follows (reporters), the franchise-wide menu (shared fixtures), and the expansion plan (CI pipeline). You're not writing tests anymore — you're building the system that makes tests reliable, maintainable, and scalable. The config file is your franchise manual: it dictates how every location (project) operates, what equipment they use (browsers), and how many chefs work simultaneously (parallel workers).

## CODE
```typescript
// playwright.config.ts — production-grade configuration
import { defineConfig, devices } from '@playwright/test';

// Type-safe environment configuration
type Environment = 'local' | 'staging' | 'production';
const env = (process.env.TEST_ENV || 'local') as Environment;

const baseURLs: Record<Environment, string> = {
  local: 'http://localhost:3000',
  staging: 'https://staging.myapp.com',
  production: 'https://myapp.com',
};

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 60_000,
  retries: env === 'local' ? 0 : 2,
  workers: env === 'local' ? undefined : 4, // undefined = half CPU cores
  fullyParallel: true,

  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'results.json' }],
    ['github'],  // Annotations in GitHub Actions
  ],

  use: {
    baseURL: baseURLs[env],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: baseURLs[env].replace('myapp', 'api.myapp') },
    },
  ],
});
```
highlight: [5, 6, 8, 9, 10, 11, 19, 20, 23, 24, 25, 26, 38, 39, 40]
annotation: Lines 5-11 show type-safe environment config using Record — the compiler ensures every environment has a URL. Lines 19-20 show conditional config (retries only in CI, workers scale to hardware). Lines 23-26 configure multiple reporters simultaneously — HTML for local review, JSON for parsing, GitHub for PR annotations. Lines 38-40 show projects — each is an independent test suite with its own browser/device config. The API project (lines 41-44) has its own testDir and baseURL, separating API tests from UI tests architecturally.

## BREAK_IT
setup:
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 4,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox', use: { channel: undefined } },
  ],
});

// tests/dashboard.spec.ts
import { test } from '@playwright/test';

test('load dashboard', async ({ page }) => {
  await page.goto('/dashboard'); // uses baseURL
  await page.locator('#chart').waitFor();
});
```
modification: Change `fullyParallel: true` to `fullyParallel: false` while keeping `workers: 4`.
question: What changes when fullyParallel is false but workers is 4?
options: [Tests within the same file run sequentially but different files can run in parallel across 4 workers, All tests run sequentially regardless of worker count, Tests still run in parallel but the order is reversed]
correct: 0
explanation: `fullyParallel: true` means every individual test can run on any available worker independently. `fullyParallel: false` means tests within the same spec file run sequentially (in order), but different spec files can still be distributed across workers. With 4 workers and 10 spec files, up to 4 files run simultaneously, but within each file, tests execute one-by-one. This matters when tests in a file share state via hooks or have ordering dependencies. It's the difference between "parallelize everything" and "parallelize at the file level only."

## CONTRAST
label: tsconfig paths (module aliases) vs Relative imports
codeA:
```typescript
// tsconfig.json with path aliases
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["tests/pages/*"],
      "@fixtures/*": ["tests/fixtures/*"],
      "@utils/*": ["tests/utils/*"]
    }
  }
}

// Usage in test file:
import { LoginPage } from '@pages/login.page';
import { test } from '@fixtures/auth.fixture';
import { generateUser } from '@utils/data.factory';
```
codeB:
```typescript
// Without path aliases — relative imports
// File: tests/e2e/checkout/payment.spec.ts

import { LoginPage } from '../../pages/login.page';
import { test } from '../../fixtures/auth.fixture';
import { generateUser } from '../../utils/data.factory';

// Move the file? All imports break.
// Deeper nesting? More ../../../ chaos.
// New team member? Good luck navigating.
```
question: What problem do TypeScript path aliases solve in a test framework?
options: [They make tests run faster by caching module resolution, They eliminate fragile relative paths so imports don't break when files move and deeply nested tests stay readable, They enable tree-shaking to reduce bundle size in production, They are required by Playwright's test runner for fixture resolution]
correct: 1
explanation: Path aliases (`@pages/*`, `@fixtures/*`) map to absolute paths from the project root. This means `@pages/login.page` always resolves to `tests/pages/login.page` regardless of where the importing file lives. Move a test file from `tests/e2e/` to `tests/e2e/checkout/nested/`? All imports still work. No `../../` counting. No broken imports. The tradeoff: you need tsconfig.json configured, and your IDE needs to understand the aliases (most do automatically). For a large test framework with 50+ files across nested directories, aliases are essential for maintainability.

## EXPLAIN_BACK
mode: fill_blank
prompt: Explain how Playwright's sharding and parallel execution work together in CI.
sentence: Sharding splits the test suite across multiple _____, while workers control parallelism _____ each machine, and fullyParallel determines if tests within a _____ can interleave.
blanks: [CI machines, within, file]
distractors: [browsers, between, project]

## CONNECT
text: This unit completes the Playwright phase. You now have everything needed to build production test frameworks — from locators (Unit 2) through Page Objects (Unit 5), async patterns (Unit 6), API testing (Unit 7), fixtures (Unit 8), advanced patterns (Unit 9), to full framework architecture here. The skills compound — your TypeScript journey from basic types to generics to utility types to project configuration mirrors real SDET career growth.
```typescript
// The complete framework structure you can now build:
// tests/
// ├── fixtures/
// │   ├── auth.fixture.ts        (Unit 8: custom fixtures)
// │   └── api.fixture.ts         (Unit 7+8: API + fixtures)
// ├── pages/
// │   ├── login.page.ts          (Unit 5: Page Objects)
// │   └── dashboard.page.ts      (Unit 5: POM)
// ├── e2e/
// │   ├── checkout.spec.ts       (Unit 6: async waits)
// │   ├── admin.spec.ts          (Unit 9: multi-context)
// │   └── visual.spec.ts         (Unit 9: screenshots)
// ├── api/
// │   └── users.api.spec.ts      (Unit 7: API testing)
// ├── utils/
// │   └── data.factory.ts        (TS generics + utility types)
// ├── playwright.config.ts       (This unit: config)
// └── tsconfig.json              (This unit: project setup)

import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    { name: 'chromium', dependencies: ['setup'], use: { channel: 'chrome' } },
    { name: 'api', testDir: './tests/api' },
  ],
});
```
note: You're not just writing tests anymore — you're architecting test infrastructure. This is the difference between a manual tester who automates and an SDET who builds scalable quality systems. Take this structure into your portfolio projects.
