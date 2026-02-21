/**
 * Native-only prompt composer types.
 *
 * These are intentionally NOT part of the Base<->Client wire contract:
 * - Base only needs the text to send to the session.
 * - The UI may evolve independently (and may be provider-specific).
 */

export type PromptMode = 'default' | 'bypass' | 'ask' | 'plan';

// Claude-only, UI-facing model picker (matches the existing UX).
export type ModelId = 'default' | 'opus-4.5' | 'sonnet-4.5' | 'haiku-4.5';
