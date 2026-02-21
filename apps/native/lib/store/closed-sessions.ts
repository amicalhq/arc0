/**
 * Closed session message loading.
 *
 * Base persists canonical messages into SQLite. Native loads session messages
 * on demand into TinyBase for UI rendering.
 */

import { Platform } from 'react-native';
import type { SocketMessage } from '@arc0/types';
import type { Indexes, Store } from 'tinybase';
import { executeQuery } from './persister';

// =============================================================================
// Types
// =============================================================================

interface MessageRow {
  id: string;
  session_id: string;
  parent_id: string | null;
  type: string;
  timestamp: string;
  content: string;
  stop_reason: string | null;
  usage: string | null;
  raw_json: string | null;
}

type TinyBaseRow = Record<string, string | number>;

function parseSocketMessage(rawJson: string | null): SocketMessage | null {
  if (!rawJson) return null;
  try {
    return JSON.parse(rawJson) as SocketMessage;
  } catch {
    return null;
  }
}

type LocalCommandOutputMessage = Extract<SocketMessage, { type: 'system' }> & {
  subtype: 'local_command';
  parentUuid: string;
  commandName?: undefined;
  stdout?: string;
  stderr?: string;
};

function isLocalCommandOutputMessage(msg: SocketMessage): msg is LocalCommandOutputMessage {
  return (
    msg.type === 'system' &&
    msg.subtype === 'local_command' &&
    typeof msg.parentUuid === 'string' &&
    msg.commandName === undefined &&
    (typeof msg.stdout === 'string' || typeof msg.stderr === 'string')
  );
}

function parseClaudeModelFromStdout(stdout: string): string | null {
  const match = stdout.match(/(?:Set model to|Kept model as)\s+([^\n\r(]+)/i);
  const name = match?.[1]?.trim();
  if (!name) return null;

  const lower = name.toLowerCase();
  if (lower.startsWith('opus')) return 'opus-4.5';
  if (lower.startsWith('sonnet')) return 'sonnet-4.5';
  if (lower.startsWith('haiku')) return 'haiku-4.5';
  if (lower.startsWith('default')) return 'default';

  return name;
}

// =============================================================================
// Load Session Messages
// =============================================================================

export async function loadSessionMessages(
  store: Store,
  indexes: Indexes,
  sessionId: string
): Promise<boolean> {
  const messageIds = indexes.getSliceRowIds('messagesBySession', sessionId);
  if (messageIds.length > 0) {
    return false;
  }

  const messages = await executeQuery<MessageRow>(
    'SELECT id, session_id, parent_id, type, timestamp, content, stop_reason, usage, raw_json FROM messages WHERE session_id = ? ORDER BY timestamp',
    [sessionId]
  );

  if (messages.length === 0) {
    return false;
  }

  // Two-pass merge:
  // - Pass 1: collect command rows and output rows (by parentId)
  // - Pass 2: append stdout/stderr into command rows
  const commandsById = new Map<string, { id: string; row: TinyBaseRow }>();
  const processed: { id: string; row: TinyBaseRow }[] = [];
  const outputs: { parentId: string; stdout?: string; stderr?: string }[] = [];

  for (const row of messages) {
    const parsed = parseSocketMessage(row.raw_json);

    // Local command output messages are stored in SQLite as separate rows.
    // For UI, we merge them into the parent command message row.
    if (parsed && isLocalCommandOutputMessage(parsed)) {
      const parentId = parsed.parentUuid ?? row.parent_id ?? '';
      if (parentId) {
        outputs.push({ parentId, stdout: parsed.stdout, stderr: parsed.stderr });
      }
      continue;
    }

    // Build TinyBase row from SQLite columns.
    const base: TinyBaseRow = {
      session_id: row.session_id,
      parent_id: row.parent_id ?? '',
      type: row.type,
      timestamp: row.timestamp,
      content: row.content,
      stop_reason: row.stop_reason ?? '',
      usage: row.usage ?? '{}',
    };

    // System message extras come from canonical raw_json.
    if (parsed?.type === 'system') {
      if (parsed.subtype) base.subtype = parsed.subtype;
      if (parsed.commandName) base.command_name = parsed.commandName;
      if (parsed.commandArgs) base.command_args = parsed.commandArgs;
      if (parsed.stdout !== undefined) base.stdout = parsed.stdout;
      if (parsed.stderr !== undefined) base.stderr = parsed.stderr;
    }

    const entry = { id: row.id, row: base };
    if (parsed?.type === 'system' && parsed.subtype === 'local_command') {
      commandsById.set(row.id, entry);
    }
    processed.push(entry);
  }

  for (const out of outputs) {
    const parent = commandsById.get(out.parentId);
    if (!parent) continue;

    if (out.stdout) {
      const existing = parent.row.stdout as string | undefined;
      parent.row.stdout = existing ? `${existing}\n${out.stdout}` : out.stdout;
    }
    if (out.stderr) {
      const existing = parent.row.stderr as string | undefined;
      parent.row.stderr = existing ? `${existing}\n${out.stderr}` : out.stderr;
    }
  }

  const derivedModel = (() => {
    for (let i = processed.length - 1; i >= 0; i--) {
      const row = processed[i]?.row;
      if (!row) continue;
      if (row.subtype !== 'local_command') continue;
      if (row.command_name !== '/model') continue;

      const stdout = row.stdout;
      if (typeof stdout !== 'string' || stdout.length === 0) continue;

      const model = parseClaudeModelFromStdout(stdout);
      if (model) return model;
    }
    return null;
  })();

  store.transaction(() => {
    for (const { id, row } of processed) {
      store.setRow('messages', id, row);
    }
    if (derivedModel) {
      store.setPartialRow('sessions', sessionId, { model: derivedModel });
    }
  });

  console.log('[closed-sessions] Loaded messages for session:', {
    sessionId,
    rawCount: messages.length,
    processedCount: processed.length,
  });

  return true;
}

export function areMessagesLoaded(indexes: Indexes, sessionId: string): boolean {
  return indexes.getSliceRowIds('messagesBySession', sessionId).length > 0;
}

export function getLoadedMessageCount(indexes: Indexes, sessionId: string): number {
  return indexes.getSliceRowIds('messagesBySession', sessionId).length;
}

export function unloadSessionMessages(store: Store, indexes: Indexes, sessionId: string): void {
  const messageIds = indexes.getSliceRowIds('messagesBySession', sessionId);
  if (messageIds.length === 0) return;

  store.transaction(() => {
    for (const messageId of messageIds) {
      store.delRow('messages', messageId);
    }
  });
}

export function handleActiveSessionChange(
  store: Store,
  indexes: Indexes,
  previousSessionId: string,
  currentSessionId: string
): void {
  // Skip on web - OPFS persists the whole store.
  if (Platform.OS === 'web') return;
  if (!previousSessionId || previousSessionId === currentSessionId) return;
  unloadSessionMessages(store, indexes, previousSessionId);
}
