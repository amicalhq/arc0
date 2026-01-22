import { z } from "zod";

export const fileSnapshotSchema = z.object({
  id: z.string(),
  sessionId: z.string(),

  // File identification
  filePath: z.string(),
  pathHash: z.string(), // Hash of path

  // Version tracking
  version: z.number(),
  backupFileName: z.string(),

  // Content
  content: z.string().nullable(),
  contentHash: z.string(),
  contentSize: z.number(),

  // Repository context (Gemini code_tracker)
  repoName: z.string().nullable(),
  repoCommit: z.string().nullable(),

  timestamp: z.date(),
});

export type FileSnapshot = z.infer<typeof fileSnapshotSchema>;

// Insert schema (for creation)
export const fileSnapshotInsertSchema = fileSnapshotSchema.omit({
  timestamp: true,
});

export type FileSnapshotInsert = z.infer<typeof fileSnapshotInsertSchema>;
