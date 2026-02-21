import { randomUUID } from "node:crypto";
import type { TimelineItem } from "@arc0/types";
import type {
  SessionCursor,
  SessionData,
  SessionFile,
} from "../../lib/types.js";
import type { SessionFileWatcher } from "../session-files/watcher.js";
import type { SocketServer } from "../../socket/socket-server.js";
import { jsonlWatcher } from "../../transcript/index.js";
import { projectStore } from "../projects/index.js";
import {
  getItemTimestamp,
  linesToTimelineItems,
  mergeItemsByTimestamp,
  readLatestPermissionRequestItem,
} from "./timeline.js";

interface SendSessionsSyncOptions {
  socketServer: SocketServer;
  sessionWatcher: SessionFileWatcher;
  workstationId: string;
  sessionFileToData: (session: SessionFile) => Promise<SessionData>;
  socketId: string;
}

interface SendProjectsSyncOptions {
  socketServer: SocketServer;
  workstationId: string;
  socketId: string;
}

interface SendMessagesForClientOptions {
  socketServer: SocketServer;
  sessionWatcher: SessionFileWatcher;
  workstationId: string;
  cursor: SessionCursor[];
  socketId: string;
}

export async function sendSessionsSyncToClient(
  options: SendSessionsSyncOptions,
): Promise<void> {
  const {
    socketServer,
    sessionWatcher,
    workstationId,
    sessionFileToData,
    socketId,
  } = options;

  const sessions = await Promise.all(
    sessionWatcher.getActiveSessions().map(sessionFileToData),
  );
  socketServer.sendSessionsSyncToClient(socketId, {
    workstationId,
    sessions,
  });
}

export function sendProjectsSyncToClient(
  options: SendProjectsSyncOptions,
): void {
  const { socketServer, workstationId, socketId } = options;
  const projects = projectStore.getAll();
  socketServer.sendProjectsSyncToClient(socketId, {
    workstationId,
    projects,
  });
}

/**
 * Send messages for a client based on their cursor.
 * Sends one batch per session SEQUENTIALLY with flow control (waits for ack before next batch)
 */
export async function sendMessagesForClient(
  options: SendMessagesForClientOptions,
): Promise<void> {
  const { socketServer, sessionWatcher, workstationId, cursor, socketId } =
    options;

  // Build cursor map for quick lookup
  const cursorMap = new Map(cursor.map((c) => [c.sessionId, c.lastMessageTs]));

  // Get all active sessions
  const activeSessions = sessionWatcher.getActiveSessions();

  for (const session of activeSessions) {
    const lastTs = cursorMap.get(session.sessionId) ?? "";
    const lines = jsonlWatcher.getLinesSince(session.sessionId, lastTs);

    const transcriptItems = linesToTimelineItems(session, lines);
    const eventItems: TimelineItem[] = [];

    // Re-send the latest pending permission request on reconnect so the client
    // doesn't miss an approval prompt. Guard by cursor to avoid obvious duplicates.
    const latestPermission = readLatestPermissionRequestItem(session.sessionId);
    if (latestPermission) {
      const ts = getItemTimestamp(latestPermission);
      if (!lastTs || ts > lastTs) {
        eventItems.push(latestPermission);
      }
    }

    const items = mergeItemsByTimestamp(transcriptItems, eventItems);

    if (items.length > 0) {
      // Wait for ack before sending next session's batch
      await socketServer.sendMessagesBatchToClientAsync(socketId, {
        workstationId,
        items,
        batchId: randomUUID(),
      });
    }
  }
}
