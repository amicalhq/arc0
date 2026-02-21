/**
 * Shared "processed" row shapes used by the native store layer.
 *
 * These types represent the snake_case schema we write into TinyBase and
 * (for messages) persist into SQLite.
 *
 * Keep this file type-only where possible; transformation logic lives in
 * the store handlers (domain reducers).
 */

import type { SystemMessageSubtype } from '@arc0/types';

/**
 * Processed message row ready for TinyBase store and SQLite.
 * Note: content and usage are JSON strings, not objects.
 */
export interface ProcessedMessage {
  id: string;
  session_id: string;
  parent_id: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: string;
  content: string; // JSON string of ContentBlock[]
  stop_reason: string;
  usage: string; // JSON string of {inputTokens, outputTokens}
  raw_json: string; // Full original message as JSON string

  // System message extras (optional)
  subtype?: SystemMessageSubtype;
  command_name?: string;
  command_args?: string;
  stdout?: string;
  stderr?: string;
}

/**
 * Processed project row ready for TinyBase store.
 * Note: 'id' is NOT included - it's the row ID (rowIdColumnName: 'id').
 */
export interface ProcessedProject {
  path: string;
  name: string;
  starred: number;
}

/**
 * Processed workstation row ready for TinyBase store.
 * Note: 'id' is NOT included - it's the row ID (rowIdColumnName: 'id').
 */
export interface ProcessedWorkstation {
  name: string;
}
