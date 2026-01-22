import { z } from "zod";

// Codex raw content block schemas (JSONL format)

export const codexTextBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export const codexToolCallBlockSchema = z.object({
  type: z.literal("function_call"),
  id: z.string(),
  name: z.string(),
  arguments: z.string(), // JSON string
});

export const codexToolResultBlockSchema = z.object({
  type: z.literal("function_result"),
  call_id: z.string(),
  output: z.string(),
});

export const codexContentBlockSchema = z.union([
  codexTextBlockSchema,
  codexToolCallBlockSchema,
  codexToolResultBlockSchema,
]);

export type CodexContentBlock = z.infer<typeof codexContentBlockSchema>;

// Codex message schema
export const codexMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.union([z.string(), z.array(codexContentBlockSchema)]),
});

export type CodexMessage = z.infer<typeof codexMessageSchema>;

// Codex rate limit info
export const codexRateLimitSchema = z.object({
  primary: z
    .object({
      limit: z.number(),
      remaining: z.number(),
      reset_at: z.string(),
    })
    .optional(),
  secondary: z
    .object({
      limit: z.number(),
      remaining: z.number(),
      reset_at: z.string(),
    })
    .optional(),
});

export type CodexRateLimit = z.infer<typeof codexRateLimitSchema>;

// Codex JSONL line types
export const codexRequestLineSchema = z.object({
  type: z.literal("request"),
  id: z.string(),
  timestamp: z.string(),
  message: codexMessageSchema,
});

export const codexResponseLineSchema = z.object({
  type: z.literal("response"),
  id: z.string(),
  request_id: z.string(),
  timestamp: z.string(),
  message: codexMessageSchema,
  model: z.string().optional(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
  rate_limit: codexRateLimitSchema.optional(),
});

export const codexInfoLineSchema = z.object({
  type: z.literal("info"),
  id: z.string(),
  timestamp: z.string(),
  content: z.string(),
  level: z.enum(["info", "warning", "error"]).optional(),
});

// Union of all JSONL line types
export const codexJsonlLineSchema = z.discriminatedUnion("type", [
  codexRequestLineSchema,
  codexResponseLineSchema,
  codexInfoLineSchema,
]);

export type CodexJsonlLine = z.infer<typeof codexJsonlLineSchema>;
export type CodexRequestLine = z.infer<typeof codexRequestLineSchema>;
export type CodexResponseLine = z.infer<typeof codexResponseLineSchema>;
export type CodexInfoLine = z.infer<typeof codexInfoLineSchema>;
