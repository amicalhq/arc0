/**
 * Artifact extractor for raw JSONL message batches.
 * Extracts TodoWrite and ExitPlanMode tool calls from session messages.
 */

import type { RawMessageEnvelope } from '@arc0/types';

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
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  activeForm?: string;
}

// =============================================================================
// Raw Payload Type Guards
// =============================================================================

interface RawContentBlock {
  type: string;
  id?: string;
  name?: string;
  input?: unknown;
}

interface RawAssistantMessage {
  type: 'assistant';
  uuid: string;
  timestamp: string;
  message: {
    content: RawContentBlock[];
  };
}

function isAssistantMessage(payload: unknown): payload is RawAssistantMessage {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return p.type === 'assistant' && typeof p.uuid === 'string';
}

function isTodoWriteBlock(block: RawContentBlock): boolean {
  return block.type === 'tool_use' && block.name === 'TodoWrite';
}

function isExitPlanModeBlock(block: RawContentBlock): boolean {
  return block.type === 'tool_use' && block.name === 'ExitPlanMode';
}

// =============================================================================
// Extraction Functions
// =============================================================================

/**
 * Extract artifacts from a batch of raw JSONL envelopes.
 * Returns one artifact per type per session (latest wins).
 *
 * @param envelopes - Raw message envelopes from Socket.IO
 * @param provider - Provider name (e.g., 'claude')
 * @returns Array of extracted artifacts
 */
export function extractArtifactsFromRawBatch(
  envelopes: RawMessageEnvelope[],
  provider: string = 'claude'
): ExtractedArtifact[] {
  // Track latest artifact per session per type
  const artifactMap = new Map<string, ExtractedArtifact>();

  for (const envelope of envelopes) {
    const { sessionId, payload } = envelope;

    if (!isAssistantMessage(payload)) {
      continue;
    }

    const { uuid: messageId, message } = payload;
    const contentBlocks = message?.content ?? [];

    for (const block of contentBlocks) {
      // Extract TodoWrite artifacts
      if (isTodoWriteBlock(block)) {
        const input = block.input as { todos?: TodoItem[] } | undefined;
        if (input?.todos && Array.isArray(input.todos)) {
          const artifactId = `${sessionId}:todos`;
          artifactMap.set(artifactId, {
            id: artifactId,
            sessionId,
            type: 'todos',
            provider,
            content: JSON.stringify(input.todos),
            sourceMessageId: messageId,
          });
        }
      }

      // Extract ExitPlanMode artifacts
      if (isExitPlanModeBlock(block)) {
        const input = block.input as { plan?: string; allowedPrompts?: unknown[] } | undefined;
        // ExitPlanMode may have allowedPrompts but no plan content
        // We still want to track it as a plan artifact if it exists
        const artifactId = `${sessionId}:plan`;
        artifactMap.set(artifactId, {
          id: artifactId,
          sessionId,
          type: 'plan',
          provider,
          content: JSON.stringify({
            plan: input?.plan ?? null,
            allowedPrompts: input?.allowedPrompts ?? [],
          }),
          sourceMessageId: messageId,
        });
      }
    }
  }

  return Array.from(artifactMap.values());
}

/**
 * Parse artifact content back to typed data.
 */
export function parseTodosContent(content: string): TodoItem[] {
  try {
    return JSON.parse(content) as TodoItem[];
  } catch {
    return [];
  }
}

/**
 * Parse plan artifact content.
 */
export function parsePlanContent(content: string): { plan: string | null; allowedPrompts: unknown[] } {
  try {
    return JSON.parse(content) as { plan: string | null; allowedPrompts: unknown[] };
  } catch {
    return { plan: null, allowedPrompts: [] };
  }
}
