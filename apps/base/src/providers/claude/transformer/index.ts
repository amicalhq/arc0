/**
 * Claude JSONL -> Arc0 canonical SocketMessage transformer (Base-side; providers/claude).
 *
 * Why this lives in Base:
 * - Avoid duplicating provider parsing across clients (native/web/future desktop).
 * - Keep the wire protocol provider-agnostic (clients receive canonical messages only).
 */

import { randomUUID } from "node:crypto";
import type { SocketMessage } from "@arc0/types";
import {
  extractTextContent,
  toToolResultContent,
  transformContent,
} from "./content.js";
import {
  isMessageLine,
  isMetaLine,
  isSystemLocalCommandLine,
} from "./guards.js";
import {
  parseCommandOutput,
  parseLocalCommand,
  stripAnsi,
} from "./local-command.js";

// =============================================================================
// Public API
// =============================================================================

/**
 * Transform a single Claude JSONL payload into a canonical SocketMessage.
 *
 * Returns null for non-message lines (summary, file-history-snapshot, etc.).
 */
export function transformClaudePayloadToSocketMessage(
  sessionId: string,
  payload: unknown,
): SocketMessage | null {
  // Skip meta/caveat lines (noise)
  if (isMetaLine(payload)) return null;

  // Claude sometimes emits local commands as explicit system local_command lines.
  // These are important for capturing failures like `/model Default` -> "Model not found".
  if (isSystemLocalCommandLine(payload)) {
    const commandInfo = parseLocalCommand(payload.content);
    if (commandInfo) {
      return {
        type: "system",
        subtype: "local_command",
        uuid: payload.uuid,
        sessionId,
        parentUuid: payload.parentUuid,
        timestamp: payload.timestamp,
        content: [],
        commandName: commandInfo.commandName,
        commandArgs: commandInfo.commandArgs,
      };
    }

    const outputInfo = parseCommandOutput(payload.content);
    if (outputInfo) {
      return {
        type: "system",
        subtype: "local_command",
        uuid: payload.uuid,
        sessionId,
        parentUuid: payload.parentUuid,
        timestamp: payload.timestamp,
        content: [],
        stdout: outputInfo.stdout ? stripAnsi(outputInfo.stdout) : undefined,
        stderr: outputInfo.stderr ? stripAnsi(outputInfo.stderr) : undefined,
      };
    }

    return null;
  }

  if (!isMessageLine(payload)) return null;

  const textContent = extractTextContent(payload.message.content);

  // Local command messages are embedded as XML blobs in text.
  // Base parses these blobs and emits structured system messages so clients never
  // need to parse provider-specific formats.
  const commandInfo = parseLocalCommand(textContent);
  if (commandInfo) {
    return {
      type: "system",
      subtype: "local_command",
      uuid: payload.uuid,
      sessionId,
      parentUuid: payload.parentUuid,
      timestamp: payload.timestamp,
      content: [],
      commandName: commandInfo.commandName,
      commandArgs: commandInfo.commandArgs,
    };
  }

  const outputInfo = parseCommandOutput(textContent);
  if (outputInfo) {
    return {
      type: "system",
      subtype: "local_command",
      uuid: payload.uuid,
      sessionId,
      parentUuid: payload.parentUuid,
      timestamp: payload.timestamp,
      content: [],
      stdout: outputInfo.stdout ? stripAnsi(outputInfo.stdout) : undefined,
      stderr: outputInfo.stderr ? stripAnsi(outputInfo.stderr) : undefined,
    };
  }

  const stopReasonRaw = payload.message.stop_reason;
  const stopReason =
    stopReasonRaw === "end_turn" || stopReasonRaw === "tool_use"
      ? (stopReasonRaw as "end_turn" | "tool_use")
      : null;

  const content = transformContent(payload.message.content);

  // Normalize Claude toolUseResult into a standard tool_result block.
  // This keeps downstream reducers/tool-state logic provider-agnostic.
  if (payload.type === "user" && payload.toolUseResult?.toolCallId) {
    content.push({
      type: "tool_result",
      tool_use_id: payload.toolUseResult.toolCallId,
      content: toToolResultContent(payload.toolUseResult.result),
      is_error: false,
    });
  }

  const usage = payload.message.usage
    ? {
        inputTokens: payload.message.usage.input_tokens,
        outputTokens: payload.message.usage.output_tokens,
      }
    : undefined;

  if (payload.type === "assistant") {
    return {
      type: "assistant",
      uuid: payload.uuid,
      sessionId,
      parentUuid: payload.parentUuid,
      timestamp: payload.timestamp,
      content,
      stopReason,
      usage,
      model: payload.message.model ?? null,
    };
  }

  // User message
  return {
    type: "user",
    uuid: payload.uuid ?? randomUUID(),
    sessionId,
    parentUuid: payload.parentUuid,
    timestamp: payload.timestamp,
    content,
  };
}
