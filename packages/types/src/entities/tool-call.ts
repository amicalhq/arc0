import { z } from "zod";
import { toolCallStatusSchema } from "../enums";

// File edit metadata schema
export const fileEditMetadataSchema = z.object({
  filePath: z.string(),
  oldString: z.string(),
  newString: z.string(),
  structuredPatch: z.array(z.unknown()).optional(),
});

export type FileEditMetadata = z.infer<typeof fileEditMetadataSchema>;

export const toolCallSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  messageId: z.string(),
  resultMessageId: z.string().nullable(),

  // Tool identification
  name: z.string(), // Internal: "Edit", "edit_file", "list_directory"
  displayName: z.string().nullable(), // Gemini: "EditFile", "ReadFolder"
  description: z.string().nullable(),

  // Arguments
  input: z.record(z.string(), z.unknown()),
  inputRaw: z.string().nullable(), // Codex: JSON string

  // Result
  output: z.union([z.string(), z.record(z.string(), z.unknown())]).nullable(),
  resultDisplay: z.string().nullable(), // Gemini: human-friendly result
  renderOutputAsMarkdown: z.boolean().nullable(),

  // Status
  status: toolCallStatusSchema,
  errorMessage: z.string().nullable(),

  // Timing
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  durationMs: z.number().nullable(),

  // File edit metadata (Claude toolUseResult)
  fileEditMetadata: fileEditMetadataSchema.nullable(),
});

export type ToolCall = z.infer<typeof toolCallSchema>;

// Insert schema (for creation) - uses string for dates to allow serialization
export const toolCallInsertSchema = toolCallSchema
  .omit({ startedAt: true, completedAt: true })
  .extend({ completedAt: z.string().nullable() });

export type ToolCallInsert = z.infer<typeof toolCallInsertSchema>;
