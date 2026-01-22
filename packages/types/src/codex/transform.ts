import type {
  CodexContentBlock,
  CodexRequestLine,
  CodexResponseLine,
  CodexJsonlLine,
} from "./jsonl";
import type { ContentBlock, MessageRole } from "../index";
import type {
  MessageInsert,
  ToolCallInsert,
  TokenUsageInsert,
  RateLimitInsert,
} from "../entities";

/**
 * Transform a Codex content block to unified format
 */
export function transformCodexContentBlock(
  block: CodexContentBlock
): ContentBlock {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };

    case "function_call":
      return {
        type: "tool_use",
        id: block.id,
        name: block.name,
        input: JSON.parse(block.arguments),
      };

    case "function_result":
      return {
        type: "tool_result",
        tool_use_id: block.call_id,
        content: block.output,
        is_error: false,
      };
  }
}

/**
 * Transform Codex message content to unified ContentBlock array
 */
export function transformCodexContent(
  content: CodexContentBlock[] | string
): ContentBlock[] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  return content.map(transformCodexContentBlock);
}

/**
 * Determine unified message role from Codex JSONL line
 */
export function determineMessageRole(line: CodexJsonlLine): MessageRole {
  if (line.type === "info") {
    return "system";
  }

  const message = line.type === "request" ? line.message : line.message;
  if (message.role === "tool") {
    return "tool";
  }
  return message.role as MessageRole;
}

/**
 * Transform a Codex JSONL request/response line to a unified message
 */
export function transformCodexMessage(
  line: CodexRequestLine | CodexResponseLine,
  sessionId: string
): MessageInsert {
  const content = transformCodexContent(line.message.content);
  const role = determineMessageRole(line);

  return {
    id: line.id,
    sessionId,
    parentMessageId: null,
    role,
    providerType: line.type,
    content,
    rawContent: typeof line.message.content === "string" ? line.message.content : null,
    model: line.type === "response" ? (line.model ?? null) : null,
    providerMessageId: line.id,
    providerRequestId: line.type === "response" ? line.request_id : null,
    providerMetadata: null,
  };
}

/**
 * Extract tool calls from a Codex response message
 */
export function extractToolCalls(
  line: CodexResponseLine,
  sessionId: string
): ToolCallInsert[] {
  const content = line.message.content;
  if (typeof content === "string") {
    return [];
  }

  return content
    .filter(
      (block): block is Extract<CodexContentBlock, { type: "function_call" }> =>
        block.type === "function_call"
    )
    .map((block) => ({
      id: block.id,
      sessionId,
      messageId: line.id,
      resultMessageId: null,
      name: block.name,
      displayName: null,
      description: null,
      input: JSON.parse(block.arguments),
      inputRaw: block.arguments, // Store raw JSON string
      output: null,
      resultDisplay: null,
      renderOutputAsMarkdown: null,
      status: "pending" as const,
      errorMessage: null,
      completedAt: null,
      durationMs: null,
      fileEditMetadata: null,
    }));
}

/**
 * Extract token usage from a Codex response message
 */
export function extractTokenUsage(
  line: CodexResponseLine,
  sessionId: string
): TokenUsageInsert | null {
  const usage = line.usage;
  if (!usage) {
    return null;
  }

  return {
    id: `${line.id}-usage`,
    messageId: line.id,
    sessionId,
    model: line.model ?? "unknown",
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
    cacheReadTokens: null,
    cacheWriteTokens: null,
    thinkingTokens: null,
    toolTokens: null,
  };
}

/**
 * Extract rate limits from a Codex response message
 */
export function extractRateLimits(
  line: CodexResponseLine,
  sessionId: string
): RateLimitInsert[] {
  const rateLimit = line.rate_limit;
  if (!rateLimit) {
    return [];
  }

  const limits: RateLimitInsert[] = [];

  if (rateLimit.primary) {
    limits.push({
      id: `${line.id}-ratelimit-primary`,
      sessionId,
      windowType: "primary",
      limit: rateLimit.primary.limit,
      remaining: rateLimit.primary.remaining,
      resetAt: new Date(rateLimit.primary.reset_at),
    });
  }

  if (rateLimit.secondary) {
    limits.push({
      id: `${line.id}-ratelimit-secondary`,
      sessionId,
      windowType: "secondary",
      limit: rateLimit.secondary.limit,
      remaining: rateLimit.secondary.remaining,
      resetAt: new Date(rateLimit.secondary.reset_at),
    });
  }

  return limits;
}
