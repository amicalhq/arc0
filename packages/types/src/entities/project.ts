import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  providerId: z.string(),
  name: z.string(),
  path: z.string(), // Absolute path: "/Users/x/myproject"

  // Provider-specific encodings
  pathEncoded: z.string().nullable(), // Claude: "-Users-x-myproject"
  pathHash: z.string().nullable(), // Gemini: SHA256 of path

  // Git context
  gitRemote: z.string().nullable(),
  gitDefaultBranch: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof projectSchema>;

// Insert schema (for creation)
export const projectInsertSchema = projectSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type ProjectInsert = z.infer<typeof projectInsertSchema>;
