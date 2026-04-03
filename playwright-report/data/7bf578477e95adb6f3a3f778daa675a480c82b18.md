# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Visual Regression >> brand signup page should look consistent
- Location: tests\e2e\visual.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/brands/signup", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Visual Regression', () => {
  4  |   test('homepage should look consistent', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Wait for everything to settle (images, fonts, etc.)
  8  |     await page.waitForLoadState('networkidle');
  9  |     
  10 |     // This will take a screenshot and compare it with the baseline.
  11 |     // The first time you run this, it will fail and create the baseline images.
  12 |     await expect(page).toHaveScreenshot('homepage.png', {
  13 |       maxDiffPixelRatio: 0.1, // Allow for small differences (e.g. anti-aliasing)
  14 |       fullPage: true,
  15 |     });
  16 |   });
  17 | 
  18 |   test('brand signup page should look consistent', async ({ page }) => {
> 19 |     await page.goto('/brands/signup');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  20 |     await page.waitForLoadState('networkidle');
  21 |     
  22 |     await expect(page).toHaveScreenshot('brand-signup.png', {
  23 |       maxDiffPixelRatio: 0.1,
  24 |       fullPage: true,
  25 |     });
  26 |   });
  27 | });
  28 | 
```