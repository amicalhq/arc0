import { randomUUID } from "node:crypto";
import { eventBus } from "../../lib/events.js";
import type { SessionFileWatcher } from "../session-files/watcher.js";
import type { SocketServer } from "../../socket/socket-server.js";
import { jsonlWatcher } from "../../transcript/index.js";
import { sessionFileToData } from "./session-data.js";
import { linesToTimelineItems } from "./timeline.js";

interface RegisterDaemonEventHandlersOptions {
  sessionWatcher: SessionFileWatcher;
  socketServer: SocketServer;
  workstationId: string;
}

export function registerDaemonEventHandlers(
  options: RegisterDaemonEventHandlersOptions,
): void {
  const { sessionWatcher, socketServer, workstationId } = options;

  // Subscribe to eventBus - handle session and message events
  eventBus.on("session:start", (session) => {
    console.log(`[${session.provider}] session:start: ${session.sessionId}`);

    // Start watching the JSONL file for this session
    if (session.transcriptPath) {
      jsonlWatcher.watchSession(session.sessionId, session.transcriptPath);
    }
  });

  eventBus.on("session:end", (sessionId) => {
    console.log(`[daemon] session:end: ${sessionId}`);

    // Stop watching the JSONL file
    jsonlWatcher.unwatchSession(sessionId);
  });

  eventBus.on("sessions:change", async (sessions) => {
    console.log(`[daemon] sessions:change: ${sessions.length} active`);
    const sessionData = await Promise.all(sessions.map(sessionFileToData));
    socketServer.sendSessionsSync({
      workstationId,
      sessions: sessionData,
    });
  });

  // Handle new messages from JSONL watcher
  eventBus.on("messages:new", (sessionId, lines) => {
    console.log(
      `[daemon] messages:new: ${lines.length} lines for ${sessionId}`,
    );

    const session = sessionWatcher
      .getActiveSessions()
      .find((s) => s.sessionId === sessionId);
    if (!session) return;

    const items = linesToTimelineItems(session, lines);
    if (items.length === 0) return;

    // Broadcast to all connected clients
    socketServer.sendMessagesBatch({
      workstationId,
      items,
      batchId: randomUUID(),
    });
  });

  // Handle permission request events - send through messages channel
  eventBus.on("permission:request", (sessionId, event) => {
    console.log(
      `[daemon] permission:request: ${event.toolName} for ${sessionId}`,
    );

    socketServer.sendMessagesBatch({
      workstationId,
      items: [{ kind: "session_event", sessionId, event }],
      batchId: randomUUID(),
    });
  });
}
