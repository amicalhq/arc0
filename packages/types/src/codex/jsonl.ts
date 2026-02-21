import { z } from "zod";

/**
 * Codex session JSONL line format (Codex CLI / Codex Desktop).
 *
 * Observed shape:
 * { "timestamp": "...", "type": "...", "payload": { ... } }
 *
 * This file intentionally does NOT try to over-validate Codex's rapidly evolving
 * payload schemas. We lock only the fields we need for Arc0 integration.
 */

// =============================================================================
// response_item payloads (messages + tool calls/results)
// =============================================================================

export const codexMessageContentBlockSchema = z
  .union([
    z
      .object({
        type: z.literal("input_text"),
        text: z.string(),
      })
      .passthrough(),
    z
      .object({
        type: z.literal("output_text"),
        text: z.string(),
      })
      .passthrough(),
  ])
  // Fallback for unknown content blocks (keep forward compatible).
  .or(z.object({ type: z.string() }).passthrough());

export type CodexMessageContentBlock = z.infer<
  typeof codexMessageContentBlockSchema
>;

export const codexResponseItemMessageSchema = z
  .object({
    type: z.literal("message"),
    role: z.string(),
    content: z.union([z.string(), z.array(codexMessageContentBlockSchema)]),
  })
  .passthrough();

export type CodexResponseItemMessage = z.infer<
  typeof codexResponseItemMessageSchema
>;

export const codexResponseItemFunctionCallSchema = z
  .object({
    type: z.literal("function_call"),
    name: z.string(),
    arguments: z.string(), // JSON string
    call_id: z.string(),
  })
  .passthrough();

export type CodexResponseItemFunctionCall = z.infer<
  typeof codexResponseItemFunctionCallSchema
>;

export const codexResponseItemFunctionCallOutputSchema = z
  .object({
    type: z.literal("function_call_output"),
    call_id: z.string(),
    output: z.string(),
  })
  .passthrough();

export type CodexResponseItemFunctionCallOutput = z.infer<
  typeof codexResponseItemFunctionCallOutputSchema
>;

export const codexResponseItemPayloadSchema = z.union([
  codexResponseItemMessageSchema,
  codexResponseItemFunctionCallSchema,
  codexResponseItemFunctionCallOutputSchema,
  // Unknown response_item payloads (reasoning, web_search_call, etc.)
  z.object({ type: z.string() }).passthrough(),
]);

export type CodexResponseItemPayload = z.infer<
  typeof codexResponseItemPayloadSchema
>;

// =============================================================================
// event_msg payloads (user message, token counts, reasoning)
// =============================================================================

export const codexEventMsgPayloadSchema = z.union([
  z
    .object({
      type: z.literal("user_message"),
      message: z.string(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("agent_reasoning"),
      text: z.string(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("token_count"),
      info: z.unknown(),
      rate_limits: z.unknown(),
    })
    .passthrough(),
  z.object({ type: z.string() }).passthrough(),
]);

export type CodexEventMsgPayload = z.infer<typeof codexEventMsgPayloadSchema>;

// =============================================================================
// Top-level JSONL line schemas
// =============================================================================

export const codexSessionMetaLineSchema = z.object({
  timestamp: z.string(),
  type: z.literal("session_meta"),
  payload: z
    .object({
      id: z.string(),
      cwd: z.string().optional(),
      cli_version: z.string().optional(),
      model_provider: z.string().optional(),
    })
    .passthrough(),
});

export type CodexSessionMetaLine = z.infer<typeof codexSessionMetaLineSchema>;

export const codexResponseItemLineSchema = z.object({
  timestamp: z.string(),
  type: z.literal("response_item"),
  payload: codexResponseItemPayloadSchema,
});

export type CodexResponseItemLine = z.infer<
  typeof codexResponseItemLineSchema
>;

export const codexEventMsgLineSchema = z.object({
  timestamp: z.string(),
  type: z.literal("event_msg"),
  payload: codexEventMsgPayloadSchema,
});

export type CodexEventMsgLine = z.infer<typeof codexEventMsgLineSchema>;

export const codexTurnContextLineSchema = z.object({
  timestamp: z.string(),
  type: z.literal("turn_context"),
  payload: z.unknown(),
});

export type CodexTurnContextLine = z.infer<typeof codexTurnContextLineSchema>;

export const codexCompactedLineSchema = z.object({
  timestamp: z.string(),
  type: z.literal("compacted"),
  payload: z.unknown(),
});

export type CodexCompactedLine = z.infer<typeof codexCompactedLineSchema>;

export const codexJsonlLineSchema = z.discriminatedUnion("type", [
  codexSessionMetaLineSchema,
  codexResponseItemLineSchema,
  codexEventMsgLineSchema,
  codexTurnContextLineSchema,
  codexCompactedLineSchema,
]);

export type CodexJsonlLine = z.infer<typeof codexJsonlLineSchema>;
