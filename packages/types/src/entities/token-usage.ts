import { z } from "zod";

export const tokenUsageSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  sessionId: z.string(),

  model: z.string(),

  // Core token counts
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),

  // Cache tokens (Claude & Gemini)
  cacheReadTokens: z.number().nullable(),
  cacheWriteTokens: z.number().nullable(),

  // Gemini-specific granular breakdown
  thinkingTokens: z.number().nullable(),
  toolTokens: z.number().nullable(),

  timestamp: z.date(),
});

export type TokenUsage = z.infer<typeof tokenUsageSchema>;

// Insert schema (for creation)
export const tokenUsageInsertSchema = tokenUsageSchema.omit({
  timestamp: true,
});

export type TokenUsageInsert = z.infer<typeof tokenUsageInsertSchema>;
