import { test, expect } from '@playwright/test';

/**
 * Smoke test to verify Playwright is set up correctly
 */
test.describe('Setup', () => {
  test('Playwright should be working', async ({ page }) => {
    await page.goto('https://github.com');
    await expect(page).toHaveTitle(/GitHub/);
  });
});
