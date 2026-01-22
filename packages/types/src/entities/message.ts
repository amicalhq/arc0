import { z } from "zod";
import { messageRoleSchema } from "../enums";
import { contentBlockArraySchema } from "../content-blocks";

export const messageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),

  // Threading (Claude only)
  parentMessageId: z.string().nullable(),

  // Message classification
  role: messageRoleSchema,
  providerType: z.string().nullable(), // Original: "user" | "assistant" | "gemini" | "request" | "response" | "info"

  // Content stored as array of content blocks
  content: contentBlockArraySchema.nullable(),
  rawContent: z.string().nullable(), // For simple string content

  // Model info (assistant messages)
  model: z.string().nullable(),
  providerMessageId: z.string().nullable(),
  providerRequestId: z.string().nullable(),

  timestamp: z.date(),

  // Provider metadata
  providerMetadata: z.record(z.string(), z.unknown()).nullable(),
});

export type Message = z.infer<typeof messageSchema>;

// Insert schema (for creation)
export const messageInsertSchema = messageSchema.omit({
  timestamp: true,
});

export type MessageInsert = z.infer<typeof messageInsertSchema>;
