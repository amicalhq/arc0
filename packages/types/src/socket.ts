/**
 * Socket.IO event types for Base <-> App communication.
 */

import type { ProviderId } from "./enums";
import type { ContentBlock } from "./content-blocks";
import type { SessionEvent } from "./session";
import type { Arc0ProtocolVersion } from "./protocol";
import type {
  ActionResult,
  ApproveToolUsePayload,
  OpenSessionPayload,
  SendPromptPayload,
  StopAgentPayload,
} from "./user-actions";

// =============================================================================
// Encryption Types
// =============================================================================

// Import type for local use; re-export for consumers
import type { EncryptedEnvelope } from "@arc0/crypto";
export type { EncryptedEnvelope };

// =============================================================================
// Socket.IO Authentication
// =============================================================================

/**
 * Socket.IO handshake auth using per-client token.
 */
export interface SocketAuth {
  /** Unique device identifier */
  deviceId: string;
  /** Auth token derived from SPAKE2 pairing */
  authToken: string;
}

// =============================================================================
// Protocol / Versioning
// =============================================================================

/**
 * Base -> Client: protocol error.
 * Sent unencrypted because it may be emitted before encryption is negotiated.
 */
export interface ProtocolErrorPayload {
  code: "PROTOCOL_MISMATCH";
  expected: number;
  received: number;
  message: string;
}

// =============================================================================
// Pairing Protocol Types
// =============================================================================

/**
 * Pairing error codes.
 */
export type PairingErrorCode =
  | "INVALID_CODE"
  | "INVALID_FORMAT"
  | "TIMEOUT"
  | "MAC_MISMATCH"
  | "ALREADY_PAIRED"
  | "PAIRING_DISABLED";

/**
 * Client -> Server: Initialize pairing with SPAKE2 message.
 */
export interface PairInitPayload {
  /** Unique device identifier */
  deviceId: string;
  /** Human-readable device name */
  deviceName: string;
  /** SPAKE2 public message (hex encoded) */
  spake2Message: string;
}

/**
 * Server -> Client: SPAKE2 challenge response.
 */
export interface PairChallengePayload {
  /** SPAKE2 public message (hex encoded) */
  spake2Message: string;
}

/**
 * Client -> Server: Confirmation MAC.
 */
export interface PairConfirmPayload {
  /** HMAC confirmation (hex encoded) */
  mac: string;
}

/**
 * Server -> Client: Pairing complete with workstation info.
 */
export interface PairCompletePayload {
  /** Server's HMAC confirmation (hex encoded) */
  mac: string;
  /** Workstation ID to store */
  workstationId: string;
  /** Workstation name for display */
  workstationName: string;
}

/**
 * Server -> Client: Pairing error.
 */
export interface PairErrorPayload {
  code: PairingErrorCode;
  message: string;
}

// =============================================================================
// Transport Types (simplified for socket payloads)
// =============================================================================

/**
 * Session capabilities advertised by Base.
 * Keeps UI logic provider-agnostic via feature-gating.
 */
export interface SessionCapabilities {
  modelSwitch:
    | { supported: false }
    | {
        supported: true;
        kind: "command";
        commandName: "/model";
        /**
         * Optional UI choices for known providers.
         * If absent, UI can fall back to a free-form input for the command.
         */
        options?: Array<{ id: string; label: string; command: string }>;
      };

  approvals: {
    /**
     * Whether Base will emit `permission_request` session events for this provider.
     */
    supported: boolean;
  };
}

/**
 * Session data sent over socket (transport form).
 */
export interface SocketSession {
  id: string;
  provider: ProviderId;
  cwd: string; // Working directory path, mobile generates hash ID for project
  name: string | null;
  model: string | null;
  gitBranch: string | null;
  startedAt: string; // ISO string for transport
  interactive: boolean; // true if session can receive input (tmux-backed)
  capabilities: SessionCapabilities;
}

