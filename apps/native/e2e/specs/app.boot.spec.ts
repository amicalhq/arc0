import { $, browser, expect } from '@wdio/globals';

describe('App Boot', () => {
  before(async () => {
    // Wait for app to initialize
    await browser.pause(3000);

    // Dismiss Expo dev menu if it appears (debug builds only)
    const continueBtn = await $('//*[@text="Continue"]');
    try {
      await continueBtn.waitForDisplayed({ timeout: 5000 });
      await continueBtn.click();
      await browser.pause(2000);
    } catch {
      // Dev menu didn't appear or already dismissed - continue
    }

    // Press back to dismiss any remaining modals
    try {
      await browser.execute('mobile: pressKey', { keycode: 4 });
      await browser.pause(1000);
    } catch {
      // Ignore
    }
  });

  it('should launch successfully', async () => {
    const appRoot = await $('~app-root');
    await appRoot.waitForDisplayed({ timeout: 30000 });
    await expect(appRoot).toBeDisplayed();
  });

  it('should show the main screen after boot', async () => {
    const appRoot = await $('~app-root');
    await expect(appRoot).toExist();
  });
});
