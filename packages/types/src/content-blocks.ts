import { z } from "zod";

// Text content block
export const textBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});
export type TextBlock = z.infer<typeof textBlockSchema>;

// Thinking/reasoning content block
export const thinkingBlockSchema = z.object({
  type: z.literal("thinking"),
  thinking: z.string(),
  thinkingSignature: z.string().optional(),
  isEncrypted: z.boolean().optional(),
  encryptedContent: z.string().optional(),
  summary: z.string().optional(),
});
export type ThinkingBlock = z.infer<typeof thinkingBlockSchema>;

// Tool use request block
export const toolUseBlockSchema = z.object({
  type: z.literal("tool_use"),
  id: z.string(),
  name: z.string(),
  input: z.record(z.string(), z.unknown()),
});
export type ToolUseBlock = z.infer<typeof toolUseBlockSchema>;

// Tool result block
export const toolResultBlockSchema = z.object({
  type: z.literal("tool_result"),
  tool_use_id: z.string(),
  content: z.union([z.string(), z.record(z.string(), z.unknown())]),
  is_error: z.boolean(),
});
export type ToolResultBlock = z.infer<typeof toolResultBlockSchema>;

// Image source - supports both base64 and URL formats (Claude API compatible)
export const imageSourceSchema = z.union([
  // Base64 encoded image
  z.object({
    type: z.literal("base64"),
    media_type: z.string(),
    data: z.string(),
  }),
  // URL reference
  z.object({
    type: z.literal("url"),
    url: z.string(),
  }),
]);
export type ImageSource = z.infer<typeof imageSourceSchema>;

// Image content block (Claude API compatible)
export const imageBlockSchema = z.object({
  type: z.literal("image"),
  source: imageSourceSchema,
});
export type ImageBlock = z.infer<typeof imageBlockSchema>;

// File content block
export const fileBlockSchema = z.object({
  type: z.literal("file"),
  path: z.string(),
  content: z.string().optional(),
  language: z.string().optional(),
});
export type FileBlock = z.infer<typeof fileBlockSchema>;

// Discriminated union of all content blocks
export const contentBlockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  thinkingBlockSchema,
  toolUseBlockSchema,
  toolResultBlockSchema,
  imageBlockSchema,
  fileBlockSchema,
]);
export type ContentBlock = z.infer<typeof contentBlockSchema>;

// Array of content blocks (common in messages)
export const contentBlockArraySchema = z.array(contentBlockSchema);
export type ContentBlockArray = z.infer<typeof contentBlockArraySchema>;