/**
 * Project data sent over socket.
 * Represents a known project directory from ~/.claude/projects/
 */
export interface SocketProjectData {
  cwd: string; // absolute path (e.g., "/Users/x/myproject")
}

/**
 * Canonical messages sent over socket.
 */
export interface SocketBaseMessage {
  uuid: string;
  sessionId: string;
  parentUuid: string | null;
  timestamp: string; // ISO string for transport
  content: ContentBlock[];
}

export interface SocketUserMessage extends SocketBaseMessage {
  type: "user";
}

export interface SocketAssistantMessage extends SocketBaseMessage {
  type: "assistant";
  stopReason?: "end_turn" | "tool_use" | null;
  usage?: { inputTokens: number; outputTokens: number };
  model?: string | null;
}

export type SystemMessageSubtype =
  | "local_command"
  | "api_error"
  | "compact_boundary"
  | "stop_hook_summary"
  | "turn_duration";

export interface SocketSystemMessage extends SocketBaseMessage {
  type: "system";
  subtype?: SystemMessageSubtype;

  // Local command (Claude) support: Base must parse provider blobs and populate these.
  commandName?: string; // e.g. "/model"
  commandArgs?: string; // raw args string if available
  stdout?: string;
  stderr?: string;
}

export type SocketMessage =
  | SocketUserMessage
  | SocketAssistantMessage
  | SocketSystemMessage;

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
  protocolVersion: Arc0ProtocolVersion | number;
}

/**
 * Payload for sessions event (Base -> App).
 */
export interface SessionsSyncPayload {
  workstationId: string;
  sessions: SocketSession[];
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
 * Canonical timeline batch (messages + session events).
 */
export interface TimelineBatchPayload {
  workstationId: string;
  batchId: string;
  items: TimelineItem[];
}

/**
 * Timeline item (message or session event).
 */
export type TimelineItem =
  | { kind: "message"; message: SocketMessage }
  | { kind: "session_event"; sessionId: string; event: SessionEvent };

// =============================================================================
// Socket.IO Event Maps
// =============================================================================

/**
 * Events: Base -> App (pairing events - unauthenticated)
 */
export interface PairingServerToClient {
  "pair:challenge": (payload: PairChallengePayload) => void;
  "pair:complete": (payload: PairCompletePayload) => void;
  "pair:error": (payload: PairErrorPayload) => void;
}

/**
 * Events: App -> Base (pairing events - unauthenticated)
 */
export interface PairingClientToServer {
  "pair:init": (payload: PairInitPayload) => void;
  "pair:confirm": (payload: PairConfirmPayload) => void;
}

/**
 * Events: Base -> App (authenticated, encrypted)
 */
export interface ServerToClient extends PairingServerToClient {
  // Encrypted payloads
  sessions: (payload: EncryptedEnvelope) => void;
  projects: (payload: EncryptedEnvelope) => void;
  messages: (payload: EncryptedEnvelope, ack: () => void) => void;
  // Unencrypted errors
  "protocol:error": (payload: ProtocolErrorPayload) => void;
}

/**
 * Events: App -> Base (authenticated, encrypted)
 */
export interface ClientToServer extends PairingClientToServer {
  // init remains unencrypted (cursor sync, no sensitive data)
  init: (payload: InitPayload) => void;
  // User actions - encrypted payloads with ack
  openSession: (
    payload: EncryptedEnvelope,
    ack: (result: ActionResult) => void,
  ) => void;
  sendPrompt: (
    payload: EncryptedEnvelope,
    ack: (result: ActionResult) => void,
  ) => void;
  stopAgent: (
    payload: EncryptedEnvelope,
    ack: (result: ActionResult) => void,
  ) => void;
  approveToolUse: (
    payload: EncryptedEnvelope,
    ack: (result: ActionResult) => void,
  ) => void;
}

// =============================================================================
// No raw passthrough types here: Base must ship canonical timeline only.
