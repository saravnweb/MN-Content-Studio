# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: brand-signup.spec.ts >> Brand signup form >> shows error when submitting without selecting a platform
- Location: tests\e2e\brand-signup.spec.ts:34:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/brands/signup", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Brand signup form', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/brands/signup')
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  6  |   })
  7  | 
  8  |   test('renders all required fields', async ({ page }) => {
  9  |     await expect(page.getByPlaceholder('Acme Corp')).toBeVisible()
  10 |     await expect(page.getByPlaceholder(/Priya Subramaniam/)).toBeVisible()
  11 |     await expect(page.getByPlaceholder(/priya@acmecorp/)).toBeVisible()
  12 |     await expect(page.getByRole('button', { name: 'YouTube' })).toBeVisible()
  13 |     await expect(page.getByRole('button', { name: 'Instagram' })).toBeVisible()
  14 |     await expect(page.getByRole('button', { name: 'Both' })).toBeVisible()
  15 |   })
  16 | 
  17 |   test('submit button is present', async ({ page }) => {
  18 |     await expect(page.getByRole('button', { name: /submit campaign enquiry/i })).toBeVisible()
  19 |   })
  20 | 
  21 |   test('platform selector toggles correctly', async ({ page }) => {
  22 |     const youtube = page.getByRole('button', { name: 'YouTube' })
  23 |     const instagram = page.getByRole('button', { name: 'Instagram' })
  24 | 
  25 |     await youtube.click()
  26 |     await expect(youtube).toHaveClass(/bg-indigo-600/)
  27 |     await expect(instagram).not.toHaveClass(/bg-indigo-600/)
  28 | 
  29 |     await instagram.click()
  30 |     await expect(instagram).toHaveClass(/bg-indigo-600/)
  31 |     await expect(youtube).not.toHaveClass(/bg-indigo-600/)
  32 |   })
  33 | 
  34 |   test('shows error when submitting without selecting a platform', async ({ page }) => {
  35 |     await page.getByPlaceholder('Acme Corp').fill('Test Brand')
  36 |     await page.getByPlaceholder(/Priya Subramaniam/).fill('Test User')
  37 |     await page.getByPlaceholder(/priya@acmecorp/).fill('test@brand.com')
  38 |     await page.getByRole('textbox', { name: /campaign brief/i }).fill('Test campaign brief description.')
  39 | 
  40 |     await page.getByRole('button', { name: /submit campaign enquiry/i }).click()
  41 |     await expect(page.getByText(/please select a target platform/i)).toBeVisible()
  42 |   })
  43 | 
  44 |   test('back link navigates to /brands', async ({ page }) => {
  45 |     await page.getByRole('link', { name: /back/i }).click()
  46 |     await expect(page).toHaveURL('/brands')
  47 |   })
  48 | 
  49 |   test('logo link navigates to /', async ({ page }) => {
  50 |     await page.locator('header').getByRole('link').first().click()
  51 |     await expect(page).toHaveURL('/')
  52 |   })
  53 | })
  54 | 
```