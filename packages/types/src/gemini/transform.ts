import type {
  GeminiContentBlock,
  GeminiUserLine,
  GeminiModelLine,
  GeminiJsonlLine,
  GeminiCodeTracker,
} from "./jsonl";
import type { ContentBlock, MessageRole } from "../index";
import type {
  MessageInsert,
  ToolCallInsert,
  TokenUsageInsert,
  ThinkingStepInsert,
  FileSnapshotInsert,
} from "../entities";

/**
 * Transform a Gemini content block to unified format
 */
export function transformGeminiContentBlock(
  block: GeminiContentBlock
): ContentBlock {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };

    case "thinking_step":
      return {
        type: "thinking",
        thinking: block.description,
        summary: block.subject,
      };

    case "function_call":
      return {
        type: "tool_use",
        id: block.id,
        name: block.name,
        input: block.args,
      };

    case "function_response":
      return {
        type: "tool_result",
        tool_use_id: block.id,
        content: typeof block.response === "string" ? block.response : block.response as Record<string, unknown>,
        is_error: false,
      };
  }
}

/**
 * Transform Gemini message parts to unified ContentBlock array
 */
export function transformGeminiContent(
  parts: GeminiContentBlock[]
): ContentBlock[] {
  return parts.map(transformGeminiContentBlock);
}

/**
 * Determine unified message role from Gemini JSONL line
 */
export function determineMessageRole(line: GeminiJsonlLine): MessageRole {
  if (line.type === "info") {
    return "system";
  }
  if (line.type === "user") {
    return "user";
  }
  if (line.type === "gemini") {
    return "assistant";
  }
  return "system";
}

/**
 * Transform a Gemini JSONL user/model line to a unified message
 */
export function transformGeminiMessage(
  line: GeminiUserLine | GeminiModelLine,
  sessionId: string
): MessageInsert {
  const content = transformGeminiContent(line.content.parts);
  const role = determineMessageRole(line);

  return {
    id: line.id,
    sessionId,
    parentMessageId: null,
    role,
    providerType: line.type,
    content,
    rawContent: null,
    model: line.type === "gemini" ? (line.model ?? null) : null,
    providerMessageId: line.id,
    providerRequestId: null,
    providerMetadata: null,
  };
}

/**
 * Extract tool calls from a Gemini model message
 */
export function extractToolCalls(
  line: GeminiModelLine,
  sessionId: string
): ToolCallInsert[] {
  return line.content.parts
    .filter(
      (block): block is Extract<GeminiContentBlock, { type: "function_call" }> =>
        block.type === "function_call"
    )
    .map((block) => ({
      id: block.id,
      sessionId,
      messageId: line.id,
      resultMessageId: null,
      name: block.name,
      displayName: block.display_name ?? null,
      description: null,
      input: block.args,
      inputRaw: null,
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
 * Extract token usage from a Gemini model message
 */
export function extractTokenUsage(
  line: GeminiModelLine,
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
    inputTokens: usage.prompt_token_count,
    outputTokens: usage.candidates_token_count,
    totalTokens: usage.total_token_count,
    cacheReadTokens: usage.cached_content_token_count ?? null,
    cacheWriteTokens: null,
    thinkingTokens: usage.thinking_token_count ?? null,
    toolTokens: usage.tool_token_count ?? null,
  };
}

/**
 * Extract thinking steps from a Gemini model message
 */
export function extractThinkingSteps(
  line: GeminiModelLine,
  sessionId: string
): ThinkingStepInsert[] {
  return line.content.parts
    .filter(
      (block): block is Extract<GeminiContentBlock, { type: "thinking_step" }> =>
        block.type === "thinking_step"
    )
    .map((block, index) => ({
      id: `${line.id}-thinking-${index}`,
      messageId: line.id,
      sessionId,
      subject: block.subject,
      description: block.description,
      sequence: index,
    }));
}

/**
 * Transform Gemini code tracker entries to file snapshots
 */
export function transformCodeTrackerToSnapshots(
  entries: GeminiCodeTracker[],
  sessionId: string
): FileSnapshotInsert[] {
  return entries.map((entry) => ({
    id: `${sessionId}-snapshot-${entry.path_hash}-${entry.version}`,
    sessionId,
    filePath: entry.file_path,
    pathHash: entry.path_hash,
    version: entry.version,
    backupFileName: entry.backup_file_name,
    content: null, // Content not stored in line
    contentHash: entry.content_hash,
    contentSize: entry.content_size,
    repoName: entry.repo_name ?? null,
    repoCommit: entry.repo_commit ?? null,
  }));
}
