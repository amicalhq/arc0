import { z } from "zod";
import { systemEventTypeSchema } from "../enums";

export const systemEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),

  eventType: systemEventTypeSchema,
  content: z.string(),
  providerEventType: z.string().nullable(),

  timestamp: z.date(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type SystemEvent = z.infer<typeof systemEventSchema>;

// Insert schema (for creation)
export const systemEventInsertSchema = systemEventSchema.omit({
  timestamp: true,
});

export type SystemEventInsert = z.infer<typeof systemEventInsertSchema>;
