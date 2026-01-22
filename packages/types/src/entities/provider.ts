import { z } from "zod";
import { configFormatSchema, authMethodSchema } from "../enums";

export const providerSchema = z.object({
  id: z.string(), // "claude-code" | "codex" | "gemini-cli"
  name: z.string(),
  internalCodename: z.string().nullable(), // "Rollout" (Codex) | "Antigravity" (Gemini)
  version: z.string().nullable(),
  configFormat: configFormatSchema,
  authMethod: authMethodSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Provider = z.infer<typeof providerSchema>;

// Insert schema (for creation)
export const providerInsertSchema = providerSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type ProviderInsert = z.infer<typeof providerInsertSchema>;
