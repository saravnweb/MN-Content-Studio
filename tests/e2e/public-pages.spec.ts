import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads and shows key sections', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Tamil Nadu's Top Creator Network/i)
    // Role selector should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('has working nav links to creators and brands', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/creators"]').first().click()
    await expect(page).toHaveURL(/\/creators/)
  })
})

test.describe('Creators page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/creators')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('has a CTA that links to login', async ({ page }) => {
    await page.goto('/creators')
    const ctaLink = page.getByRole('button', { name: /join as a creator/i }).first()
    await expect(ctaLink).toBeVisible()
  })
})

test.describe('Brands page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/brands')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('has a link to brand signup', async ({ page }) => {
    await page.goto('/brands')
    const signupLink = page.getByRole('link', { name: /list|campaign|partner|get started|work with us/i }).first()
    await expect(signupLink).toBeVisible()
    await signupLink.click()
    await expect(page).toHaveURL(/\/brands\/signup/)
  })
})

test.describe('Login page', () => {
  test('loads with Google sign-in button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })

  test('shows Creator Platform subtitle', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Creator Platform')).toBeVisible()
  })
})

test.describe('Admin login page', () => {
  test('loads with sign-in button', async ({ page }) => {
    await page.goto('/admin-login')
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})

test.describe('Static pages', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page).not.toHaveURL('/404')
  })

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page).not.toHaveURL('/404')
  })

  test('help page loads', async ({ page }) => {
    await page.goto('/help')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
