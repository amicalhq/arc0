/**
 * Session status computation from message content.
 * Analyzes the last assistant message to determine current session state.
 */

import type { ContentBlock, ToolUseBlock } from '@/lib/types/session';
import { type StatusInfo } from '@/lib/types/session-status';

/**
 * Input for computing session status.
 */
interface StatusComputationInput {
  /** Message type: 'user' | 'assistant' */
  type: string;
  /** Parsed content blocks from the message */
  contentBlocks: ContentBlock[];
  /** Stop reason from the API response */
  stopReason?: string | null;
  /** Whether the session is open (1) or closed (0) */
  isOpen: boolean;
}

/**
 * Compute the session status from the last message.
 *
 * Detection logic:
 * 1. Session closed → 'ended'
 * 2. Non-assistant message → 'idle'
 * 3. Has thinking blocks but no text/tools or no stop_reason → 'thinking'
 * 4. Has tool_use with name 'AskUserQuestion' → 'ask_user'
 * 5. Has tool_use with name 'ExitPlanMode' → 'plan_approval'
 * 6. stop_reason === 'tool_use' with any tool → 'tool_approval'
 * 7. Default → 'idle'
 */
export function computeSessionStatus(input: StatusComputationInput): StatusInfo {
  const { type, contentBlocks, stopReason, isOpen } = input;

  // Session is closed
  if (!isOpen) {
    return {
      status: 'ended',
      label: 'Ended',
      isAnimated: false,
    };
  }

  // Only analyze assistant messages for status
  if (type !== 'assistant') {
    return {
      status: 'idle',
      label: 'Ready',
      isAnimated: false,
    };
  }

  // Check for thinking blocks (Claude is thinking/generating)
  const hasThinking = contentBlocks.some((block) => block.type === 'thinking');
  const hasTextOrTools = contentBlocks.some(
    (block) => block.type === 'text' || block.type === 'tool_use'
  );

  // If only has thinking (no text/tools yet) or no stop_reason → thinking
  if (hasThinking && (!hasTextOrTools || !stopReason)) {
    return {
      status: 'thinking',
      label: 'Thinking...',
      isAnimated: true,
    };
  }

  // Find tool_use blocks
  const toolUseBlocks = contentBlocks.filter(
    (block): block is ToolUseBlock => block.type === 'tool_use'
  );

  // Check for AskUserQuestion
  const askUserTool = toolUseBlocks.find((block) => block.name === 'AskUserQuestion');
  if (askUserTool) {
    return {
      status: 'ask_user',
      label: 'Waiting for answer',
      isAnimated: false,
    };
  }

  // Check for ExitPlanMode
  const exitPlanTool = toolUseBlocks.find((block) => block.name === 'ExitPlanMode');
  if (exitPlanTool) {
    return {
      status: 'plan_approval',
      label: 'Waiting for approval',
      isAnimated: false,
    };
  }

  // Check for other tool use
  if (stopReason === 'tool_use' && toolUseBlocks.length > 0) {
    return {
      status: 'tool_approval',
      label: 'Approval pending',
      isAnimated: false,
    };
  }

  // Default: idle (end_turn or no specific state)
  return {
    status: 'idle',
    label: 'Ready',
    isAnimated: false,
  };
}
