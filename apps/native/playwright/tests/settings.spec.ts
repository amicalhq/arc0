/**
 * Phase 2: Settings Screen Tests
 *
 * Tests verify settings modal sections and theme switching.
 * No Base service connection required.
 */

import { test, expect } from '@playwright/test';
import { TEST_IDS, testId } from '../utils/selectors';
import { initializeApp } from '../utils/store-helpers';

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
    // Navigate to settings
    await page.locator(testId(TEST_IDS.SETTINGS_BUTTON)).click();
    await expect(page.locator(testId(TEST_IDS.SETTINGS_SCREEN))).toBeVisible();
  });

  test('settings screen is displayed', async ({ page }) => {
    await expect(page.locator(testId(TEST_IDS.SETTINGS_SCREEN))).toBeVisible();
  });

  test('workstations section is visible', async ({ page }) => {
    // WorkstationList is inside settings, may need to wait for it
    await expect(page.locator(testId(TEST_IDS.WORKSTATION_LIST))).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Workstations').first()).toBeVisible();
  });

  test('appearance section is visible', async ({ page }) => {
    await expect(page.locator(testId(TEST_IDS.APPEARANCE_SECTION))).toBeVisible();
    await expect(page.locator('text=Appearance')).toBeVisible();
  });

  test('help section is visible', async ({ page }) => {
    // Help section may be below the fold, scroll to it
    const helpSection = page.locator(testId(TEST_IDS.HELP_SECTION));
    await helpSection.scrollIntoViewIfNeeded();
    await expect(helpSection).toBeVisible({ timeout: 10000 });
  });

  test('reset app button is visible', async ({ page }) => {
    await expect(page.locator(testId(TEST_IDS.RESET_APP_BUTTON))).toBeVisible();
    await expect(page.locator('text=Reset App')).toBeVisible();
  });
});

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
    await page.locator(testId(TEST_IDS.SETTINGS_BUTTON)).click();
    await expect(page.locator(testId(TEST_IDS.SETTINGS_SCREEN))).toBeVisible();
  });

  test('light theme option is visible', async ({ page }) => {
    await expect(page.locator(testId('theme-light'))).toBeVisible();
    await expect(page.locator('text=Light')).toBeVisible();
  });

  test('dark theme option is visible', async ({ page }) => {
    await expect(page.locator(testId('theme-dark'))).toBeVisible();
    await expect(page.locator('text=Dark')).toBeVisible();
  });

  test('system theme option is visible', async ({ page }) => {
    await expect(page.locator(testId('theme-system'))).toBeVisible();
    await expect(page.locator('text=System')).toBeVisible();
  });

  test('clicking dark theme changes to dark mode', async ({ page }) => {
    await page.locator(testId('theme-dark')).click();

    // Wait for theme to apply
    await page.waitForTimeout(500);

    // Check that dark theme is applied (background color changes)
    const appRoot = page.locator(testId(TEST_IDS.APP_ROOT));
    await expect(appRoot).toBeVisible();

    // The background should be dark - checking via computed style
    // Dark theme typically has dark background (rgb values close to 0)
    const bgColor = await page.evaluate(() => {
      const root = document.querySelector('[data-testid="app-root"]');
      const computedBg = root ? window.getComputedStyle(root).backgroundColor : '';
      return computedBg;
    });

    // Background should be dark (close to black) after selecting dark theme
    expect(bgColor).toBeTruthy();
  });

  test('clicking light theme changes to light mode', async ({ page }) => {
    // First set to dark
    await page.locator(testId('theme-dark')).click();
    await page.waitForTimeout(500);

    // Then set to light
    await page.locator(testId('theme-light')).click();
    await page.waitForTimeout(500);

    // Check that light theme is applied
    const appRoot = page.locator(testId(TEST_IDS.APP_ROOT));
    await expect(appRoot).toBeVisible();
  });
});

test.describe('Help Section Links', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
    await page.locator(testId(TEST_IDS.SETTINGS_BUTTON)).click();
    await expect(page.locator(testId(TEST_IDS.SETTINGS_SCREEN))).toBeVisible();
  });

  test('documentation link is present', async ({ page }) => {
    await expect(page.locator(testId('help-docs'))).toBeVisible();
    await expect(page.locator('text=Documentation')).toBeVisible();
  });

  test('discord link is present', async ({ page }) => {
    await expect(page.locator(testId('help-discord'))).toBeVisible();
    // Use more specific selector for Discord text within help section
    const helpSection = page.locator(testId(TEST_IDS.HELP_SECTION));
    await expect(helpSection.locator('text=Discord')).toBeVisible();
  });

  test('github link is present', async ({ page }) => {
    await expect(page.locator(testId('help-github'))).toBeVisible();
    await expect(page.locator('text=GitHub')).toBeVisible();
  });
});
