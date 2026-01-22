import { z } from "zod";
import { rateLimitWindowSchema } from "../enums";

export const rateLimitSchema = z.object({
  id: z.string(),
  sessionId: z.string(),

  windowType: rateLimitWindowSchema,
  limit: z.number(),
  remaining: z.number(),
  resetAt: z.date(),

  timestamp: z.date(),
});

export type RateLimit = z.infer<typeof rateLimitSchema>;

// Insert schema (for creation)
export const rateLimitInsertSchema = rateLimitSchema.omit({
  timestamp: true,
});

export type RateLimitInsert = z.infer<typeof rateLimitInsertSchema>;
