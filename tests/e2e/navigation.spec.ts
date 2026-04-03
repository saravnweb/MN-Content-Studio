import { test, expect } from '@playwright/test'

test.describe('Site navigation', () => {
  test('login page links back to home via logo', async ({ page }) => {
    await page.goto('/login')
    // BrandLogo has withLink=true, click the logo/link
    await page.locator('a').filter({ hasText: /MW|Content Studio/i }).first().click()
    await expect(page).toHaveURL('/')
  })

  test('404 for unknown routes shows not-found page', async ({ page }) => {
    const response = await page.goto('/this-does-not-exist-xyz')
    // Next.js returns 404 status for unmatched routes
    expect(response?.status()).toBe(404)
  })

  test('brands signup → success redirects to success state', async ({ page }) => {
    // Mock the API to return success without hitting the real DB
    await page.route('/api/brands/inquire', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })

    await page.goto('/brands/signup')

    await page.getByPlaceholder('Acme Corp').fill('E2E Test Brand')
    await page.getByPlaceholder(/Priya Subramaniam/).fill('E2E Tester')
    await page.getByPlaceholder(/priya@acmecorp/).fill('e2e@testbrand.com')
    await page.getByRole('button', { name: 'YouTube' }).click()
    await page.getByRole('textbox', { name: /campaign brief/i }).fill('This is an automated e2e test submission.')

    await page.getByRole('button', { name: /submit campaign enquiry/i }).click()

    // Success state
    await expect(page.getByText(/we've got your details/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /back to for brands/i })).toBeVisible()
  })

  test('brands signup success → back to brands link works', async ({ page }) => {
    await page.route('/api/brands/inquire', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
    })

    await page.goto('/brands/signup')
    await page.getByPlaceholder('Acme Corp').fill('E2E Test Brand')
    await page.getByPlaceholder(/Priya Subramaniam/).fill('E2E Tester')
    await page.getByPlaceholder(/priya@acmecorp/).fill('e2e@testbrand.com')
    await page.getByRole('button', { name: 'Both' }).click()
    await page.getByRole('textbox', { name: /campaign brief/i }).fill('Automated test.')
    await page.getByRole('button', { name: /submit campaign enquiry/i }).click()

    await expect(page.getByText(/we've got your details/i)).toBeVisible()
    await page.getByRole('link', { name: /back to for brands/i }).click()
    await expect(page).toHaveURL('/brands')
  })
})
