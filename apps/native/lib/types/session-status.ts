/**
 * Session status types and display configurations.
 */

export type SessionStatus =
  | 'sending' // Prompt sent, waiting for ack
  | 'submitting' // Action sent (plan approval, answers, tool approval), waiting for ack
  | 'thinking'
  | 'ask_user'
  | 'plan_approval'
  | 'tool_approval'
  | 'working'
  | 'idle'
  | 'ended';

/**
 * Human-readable display names for tool operations.
 * Used to generate status labels like "Reading file.ts" or "Running npm install".
 */
export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  Read: 'Reading',
  Write: 'Writing',
  Edit: 'Editing',
  Glob: 'Finding files',
  Grep: 'Searching',
  Bash: 'Running',
  WebFetch: 'Fetching',
  WebSearch: 'Searching web',
  TodoWrite: 'Updating tasks',
  Task: 'Running task',
  NotebookEdit: 'Editing notebook',
  _default: 'Working',
};

/**
 * Status metadata for UI rendering.
 */
export interface StatusInfo {
  status: SessionStatus;
  label: string;
  isAnimated: boolean;
}
