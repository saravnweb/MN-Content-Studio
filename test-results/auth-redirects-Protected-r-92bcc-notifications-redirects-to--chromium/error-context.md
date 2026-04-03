# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-redirects.spec.ts >> Protected route redirects (unauthenticated) >> /notifications redirects to /
- Location: tests\e2e\auth-redirects.spec.ts:19:9

# Error details

```
Error: page.goto: net::ERR_INSUFFICIENT_RESOURCES at http://localhost:3000/notifications
Call log:
  - navigating to "http://localhost:3000/notifications", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * These tests verify that unauthenticated users are redirected
  5  |  * correctly by the middleware — no auth credentials needed.
  6  |  */
  7  | 
  8  | test.describe('Protected route redirects (unauthenticated)', () => {
  9  |   const creatorRoutes = [
  10 |     '/dashboard',
  11 |     '/deals',
  12 |     '/profile',
  13 |     '/settings',
  14 |     '/earnings',
  15 |     '/notifications',
  16 |   ]
  17 | 
  18 |   for (const route of creatorRoutes) {
  19 |     test(`${route} redirects to /`, async ({ page }) => {
> 20 |       const response = await page.goto(route)
     |                                   ^ Error: page.goto: net::ERR_INSUFFICIENT_RESOURCES at http://localhost:3000/notifications
  21 |       // Middleware redirects unauthenticated creator routes to '/'
  22 |       await expect(page).toHaveURL('/')
  23 |     })
  24 |   }
  25 | 
  26 |   const adminRoutes = [
  27 |     '/admin',
  28 |     '/admin/campaigns',
  29 |     '/admin/creators',
  30 |     '/admin/brands',
  31 |     '/admin/applications',
  32 |     '/admin/submissions',
  33 |     '/admin/payouts',
  34 |     '/admin/inquiries',
  35 |   ]
  36 | 
  37 |   for (const route of adminRoutes) {
  38 |     test(`${route} redirects to /admin-login`, async ({ page }) => {
  39 |       await page.goto(route)
  40 |       await expect(page).toHaveURL('/admin-login')
  41 |     })
  42 |   }
  43 | })
  44 | 
  45 | test.describe('Onboarding route', () => {
  46 |   test('/onboarding redirects unauthenticated users to /', async ({ page }) => {
  47 |     await page.goto('/onboarding')
  48 |     await expect(page).toHaveURL('/')
  49 |   })
  50 | })
  51 | 
```