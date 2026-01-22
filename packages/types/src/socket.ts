/**
 * Socket.IO event types for Base <-> App communication.
 */

import type { ProviderId } from "./enums";
import type { ContentBlock } from "./content-blocks";
import type {
  ActionResult,
  ApproveToolUsePayload,
  OpenSessionPayload,
  SendPromptPayload,
  StopAgentPayload,
} from "./user-actions";

// =============================================================================
// Transport Types (simplified for socket payloads)
// =============================================================================

/**
 * Session data sent over socket.
 * Simplified version of Session entity for transport.
 */
export interface SocketSessionData {
  id: string;
  provider: ProviderId;
  cwd: string; // Working directory path, mobile generates hash ID for project
  name: string | null;
  model: string | null;
  gitBranch: string | null;
  startedAt: string; // ISO string for transport
  interactive?: boolean; // true if session is running in tmux (can receive input)
}

/**
 * Project data sent over socket.
 * Represents a known project directory from ~/.claude/projects/
 */
export interface SocketProjectData {
  cwd: string; // absolute path (e.g., "/Users/x/myproject")
}

/**
 * Message sent over socket.
 * Simplified version of Message entity for transport.
 */
export interface SocketMessage {
  uuid: string;
  sessionId: string;
  parentUuid?: string;
  type: "user" | "assistant" | "system";
  timestamp: string; // ISO string for transport
  cwd?: string;
  content: ContentBlock[];
  stopReason?: "end_turn" | "tool_use" | null;
  usage?: { inputTokens: number; outputTokens: number };
}

/**
 * Session cursor - tracks last known message position.
 * Used for cursor-based sync to resume from where client left off.
 */
export interface SessionCursor {
  sessionId: string;
  lastMessageTs: string; // Primary cursor - timestamp comparison
  lastMessageId?: string; // Optional - for deduplication if needed
}

// =============================================================================
// Event Payloads
// =============================================================================

/**
 * Payload for init event (App -> Base on connect).
 */
export interface InitPayload {
  deviceId: string;
  cursor: SessionCursor[];
}

/**
 * Payload for sessions event (Base -> App).
 */
export interface SessionsSyncPayload {
  workstationId: string;
  sessions: SocketSessionData[];
}

/**
 * Payload for projects event (Base -> App).
 */
export interface ProjectsSyncPayload {
  workstationId: string;
  projects: SocketProjectData[];
}

/**
 * Payload for messages event (Base -> App).
 */
export interface MessagesBatchPayload {
  workstationId: string;
  messages: SocketMessage[];
  batchId: string;
}

// =============================================================================
// Socket.IO Event Maps
// =============================================================================

/**
 * Events: Base -> App
 */
export interface ServerToClient {
  "sessions": (payload: SessionsSyncPayload) => void;
  "projects": (payload: ProjectsSyncPayload) => void;
  "messages": (payload: RawMessagesBatchPayload, ack: () => void) => void;
}

/**
 * Events: App -> Base
 */
export interface ClientToServer {
  init: (payload: InitPayload) => void;
  // User actions (with ack callbacks)
  openSession: (payload: OpenSessionPayload, ack: (result: ActionResult) => void) => void;
  sendPrompt: (payload: SendPromptPayload, ack: (result: ActionResult) => void) => void;
  stopAgent: (payload: StopAgentPayload, ack: (result: ActionResult) => void) => void;
  approveToolUse: (payload: ApproveToolUsePayload, ack: (result: ActionResult) => void) => void;
}

// =============================================================================
// Raw Message Envelope (JSONL passthrough from Base to App)
// =============================================================================

/**
 * Raw JSONL line wrapped with session context.
 * Base sends raw JSONL lines without transformation.
 * App handles parsing, filtering, and transformation.
 */
export interface RawMessageEnvelope {
  sessionId: string;
  payload: unknown; // Raw JSONL line (ClaudeJsonlLine from claude/jsonl.ts)
}

/**
 * Payload for messages event using raw envelopes.
 */
export interface RawMessagesBatchPayload {
  workstationId: string;
  messages: RawMessageEnvelope[];
  batchId: string;
}
