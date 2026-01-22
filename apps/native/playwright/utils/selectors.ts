/**
 * Centralized testID selectors for Playwright tests.
 * These selectors work with data-testid attributes on web
 * and also work with Appium via accessibilityIdentifier on iOS/Android.
 */

/**
 * Create a testID selector string for use with page.locator()
 */
export const testId = (id: string) => `[data-testid="${id}"]`;

/**
 * TestID constants organized by screen/component
 */
export const TEST_IDS = {
  // Root
  APP_ROOT: 'app-root',

  // Home/Welcome
  HOME_WELCOME: 'home-welcome',
  CONNECT_WORKSTATION_BUTTON: 'connect-workstation-button',

  // Drawer
  DRAWER_CONTENT: 'drawer-content',
  SESSIONS_TAB: 'sessions-tab',
  PROJECTS_TAB: 'projects-tab',
  CREATE_SESSION_BUTTON: 'create-session-button',
  SETTINGS_BUTTON: 'settings-button',
  CONNECTION_INDICATOR: 'connection-indicator',

  // Settings
  SETTINGS_SCREEN: 'settings-screen',
  WORKSTATIONS_SECTION: 'workstations-section',
  APPEARANCE_SECTION: 'appearance-section',
  HELP_SECTION: 'help-section',
  THEME_LIGHT: 'theme-light',
  THEME_DARK: 'theme-dark',
  THEME_SYSTEM: 'theme-system',
  RESET_APP_BUTTON: 'reset-app-button',

  // Workstation Management
  WORKSTATION_LIST: 'workstation-list',
  WORKSTATION_EMPTY: 'workstation-empty',
  ADD_WORKSTATION_BUTTON: 'add-workstation-button',
  workstationRow: (id: string) => `workstation-row-${id}`,
  WORKSTATION_NAME_INPUT: 'workstation-name-input',
  WORKSTATION_URL_INPUT: 'workstation-url-input',
  WORKSTATION_SECRET_INPUT: 'workstation-secret-input',
  WORKSTATION_TEST_BUTTON: 'workstation-test-button',
  WORKSTATION_SAVE_BUTTON: 'workstation-save-button',
  WORKSTATION_DELETE_BUTTON: 'workstation-delete-button',
  WORKSTATION_CANCEL_BUTTON: 'workstation-cancel-button',

  // Sessions
  SESSION_LIST: 'session-list',
  OPEN_SESSIONS_SECTION: 'open-sessions-section',
  CLOSED_SESSIONS_SECTION: 'closed-sessions-section',
  sessionCard: (id: string) => `session-card-${id}`,

  // Session View Tabs
  TAB_CHAT: 'tab-chat',
  TAB_ARTIFACTS: 'tab-artifacts',
  TAB_CHANGES: 'tab-changes',

  // Chat
  MESSAGE_INPUT: 'message-input',
  SEND_BUTTON: 'send-button',
  STOP_BUTTON: 'stop-button',
  MESSAGE_LIST: 'message-list',
  messageItem: (id: string) => `message-${id}`,

  // Tool Approval
  TOOL_APPROVE_ONCE: 'tool-approve-once',
  TOOL_APPROVE_ALWAYS: 'tool-approve-always',
  TOOL_REJECT: 'tool-reject',

  // Plan Approval
  PLAN_CLEAR_BYPASS: 'plan-clear-bypass',
  PLAN_MANUAL: 'plan-manual',
  PLAN_BYPASS: 'plan-bypass',
  PLAN_KEEP_MANUAL: 'plan-keep-manual',
  PLAN_FEEDBACK: 'plan-feedback',
} as const;
