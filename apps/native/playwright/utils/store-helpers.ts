/**
 * Helper functions for manipulating the OPFS store in Playwright tests.
 * These helpers allow tests to clear state, seed data, etc.
 */

import { Page } from '@playwright/test';

const WEB_STORE_FILENAME = 'arc0-store.json';

/**
 * Clear all OPFS storage to reset the app state.
 * This is useful for ensuring a clean slate between tests.
 *
 * Note: This may fail if the store is currently locked by the app.
 * In that case, we silently continue - the app state may not be fully reset.
 */
export async function clearOPFSStore(page: Page): Promise<boolean> {
  return await page.evaluate(async (filename) => {
    try {
      const opfs = await navigator.storage.getDirectory();
      await opfs.removeEntry(filename);
      return true;
    } catch (err) {
      // Ignore NotFoundError - store doesn't exist yet
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        return true;
      }
      // Ignore NoModificationAllowedError - store is locked by app
      if (err instanceof DOMException && err.name === 'NoModificationAllowedError') {
        console.warn('OPFS store is locked, cannot clear');
        return false;
      }
      // Log other errors but don't throw
      console.warn('Failed to clear OPFS store:', err);
      return false;
    }
  }, WEB_STORE_FILENAME);
}

/**
 * Wait for the app to be fully loaded and initialized.
 * Checks for the app-root testID to be visible.
 */
export async function waitForAppReady(page: Page): Promise<void> {
  await page.locator('[data-testid="app-root"]').waitFor({ state: 'visible', timeout: 30000 });
}

/**
 * Navigate to the app and wait for it to be ready.
 * Optionally clears OPFS store first for a clean state.
 *
 * Note: clearStore uses a fresh page context before loading app to avoid lock issues.
 */
export async function initializeApp(
  page: Page,
  options: { clearStore?: boolean } = {}
): Promise<void> {
  const { clearStore = false } = options;

  if (clearStore) {
    // Navigate to a blank page first to release any OPFS locks
    await page.goto('about:blank');

    // Try to clear store from blank page context
    // This creates a minimal page just to clear storage
    await page.evaluate(async (filename) => {
      try {
        const opfs = await navigator.storage.getDirectory();
        await opfs.removeEntry(filename);
      } catch {
        // Ignore errors - store may not exist or may be inaccessible
      }
    }, WEB_STORE_FILENAME);
  }

  await page.goto('/');
  await waitForAppReady(page);
}

/**
 * Add a workstation via the UI.
 * Navigates to settings, opens the add modal, fills in details.
 */
export async function addWorkstationViaUI(
  page: Page,
  config: { name?: string; url: string; secret: string }
): Promise<void> {
  // Navigate to settings
  await page.locator('[data-testid="settings-button"]').click();

  // Click add workstation button
  await page.locator('[data-testid="add-workstation-button"]').click();

  // Fill in URL
  await page.locator('[data-testid="workstation-url-input"]').fill(config.url);

  // Fill in secret
  await page.locator('[data-testid="workstation-secret-input"]').fill(config.secret);

  // Optionally fill in name
  if (config.name) {
    await page.locator('[data-testid="workstation-name-input"]').fill(config.name);
  }

  // Test connection first
  await page.locator('[data-testid="workstation-test-button"]').click();

  // Wait for test to complete (success message)
  await page.locator('text=Connected successfully').waitFor({ timeout: 20000 });

  // Save
  await page.locator('[data-testid="workstation-save-button"]').click();

  // Wait for modal to close
  await page.locator('[data-testid="workstation-save-button"]').waitFor({ state: 'hidden' });
}
