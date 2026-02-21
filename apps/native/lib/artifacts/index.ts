/**
 * Artifact types + parsing helpers.
 *
 * Artifacts are stored in SQLite and loaded into TinyBase on demand.
 * Extraction from incoming messages will be re-introduced once the canonical
 * tool schemas for todos/plans are finalized.
 */

// =============================================================================
// Types
// =============================================================================

export interface ExtractedArtifact {
  /** Unique ID: <sessionId>:plan or <sessionId>:todos */
  id: string;
  /** Session this artifact belongs to */
  sessionId: string;
  /** Type of artifact */
  type: 'plan' | 'todos';
  /** Provider (e.g., 'claude', 'codex') */
  provider: string;
  /** JSON stringified content */
  content: string;
  /** Message ID where this artifact was extracted from */
  sourceMessageId: string;
}

export interface TodoItem {
  /** Task ID for matching with TaskUpdate */
  id?: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm?: string;
}

// =============================================================================
// Parsers (used by UI)
// =============================================================================

export function parseTodosContent(content: string): TodoItem[] {
  try {
    return JSON.parse(content) as TodoItem[];
  } catch {
    return [];
  }
}

export function parsePlanContent(content: string): {
  plan: string | null;
  allowedPrompts: unknown[];
} {
  try {
    return JSON.parse(content) as { plan: string | null; allowedPrompts: unknown[] };
  } catch {
    return { plan: null, allowedPrompts: [] };
  }
}
