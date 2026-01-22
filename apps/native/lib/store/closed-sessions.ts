/**
 * Closed session message loading.
 * Loads messages for closed sessions from SQLite on demand.
 */

import type { Indexes, Store } from 'tinybase';
import { executeQuery } from './persister';

// =============================================================================
// Types
// =============================================================================

/**
 * Message row from SQLite query.
 */
interface MessageRow {
  id: string;
  session_id: string;
  parent_id: string | null;
  type: string;
  timestamp: string;
  content: string;
  stop_reason: string | null;
  usage: string | null;
}

// =============================================================================
// Load Closed Session Messages
// =============================================================================

/**
 * Load messages for a closed session from SQLite into the TinyBase store.
 * Uses the messagesBySession index for O(1) check if messages are already loaded.
 *
 * @param store - TinyBase store instance
 * @param indexes - TinyBase indexes instance
 * @param sessionId - Session ID to load messages for
 * @returns true if messages were loaded, false if already present
 */
export async function loadClosedSessionMessages(
  store: Store,
  indexes: Indexes,
  sessionId: string
): Promise<boolean> {
  // Check if already loaded using index (O(1) lookup instead of O(n) iteration)
  const messageIds = indexes.getSliceRowIds('messagesBySession', sessionId);
  if (messageIds.length > 0) {
    // Already loaded, skip
    return false;
  }

  // Query SQLite for messages
  const messages = await executeQuery<MessageRow>(
    'SELECT id, session_id, parent_id, type, timestamp, content, stop_reason, usage FROM messages WHERE session_id = ? ORDER BY timestamp',
    [sessionId]
  );

  if (messages.length === 0) {
    return false;
  }

  // Insert into TinyBase store for UI reactivity
  // Note: 'id' is NOT included as cell data - it's the row ID (rowIdColumnName: 'id')
  store.transaction(() => {
    for (const msg of messages) {
      store.setRow('messages', msg.id, {
        session_id: msg.session_id,
        parent_id: msg.parent_id ?? '',
        type: msg.type,
        timestamp: msg.timestamp,
        content: msg.content,
        stop_reason: msg.stop_reason ?? '',
        usage: msg.usage ?? '{}',
      });
    }
  });

  console.log('[closed-sessions] Loaded messages for session:', {
    sessionId,
    messageCount: messages.length,
  });

  return true;
}

/**
 * Check if messages for a session are loaded in the store.
 *
 * @param indexes - TinyBase indexes instance
 * @param sessionId - Session ID to check
 * @returns true if messages are already loaded
 */
export function areMessagesLoaded(indexes: Indexes, sessionId: string): boolean {
  const messageIds = indexes.getSliceRowIds('messagesBySession', sessionId);
  return messageIds.length > 0;
}

/**
 * Get message count for a session from the store (for already loaded sessions).
 *
 * @param indexes - TinyBase indexes instance
 * @param sessionId - Session ID to get count for
 * @returns Number of messages loaded in store for this session
 */
export function getLoadedMessageCount(indexes: Indexes, sessionId: string): number {
  return indexes.getSliceRowIds('messagesBySession', sessionId).length;
}

// =============================================================================
// Memory Management with LRU Eviction
// =============================================================================

/** Maximum number of closed sessions to keep in memory */
const MAX_CLOSED_SESSIONS_IN_MEMORY = 5;

/**
 * Record access to a closed session for LRU tracking.
 * Updates the access order and triggers pruning if needed.
 *
 * @param store - TinyBase store instance
 * @param indexes - TinyBase indexes instance
 * @param sessionId - Session ID that was accessed
 */
export function recordClosedSessionAccess(
  store: Store,
  indexes: Indexes,
  sessionId: string
): void {
  // Verify session exists and is closed before tracking
  const session = store.getRow('sessions', sessionId);
  if (!session || session.open !== 0) {
    return;
  }

  // Get current access order
  const accessOrderJson = store.getValue('closed_session_access_order') as string;
  let accessOrder: string[] = [];
  try {
    accessOrder = JSON.parse(accessOrderJson || '[]');
  } catch {
    accessOrder = [];
  }

  // Move sessionId to front (most recent)
  const filtered = accessOrder.filter((id) => id !== sessionId);
  const newOrder = [sessionId, ...filtered];

  // Determine if pruning is needed
  const needsPruning = newOrder.length > MAX_CLOSED_SESSIONS_IN_MEMORY;

  // Only write the final order (avoid redundant store mutations)
  const finalOrder = needsPruning
    ? newOrder.slice(0, MAX_CLOSED_SESSIONS_IN_MEMORY)
    : newOrder;
  store.setValue('closed_session_access_order', JSON.stringify(finalOrder));

  // Schedule pruning asynchronously to avoid blocking the render
  if (needsPruning) {
    setTimeout(() => {
      pruneClosedSessionMessages(store, indexes, newOrder, MAX_CLOSED_SESSIONS_IN_MEMORY);
    }, 0);
  }
}

/**
 * Remove a session from the access tracking (e.g., when session is deleted).
 *
 * @param store - TinyBase store instance
 * @param sessionId - Session ID to remove from tracking
 */
export function removeFromAccessTracking(store: Store, sessionId: string): void {
  const accessOrderJson = store.getValue('closed_session_access_order') as string;
  let accessOrder: string[] = [];
  try {
    accessOrder = JSON.parse(accessOrderJson || '[]');
  } catch {
    accessOrder = [];
  }

  const filtered = accessOrder.filter((id) => id !== sessionId);
  if (filtered.length !== accessOrder.length) {
    store.setValue('closed_session_access_order', JSON.stringify(filtered));
  }
}


/**
 * Remove messages for a closed session from the TinyBase store.
 * Use this to free memory when navigating away from closed sessions.
 *
 * NOTE: This is an optimization for memory management.
 * Messages remain in SQLite and can be reloaded on demand.
 *
 * @param store - TinyBase store instance
 * @param indexes - TinyBase indexes instance
 * @param sessionId - Session ID to unload messages for
 */
export function unloadSessionMessages(
  store: Store,
  indexes: Indexes,
  sessionId: string
): void {
  const messageIds = indexes.getSliceRowIds('messagesBySession', sessionId);

  if (messageIds.length === 0) {
    return;
  }

  store.transaction(() => {
    for (const messageId of messageIds) {
      store.delRow('messages', messageId);
    }
  });

  console.log('[closed-sessions] Unloaded messages for session:', {
    sessionId,
    messageCount: messageIds.length,
  });
}

/**
 * Unload messages for closed sessions, keeping only the N most recently accessed.
 * Useful for LRU-style memory management.
 *
 * @param store - TinyBase store instance
 * @param indexes - TinyBase indexes instance
 * @param accessOrder - Array of session IDs in access order (most recent first)
 * @param keepCount - Number of sessions to keep loaded
 */
export function pruneClosedSessionMessages(
  store: Store,
  indexes: Indexes,
  accessOrder: string[],
  keepCount: number
): void {
  // Get closed sessions
  const sessionsToKeep = new Set(accessOrder.slice(0, keepCount));

  // Get all sessions that are closed
  const allSessions = store.getTable('sessions');
  const closedSessionIds = Object.keys(allSessions).filter(
    (id) => allSessions[id].open === 0 && !sessionsToKeep.has(id)
  );

  // Unload messages for old closed sessions
  for (const sessionId of closedSessionIds) {
    unloadSessionMessages(store, indexes, sessionId);
  }
}
