import { z } from "zod";

// Gemini raw content block schemas (JSONL format)

export const geminiTextBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export const geminiThinkingStepSchema = z.object({
  type: z.literal("thinking_step"),
  subject: z.string(),
  description: z.string(),
});

export const geminiFunctionCallSchema = z.object({
  type: z.literal("function_call"),
  id: z.string(),
  name: z.string(),
  display_name: z.string().optional(),
  args: z.record(z.string(), z.unknown()),
});

export const geminiFunctionResponseSchema = z.object({
  type: z.literal("function_response"),
  id: z.string(),
  name: z.string(),
  response: z.unknown(),
  display: z.string().optional(), // Human-friendly display
  render_as_markdown: z.boolean().optional(),
});

export const geminiContentBlockSchema = z.union([
  geminiTextBlockSchema,
  geminiThinkingStepSchema,
  geminiFunctionCallSchema,
  geminiFunctionResponseSchema,
]);

export type GeminiContentBlock = z.infer<typeof geminiContentBlockSchema>;

// Gemini message schema
export const geminiMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.array(geminiContentBlockSchema),
});

export type GeminiMessage = z.infer<typeof geminiMessageSchema>;

// Gemini usage details
export const geminiUsageSchema = z.object({
  prompt_token_count: z.number(),
  candidates_token_count: z.number(),
  total_token_count: z.number(),
  thinking_token_count: z.number().optional(),
  tool_token_count: z.number().optional(),
  cached_content_token_count: z.number().optional(),
});

export type GeminiUsage = z.infer<typeof geminiUsageSchema>;

// Gemini code tracker entry
export const geminiCodeTrackerSchema = z.object({
  file_path: z.string(),
  path_hash: z.string(),
  version: z.number(),
  backup_file_name: z.string(),
  content_hash: z.string(),
  content_size: z.number(),
  repo_name: z.string().optional(),
  repo_commit: z.string().optional(),
});

export type GeminiCodeTracker = z.infer<typeof geminiCodeTrackerSchema>;

// Gemini JSONL line types
export const geminiUserLineSchema = z.object({
  type: z.literal("user"),
  id: z.string(),
  timestamp: z.string(),
  content: geminiMessageSchema,
});

export const geminiModelLineSchema = z.object({
  type: z.literal("gemini"), // Note: "gemini" not "model"
  id: z.string(),
  timestamp: z.string(),
  content: geminiMessageSchema,
  model: z.string().optional(),
  usage: geminiUsageSchema.optional(),
});

export const geminiCodeTrackerLineSchema = z.object({
  type: z.literal("code_tracker"),
  id: z.string(),
  timestamp: z.string(),
  files: z.array(geminiCodeTrackerSchema),
});

export const geminiInfoLineSchema = z.object({
  type: z.literal("info"),
  id: z.string(),
  timestamp: z.string(),
  content: z.string(),
  level: z.enum(["info", "warning", "error", "update_available"]).optional(),
});

// Union of all JSONL line types
export const geminiJsonlLineSchema = z.discriminatedUnion("type", [
  geminiUserLineSchema,
  geminiModelLineSchema,
  geminiCodeTrackerLineSchema,
  geminiInfoLineSchema,
]);

export type GeminiJsonlLine = z.infer<typeof geminiJsonlLineSchema>;
export type GeminiUserLine = z.infer<typeof geminiUserLineSchema>;
export type GeminiModelLine = z.infer<typeof geminiModelLineSchema>;
export type GeminiCodeTrackerLine = z.infer<typeof geminiCodeTrackerLineSchema>;
export type GeminiInfoLine = z.infer<typeof geminiInfoLineSchema>;
