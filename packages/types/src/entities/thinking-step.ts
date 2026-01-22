import { z } from "zod";

export const thinkingStepSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  sessionId: z.string(),

  subject: z.string(),
  description: z.string(),
  timestamp: z.date(),

  // Ordering within message
  sequence: z.number(),
});

export type ThinkingStep = z.infer<typeof thinkingStepSchema>;

// Insert schema (for creation)
export const thinkingStepInsertSchema = thinkingStepSchema.omit({
  timestamp: true,
});

export type ThinkingStepInsert = z.infer<typeof thinkingStepInsertSchema>;
