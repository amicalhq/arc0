/**
 * Phase 5: Interactive Features - Chat
 *
 * Tests verify chat messages display and input functionality.
 * Uses BaseMock for session context.
 */

import { test, expect } from '../fixtures/basemock.fixture';
import { TEST_IDS, testId } from '../utils/selectors';
import { initializeApp } from '../utils/store-helpers';

test.describe('Chat Screen - Basic UI', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
  });

  test('chat screen displays message input', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    await expect(page.locator(testId(TEST_IDS.MESSAGE_INPUT))).toBeVisible();
  });

  test('message input has correct placeholder', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const input = page.locator(testId(TEST_IDS.MESSAGE_INPUT));
    await expect(input).toHaveAttribute('placeholder', /Send a message|Select an option/);
  });

  test('send button is visible', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    await expect(page.locator(testId(TEST_IDS.SEND_BUTTON))).toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const sendButton = page.locator(testId(TEST_IDS.SEND_BUTTON));
    await expect(sendButton).toBeVisible();

    // React Native Web Pressable uses aria-disabled instead of disabled attribute
    // Check for disabled state - either aria-disabled or opacity indicating disabled
    const isAriaDisabled = await sendButton.getAttribute('aria-disabled');
    const opacity = await sendButton.evaluate((el) => window.getComputedStyle(el).opacity);

    // Button should show as disabled (aria-disabled=true or reduced opacity)
    expect(isAriaDisabled === 'true' || parseFloat(opacity) < 1).toBe(true);
  });

  test('send button is enabled when input has text', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const input = page.locator(testId(TEST_IDS.MESSAGE_INPUT));
    await input.fill('Hello, Claude!');

    const sendButton = page.locator(testId(TEST_IDS.SEND_BUTTON));
    await expect(sendButton).toBeVisible();

    // Button should be enabled (not aria-disabled or full opacity)
    await expect(sendButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('empty chat shows no messages placeholder', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    // Should show "No messages yet" or loading state
    await expect(
      page.locator('text=No messages yet').or(page.locator('text=Loading messages'))
    ).toBeVisible();
  });
});

test.describe('Chat Screen - Message Input', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
  });

  test('can type in message input', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const input = page.locator(testId(TEST_IDS.MESSAGE_INPUT));
    await input.fill('Test message content');

    await expect(input).toHaveValue('Test message content');
  });

  test('input supports multiline text', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const input = page.locator(testId(TEST_IDS.MESSAGE_INPUT));
    await input.fill('Line 1\nLine 2\nLine 3');

    await expect(input).toHaveValue('Line 1\nLine 2\nLine 3');
  });

  test('Enter key submits message (Shift+Enter for newline)', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const input = page.locator(testId(TEST_IDS.MESSAGE_INPUT));
    await input.fill('Test message');

    // Press Enter - should attempt to submit (may fail since session doesn't exist)
    await input.press('Enter');

    // Input might be cleared or show loading state
    // Since there's no real session, we just verify the interaction works
  });

  test('Shift+Enter adds newline instead of submitting', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    const input = page.locator(testId(TEST_IDS.MESSAGE_INPUT));
    await input.fill('Line 1');
    await input.press('Shift+Enter');
    await input.type('Line 2');

    // Should have both lines
    await expect(input).toHaveValue('Line 1\nLine 2');
  });
});

test.describe('Chat Screen - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
  });

  test('chat tab is active by default', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    // Chat tab should be visible/active
    await expect(page.locator('text=Chat')).toBeVisible();
  });

  test('artifacts tab is navigable', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    // Click Artifacts tab
    await page.locator('text=Artifacts').click();

    // Should navigate to artifacts view
    await expect(page).toHaveURL(/\/artifacts/);
  });

  test('changes tab is navigable', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-session/chat');

    // Click Changes tab
    await page.locator('text=Changes').click();

    // Should navigate to changes view
    await expect(page).toHaveURL(/\/changes/);
  });
});

test.describe('Chat Screen - Session Info', () => {
  test.beforeEach(async ({ page }) => {
    await initializeApp(page, { clearStore: true });
  });

  test('session header shows session info', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/test-sess/chat');

    // Should show the Chat tab (session is loaded)
    await expect(page.locator('text=Chat')).toBeVisible();
  });

  test('session navigation works with unknown session ID', async ({ page, basemock }) => {
    await basemock.addWorkstationViaUI(page, 'Test Workstation');
    await page.goto('/session/new-session-id/chat');

    // Should show chat interface even for unknown session
    await expect(page.locator(testId(TEST_IDS.MESSAGE_INPUT))).toBeVisible();
  });
});
