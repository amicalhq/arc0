import { z } from "zod";
import { fileOperationSchema } from "../enums";

export const fileChangeSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  messageId: z.string(),
  toolCallId: z.string().nullable(),

  path: z.string(),
  operation: fileOperationSchema,

  // Content hashing
  beforeHash: z.string().nullable(),
  afterHash: z.string().nullable(),

  // Diff
  diff: z.string().nullable(), // Unified diff format
  structuredPatch: z.array(z.unknown()).nullable(),

  timestamp: z.date(),
});

export type FileChange = z.infer<typeof fileChangeSchema>;

// Insert schema (for creation)
export const fileChangeInsertSchema = fileChangeSchema.omit({
  timestamp: true,
});

export type FileChangeInsert = z.infer<typeof fileChangeInsertSchema>;
