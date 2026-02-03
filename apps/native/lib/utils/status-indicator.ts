/**
 * Unified status indicator constants and helper for session cards.
 * Used by both SessionCard and ProjectSessionItem.
 */

import type { SessionStatus } from '@/lib/types/session-status';

/**
 * Status colors for dots and text.
 * All working states use blue, ask_user uses amber, idle/ended use muted.
 */
export const STATUS_COLORS: Record<SessionStatus, { dot: string; text: string }> = {
  sending: { dot: 'bg-blue-500', text: 'text-blue-500' },
  submitting: { dot: 'bg-blue-500', text: 'text-blue-500' },
  thinking: { dot: 'bg-blue-500', text: 'text-blue-500' },
  working: { dot: 'bg-blue-500', text: 'text-blue-500' },
  tool_approval: { dot: 'bg-amber-500', text: 'text-amber-500' },
  plan_approval: { dot: 'bg-amber-500', text: 'text-amber-500' },
  ask_user: { dot: 'bg-amber-500', text: 'text-amber-500' },
  idle: { dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  ended: { dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
};

/**
 * Statuses that show an animated loader instead of a static dot.
 * Note: tool_approval, plan_approval, ask_user are NOT animated - they show
 * a static amber dot since they're waiting for user input/response.
 */
export const ANIMATED_STATUSES: SessionStatus[] = [
  'sending',
  'submitting',
  'thinking',
  'working',
];

/**
 * Check if a status should show animation.
 */
export function isAnimatedStatus(status: SessionStatus): boolean {
  return ANIMATED_STATUSES.includes(status);
}
