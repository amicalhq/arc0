import type {
  CodexMessageContentBlock,
  CodexResponseItemFunctionCall,
  CodexResponseItemFunctionCallOutput,
  CodexResponseItemMessage,
  CodexResponseItemPayload,
} from "./jsonl";
import type { ContentBlock } from "../content-blocks";

function safeParseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to empty object.
  }
  return {};
}

export function transformCodexMessageContent(
  content: CodexResponseItemMessage["content"],
): ContentBlock[] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  const blocks = content as CodexMessageContentBlock[];
  return blocks
    .map((block): ContentBlock | null => {
      if (block.type === "input_text" || block.type === "output_text") {
        return { type: "text", text: block.text };
      }
      return null;
    })
    .filter((b): b is ContentBlock => b !== null);
}

export function transformCodexFunctionCallToToolUse(
  payload: CodexResponseItemFunctionCall,
): ContentBlock {
  return {
    type: "tool_use",
    id: payload.call_id,
    name: payload.name,
    input: safeParseJsonObject(payload.arguments),
  };
}

export function transformCodexFunctionCallOutputToToolResult(
  payload: CodexResponseItemFunctionCallOutput,
): ContentBlock {
  return {
    type: "tool_result",
    tool_use_id: payload.call_id,
    content: payload.output,
    is_error: false,
  };
}

/**
 * Best-effort payload-to-content mapping.
 *
 * This is intentionally small: Arc0's "truth" types are the canonical SocketMessage
 * types, and Base is responsible for translating Codex JSONL into those.
 */
export function transformCodexResponseItemPayloadToContent(
  payload: CodexResponseItemPayload,
): ContentBlock[] {
  switch (payload.type) {
    case "message":
      return transformCodexMessageContent(payload.content);
    case "function_call":
      return [transformCodexFunctionCallToToolUse(payload)];
    case "function_call_output":
      return [transformCodexFunctionCallOutputToToolResult(payload)];
    default:
      return [];
  }
}

