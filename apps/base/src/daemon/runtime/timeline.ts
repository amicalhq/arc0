import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SessionEvent, TimelineItem } from "@arc0/types";
import { SESSIONS_DIR } from "../../lib/config.js";
import type { SessionFile } from "../../lib/types.js";
import type { StoredLine } from "../../transcript/store.js";
import { transformClaudePayloadToSocketMessage } from "../../providers/claude/transformer/index.js";

/**
 * Convert StoredLines to canonical timeline items.
 * Provider parsing happens here in Base so clients never see raw provider logs.
 */
export function linesToTimelineItems(
  session: SessionFile,
  lines: StoredLine[],
): TimelineItem[] {
  if (session.provider !== "claude") {
    // Codex/Gemini transformers are implemented later.
    return [];
  }

  const items: TimelineItem[] = [];
  for (const line of lines) {
    const message = transformClaudePayloadToSocketMessage(
      session.sessionId,
      line.raw,
    );
    if (message) {
      items.push({ kind: "message", message });
    }
  }
  return items;
}

export function getItemTimestamp(item: TimelineItem): string {
  return item.kind === "message"
    ? item.message.timestamp
    : item.event.timestamp;
}

/**
 * Read the most recent permission_request event for a session (if any).
 * Used for reconnect/initial sync so clients don't miss pending approvals.
 */
export function readLatestPermissionRequestItem(
  sessionId: string,
): Extract<TimelineItem, { kind: "session_event" }> | null {
  const eventsPath = join(SESSIONS_DIR, `${sessionId}.events.jsonl`);
  if (!existsSync(eventsPath)) return null;

  try {
    const content = readFileSync(eventsPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (!line) continue;
      try {
        const event = JSON.parse(line) as unknown;
        if (
          event &&
          typeof event === "object" &&
          (event as { type?: unknown }).type === "permission_request" &&
          typeof (event as { toolUseId?: unknown }).toolUseId === "string" &&
          typeof (event as { timestamp?: unknown }).timestamp === "string"
        ) {
          return {
            kind: "session_event",
            sessionId,
            event: event as SessionEvent,
          };
        }
      } catch {
        // Invalid JSON line, skip
      }
    }
  } catch {
    // File unreadable, ignore
  }

  return null;
}

/**
 * Merge two already timestamp-ordered item lists into one.
 * Tie-breaker: transcript messages first when timestamps are equal.
 */
export function mergeItemsByTimestamp(
  transcript: TimelineItem[],
  events: TimelineItem[],
): TimelineItem[] {
  const merged: TimelineItem[] = [];
  let i = 0;
  let j = 0;

  while (i < transcript.length && j < events.length) {
    const a = transcript[i]!;
    const b = events[j]!;

    const aTs = getItemTimestamp(a);
    const bTs = getItemTimestamp(b);

    if (aTs.localeCompare(bTs) <= 0) {
      merged.push(a);
      i++;
    } else {
      merged.push(b);
      j++;
    }
  }

  while (i < transcript.length) {
    merged.push(transcript[i]!);
    i++;
  }
  while (j < events.length) {
    merged.push(events[j]!);
    j++;
  }

  return merged;
}
