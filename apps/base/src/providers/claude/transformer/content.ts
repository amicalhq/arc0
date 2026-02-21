import type { ContentBlock } from "@arc0/types";

// =============================================================================
// Content block normalization
// =============================================================================

export function toToolResultContent(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function transformContentBlock(block: unknown): ContentBlock {
  if (!block || typeof block !== "object") {
    return { type: "text", text: String(block) };
  }

  const b = block as Record<string, unknown>;

  switch (b.type) {
    case "tool_use":
      return {
        type: "tool_use",
        id: String(b.id ?? ""),
        name: String(b.name ?? ""),
        input:
          b.input && typeof b.input === "object" && !Array.isArray(b.input)
            ? (b.input as Record<string, unknown>)
            : {},
      };

    case "tool_result":
      return {
        type: "tool_result",
        tool_use_id: String(b.tool_use_id ?? ""),
        content: toToolResultContent(b.content),
        is_error: Boolean(b.is_error),
      };

    case "thinking":
      return {
        type: "thinking",
        thinking: String(b.thinking ?? ""),
        thinkingSignature:
          typeof b.signature === "string" ? (b.signature as string) : undefined,
        isEncrypted:
          typeof b.isEncrypted === "boolean" ? b.isEncrypted : undefined,
        encryptedContent:
          typeof b.encryptedContent === "string"
            ? b.encryptedContent
            : undefined,
        summary: typeof b.summary === "string" ? b.summary : undefined,
      };

    case "text":
      return {
        type: "text",
        text: String(b.text ?? ""),
      };

    case "image":
      // Claude JSONL uses {type:"image", source:{type:"base64", media_type, data}}
      if (b.source && typeof b.source === "object") {
        return {
          type: "image",
          source: b.source as {
            type: "base64";
            media_type: string;
            data: string;
          },
        };
      }
      return { type: "text", text: "[image]" };

    case "file":
      return {
        type: "file",
        path: String(b.path ?? ""),
        content: typeof b.content === "string" ? b.content : undefined,
        language: typeof b.language === "string" ? b.language : undefined,
      };

    default:
      return { type: "text", text: JSON.stringify(block) };
  }
}

export function transformContent(content: unknown[] | string): ContentBlock[] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  return content.map(transformContentBlock);
}

export function extractTextContent(content: unknown[] | string): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(
      (b): b is { type: "text"; text: string } =>
        !!b &&
        typeof b === "object" &&
        (b as { type?: unknown }).type === "text",
    )
    .map((b) => String(b.text))
    .join("\n");
}
