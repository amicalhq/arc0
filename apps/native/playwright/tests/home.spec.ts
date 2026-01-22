/**
 * Phase 1: Basic Smoke Tests
 *
 * Tests verify app loads and displays correctly with no workstations configured.
 * No Base service connection required.
 */

import { test, expect } from '@playwright/test';
import { TEST_IDS, testId } from '../utils/selectors';
import { initializeApp } from '../utils/store-helpers';

test.describe('Home Screen - No Workstations', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
  });

  test('app root element is visible', async ({ page }) => {
    await expect(page.locator(testId(TEST_IDS.APP_ROOT))).toBeVisible();
  });

  test('welcome message is displayed', async ({ page }) => {
    // Use .first() because on mobile viewport, welcome appears in both drawer and main content
    await expect(page.locator(testId(TEST_IDS.HOME_WELCOME)).first()).toBeVisible();
    await expect(page.locator('text=Welcome to Arc0').first()).toBeVisible();
  });

  test('connect workstation button is visible', async ({ page }) => {
    // Use .first() for mobile viewport compatibility
    await expect(page.locator(testId(TEST_IDS.CONNECT_WORKSTATION_BUTTON)).first()).toBeVisible();
  });

  test('connect workstation button text is correct', async ({ page }) => {
    const button = page.locator(testId(TEST_IDS.CONNECT_WORKSTATION_BUTTON)).first();
    await expect(button).toContainText('Connect Workstation');
  });

  test('setup instructions mention Discord help', async ({ page }) => {
    await expect(page.locator('text=Discord').first()).toBeVisible();
  });

  test('click connect workstation navigates to settings', async ({ page }) => {
    await page.locator(testId(TEST_IDS.CONNECT_WORKSTATION_BUTTON)).first().click();
    await expect(page.locator(testId(TEST_IDS.SETTINGS_SCREEN))).toBeVisible();
  });
});
