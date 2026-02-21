import { watch, type FSWatcher } from "chokidar";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import type { SessionEvent } from "@arc0/types";
import { SESSIONS_DIR } from "../../lib/config.js";
import { eventBus } from "../../lib/events.js";
import type { SessionFile } from "../../lib/types.js";

/**
 * Watches ~/.arc0/sessions/ for session files created by hooks.
 * This is provider-agnostic - all providers write to the same directory.
 */
export class SessionFileWatcher {
  private watcher: FSWatcher | null = null;
  private activeSessions = new Map<string, SessionFile>();
  private eventFileOffsets = new Map<string, number>(); // Track read position for .events.jsonl files
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;

    // Ensure sessions directory exists
    if (!existsSync(SESSIONS_DIR)) {
      mkdirSync(SESSIONS_DIR, { recursive: true });
    }

    this.watcher = watch(SESSIONS_DIR, {
      persistent: true,
      ignoreInitial: false,
      depth: 0,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on("add", (path) => {
      if (path.endsWith(".events.jsonl")) {
        this.handleEventsAdd(path);
      } else {
        this.handleAdd(path);
      }
    });
    this.watcher.on("change", (path) => {
      if (path.endsWith(".events.jsonl")) {
        this.handleEventsChange(path);
      } else {
        this.handleChange(path);
      }
    });
    this.watcher.on("unlink", (path) => {
      if (path.endsWith(".events.jsonl")) {
        this.handleEventsRemove(path);
      } else {
        this.handleRemove(path);
      }
    });

    this.isRunning = true;
    console.log(`[sessions] Watching: ${SESSIONS_DIR}`);
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.isRunning = false;
  }

  get running(): boolean {
    return this.isRunning;
  }

  private readSessionFile(filePath: string): SessionFile | null {
    try {
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content) as SessionFile;
    } catch {
      return null;
    }
  }

  private getSessionIdFromPath(filePath: string): string | null {
    const filename = basename(filePath);
    if (!filename.endsWith(".json")) return null;
    return filename.replace(".json", "");
  }

  private getSessionIdFromEventsPath(filePath: string): string | null {
    const filename = basename(filePath);
    if (!filename.endsWith(".events.jsonl")) return null;
    return filename.replace(".events.jsonl", "");
  }

  private readNewEventsFromFile(filePath: string, sessionId: string): void {
    try {
      const stats = statSync(filePath);
      const currentOffset = this.eventFileOffsets.get(sessionId) ?? 0;

      if (stats.size <= currentOffset) return;

      // Read file as Buffer and slice by byte offset to handle UTF-8 correctly
      const buffer = readFileSync(filePath);
      const newContent = buffer.subarray(currentOffset).toString("utf-8");
      const lines = newContent.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        try {
          const event = JSON.parse(line) as SessionEvent;
          eventBus.emit("permission:request", sessionId, event);
        } catch {
          // Invalid JSON line, skip
        }
      }

      // Update offset to current file size (in bytes)
      this.eventFileOffsets.set(sessionId, stats.size);
    } catch {
      // File may not exist or be unreadable, ignore
    }
  }

  private handleEventsAdd(filePath: string): void {
    const sessionId = this.getSessionIdFromEventsPath(filePath);
    if (!sessionId) return;

    // Initialize offset and read any existing events
    this.eventFileOffsets.set(sessionId, 0);
    this.readNewEventsFromFile(filePath, sessionId);
  }

  private handleEventsChange(filePath: string): void {
    const sessionId = this.getSessionIdFromEventsPath(filePath);
    if (!sessionId) return;

    this.readNewEventsFromFile(filePath, sessionId);
  }

  private handleEventsRemove(filePath: string): void {
    const sessionId = this.getSessionIdFromEventsPath(filePath);
    if (!sessionId) return;

    this.eventFileOffsets.delete(sessionId);
  }

  private emitSessionsChange(): void {
    eventBus.emit("sessions:change", this.getActiveSessions());
  }

  private handleAdd(filePath: string): void {
    const sessionId = this.getSessionIdFromPath(filePath);
    if (!sessionId) return;

    const session = this.readSessionFile(filePath);
    if (!session) return;

    this.activeSessions.set(sessionId, session);

    eventBus.emit("session:start", session);
    this.emitSessionsChange();
  }

  private handleChange(filePath: string): void {
    const sessionId = this.getSessionIdFromPath(filePath);
    if (!sessionId) return;

    const session = this.readSessionFile(filePath);
    if (!session) return;

    this.activeSessions.set(sessionId, session);

    eventBus.emit("session:update", session);
    this.emitSessionsChange();
  }

  private handleRemove(filePath: string): void {
    const sessionId = this.getSessionIdFromPath(filePath);
    if (!sessionId) return;

    this.activeSessions.delete(sessionId);

    eventBus.emit("session:end", sessionId);
    this.emitSessionsChange();
  }

  getActiveSessions(): SessionFile[] {
    return Array.from(this.activeSessions.values());
  }
}
