/**
 * Event logger for Socket.IO events.
 * Captures events for debugging in DevTools.
 */

export type EventType =
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'sessions'
  | 'messages'
  | 'reconnect'
  | 'init'
  // User action events
  | 'openSession'
  | 'sendPrompt'
  | 'stopAgent'
  | 'approveToolUse';

export interface LoggedEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  direction: 'in' | 'out' | 'system';
  summary: string;
  details?: Record<string, unknown>;
}

// Event storage
const MAX_EVENTS = 100;
const events: LoggedEvent[] = [];
// Listeners are notified when events change (for useSyncExternalStore compatibility)
const listeners: Set<() => void> = new Set();

let eventIdCounter = 0;
// Cached snapshot for useSyncExternalStore - only recreated when events change
let cachedSnapshot: LoggedEvent[] = [];

/**
 * Log a socket event.
 */
function coerceDetails(details: unknown): Record<string, unknown> | undefined {
  if (details === undefined) return undefined;
  if (details === null) return { value: null };

  if (typeof details === 'object') {
    return Array.isArray(details) ? { items: details } : (details as Record<string, unknown>);
  }

  return { value: details };
}

export function logEvent(
  type: EventType,
  direction: LoggedEvent['direction'],
  summary: string,
  details?: unknown
): void {
  const event: LoggedEvent = {
    id: `evt-${++eventIdCounter}`,
    timestamp: new Date(),
    type,
    direction,
    summary,
    details: coerceDetails(details),
  };

  events.unshift(event); // Add to beginning

  // Trim to max size
  if (events.length > MAX_EVENTS) {
    events.pop();
  }

  // Update cached snapshot (new reference for useSyncExternalStore)
  cachedSnapshot = [...events];

  // Notify listeners (they call getEvents() to get current state)
  listeners.forEach((listener) => listener());
}

/**
 * Get all logged events.
 * Returns a stable reference (same array if data hasn't changed) for useSyncExternalStore.
 */
export function getEvents(): LoggedEvent[] {
  return cachedSnapshot;
}

/**
 * Clear all logged events.
 */
export function clearEvents(): void {
  events.length = 0;
  cachedSnapshot = []; // New empty array reference
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe to event updates.
 * Compatible with useSyncExternalStore - does NOT call listener immediately.
 * Use getEvents() to get the current snapshot.
 * Returns an unsubscribe function.
 */
export function subscribeToEvents(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
