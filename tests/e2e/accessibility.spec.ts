import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG 2.2)', () => {
  test('homepage should pass accessibility audit', async ({ page }) => {
    // Navigate to the page you want to test
    await page.goto('/');

    // Optional: Wait for any dynamic content to load
    await page.waitForLoadState('networkidle');

    // Run the accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa'])
      .analyze();

    // Check for violations
    // If you want the test to fail on violations, keep the expectation below.
    // If you just want to see the report, you can console.log(accessibilityScanResults.violations);
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('onboarding page should pass accessibility audit', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
