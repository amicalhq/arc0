import { z } from "zod";

export const sessionSchema = z.object({
  id: z.string(), // UUID (matches filename)
  projectId: z.string(),

  // Session hierarchy
  parentSessionId: z.string().nullable(), // For forked/resumed sessions
  isSubagent: z.boolean(),
  subagentType: z.string().nullable(), // "Explore" | "Plan" | "code-reviewer" | etc.

  // Provider-specific naming
  providerSessionName: z.string().nullable(),

  // Environment context
  cwd: z.string(),
  model: z.string().nullable(),
  providerVersion: z.string(),

  // Git context at session start
  gitBranch: z.string().nullable(),
  gitCommit: z.string().nullable(),
  gitRepoUrl: z.string().nullable(),

  // Claude-specific
  isSidechain: z.boolean().nullable(),
  userType: z.string().nullable(),
  sessionSlug: z.string().nullable(), // Human-readable: "tranquil-wobbling-blanket"

  // Timestamps
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  lastUpdatedAt: z.date(),

  // Extensible metadata
  metadata: z.record(z.string(), z.unknown()).nullable(),
});

export type Session = z.infer<typeof sessionSchema>;

// Insert schema (for creation)
export const sessionInsertSchema = sessionSchema.omit({
  startedAt: true,
  lastUpdatedAt: true,
});

export type SessionInsert = z.infer<typeof sessionInsertSchema>;
