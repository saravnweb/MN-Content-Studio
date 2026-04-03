import { test, expect } from '@playwright/test'

test.describe('Brand signup form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brands/signup')
  })

  test('renders all required fields', async ({ page }) => {
    await expect(page.getByPlaceholder('Acme Corp')).toBeVisible()
    await expect(page.getByPlaceholder(/Priya Subramaniam/)).toBeVisible()
    await expect(page.getByPlaceholder(/priya@acmecorp/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'YouTube' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Instagram' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Both' })).toBeVisible()
  })

  test('submit button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /submit campaign enquiry/i })).toBeVisible()
  })

  test('platform selector toggles correctly', async ({ page }) => {
    const youtube = page.getByRole('button', { name: 'YouTube' })
    const instagram = page.getByRole('button', { name: 'Instagram' })

    await youtube.click()
    await expect(youtube).toHaveClass(/bg-indigo-600/)
    await expect(instagram).not.toHaveClass(/bg-indigo-600/)

    await instagram.click()
    await expect(instagram).toHaveClass(/bg-indigo-600/)
    await expect(youtube).not.toHaveClass(/bg-indigo-600/)
  })

  test('shows error when submitting without selecting a platform', async ({ page }) => {
    await page.getByPlaceholder('Acme Corp').fill('Test Brand')
    await page.getByPlaceholder(/Priya Subramaniam/).fill('Test User')
    await page.getByPlaceholder(/priya@acmecorp/).fill('test@brand.com')
    await page.getByRole('textbox', { name: /campaign brief/i }).fill('Test campaign brief description.')

    await page.getByRole('button', { name: /submit campaign enquiry/i }).click()
    await expect(page.getByText(/please select a target platform/i)).toBeVisible()
  })

  test('back link navigates to /brands', async ({ page }) => {
    await page.getByRole('link', { name: /back/i }).click()
    await expect(page).toHaveURL('/brands')
  })

  test('logo link navigates to /', async ({ page }) => {
    await page.locator('header').getByRole('link').first().click()
    await expect(page).toHaveURL('/')
  })
})
