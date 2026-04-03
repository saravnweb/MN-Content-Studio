import { test, expect } from '@playwright/test'

/**
 * These tests verify that unauthenticated users are redirected
 * correctly by the middleware — no auth credentials needed.
 */

test.describe('Protected route redirects (unauthenticated)', () => {
  const creatorRoutes = [
    '/dashboard',
    '/deals',
    '/profile',
    '/settings',
    '/earnings',
    '/notifications',
  ]

  for (const route of creatorRoutes) {
    test(`${route} redirects to /`, async ({ page }) => {
      const response = await page.goto(route)
      // Middleware redirects unauthenticated creator routes to '/'
      await expect(page).toHaveURL('/')
    })
  }

  const adminRoutes = [
    '/admin',
    '/admin/campaigns',
    '/admin/creators',
    '/admin/brands',
    '/admin/applications',
    '/admin/submissions',
    '/admin/payouts',
    '/admin/inquiries',
  ]

  for (const route of adminRoutes) {
    test(`${route} redirects to /admin-login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL('/admin-login')
    })
  }
})

test.describe('Onboarding route', () => {
  test('/onboarding redirects unauthenticated users to /', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL('/')
  })
})
