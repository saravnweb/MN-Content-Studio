import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should look consistent', async ({ page }) => {
    await page.goto('/');
    
    // Wait for everything to settle (images, fonts, etc.)
    await page.waitForLoadState('networkidle');
    
    // This will take a screenshot and compare it with the baseline.
    // The first time you run this, it will fail and create the baseline images.
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.1, // Allow for small differences (e.g. anti-aliasing)
      fullPage: true,
    });
  });

  test('brand signup page should look consistent', async ({ page }) => {
    await page.goto('/brands/signup');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('brand-signup.png', {
      maxDiffPixelRatio: 0.1,
      fullPage: true,
    });
  });
});
