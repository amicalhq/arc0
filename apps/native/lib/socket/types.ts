/**
 * Socket.IO event types for communication between Mobile app and Base service.
 * Re-exports shared types from @arc0/types and adds mobile-specific types.
 */

// Re-export shared socket types from @arc0/types
export type {
  // Event maps
  ServerToClient as ServerToClientEvents,
  ClientToServer as ClientToServerEvents,
  // Payloads
  InitPayload,
  SessionsSyncPayload,
  MessagesBatchPayload,
  RawMessageEnvelope,
  RawMessagesBatchPayload,
  // Data types
  SocketSessionData as SessionData,
  SocketMessage as ClaudeJSONLMessage,
  SessionCursor,
  // Content blocks
  ContentBlock,
  TextBlock,
  ThinkingBlock,
  ToolUseBlock,
  ToolResultBlock,
} from '@arc0/types';

// =============================================================================
// Mobile-specific Types (not shared with base)
// =============================================================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  error?: string;
  lastConnected?: Date;
  reconnectAttempts?: number;
}

// =============================================================================
// Multi-Workstation Types
// =============================================================================

/**
 * Workstation configuration stored in SQLite.
 * Secrets are stored separately in SecureStore/OPFS.
 */
export interface WorkstationConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  active: boolean;
}

/**
 * Full workstation data including runtime connection state.
 */
export interface WorkstationWithState extends WorkstationConfig {
  connectionState: ConnectionState;
}
