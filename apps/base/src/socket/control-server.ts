import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import type { ClientInfo, SessionData } from "../lib/types.js";
import { pairingManager, type PairingResult } from "./pairing.js";
import type { ServerStatus } from "./types.js";

// =============================================================================
// ControlServer - HTTP API for CLI (localhost only)
// =============================================================================

export interface ControlServerOptions {
  preferredPort?: number;
  onReady?: (port: number) => void;
}

export class ControlServer {
  private httpServer: ReturnType<typeof createServer>;
  private startTime = Date.now();
  private _port = 0;
  private tunnelStopHandler?: () => Promise<void>;
  private pairingCompletedDevice?: { deviceId: string; deviceName: string };

  // References to socket server for status
  private getClientCount: () => number = () => 0;
  private getSessionCount: () => number = () => 0;
  private getSessions: () => SessionData[] = () => [];
  private getClients: () => ClientInfo[] = () => [];

  constructor(options: ControlServerOptions = {}) {
    this.httpServer = createServer((req, res) => this.handleRequest(req, res));

    // Setup pairing completion callback
    pairingManager.onComplete((result: PairingResult) => {
      this.pairingCompletedDevice = {
        deviceId: result.deviceId,
        deviceName: result.deviceName,
      };
    });

    const startListening = (port: number) => {
      this.httpServer.listen(port, "127.0.0.1", () => {
        const addr = this.httpServer.address();
        if (addr && typeof addr === "object") {
          this._port = addr.port;
          console.log(`[control] Listening on 127.0.0.1:${this._port}`);
          options.onReady?.(this._port);
        }
      });
    };

    // Try preferred port first, fall back to OS-assigned port on conflict
    if (options.preferredPort && options.preferredPort > 0) {
      this.httpServer.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          console.log(
            `[control] Preferred port ${options.preferredPort} in use, falling back to OS-assigned`,
          );
          startListening(0);
        } else {
          throw err;
        }
      });
      startListening(options.preferredPort);
    } else {
      startListening(0);
    }
  }

  get port(): number {
    return this._port;
  }

  /**
   * Set references to socket server data for status API.
   */
  setDataProviders(providers: {
    getClientCount: () => number;
    getSessionCount: () => number;
    getSessions: () => SessionData[];
    getClients: () => ClientInfo[];
  }): void {
    this.getClientCount = providers.getClientCount;
    this.getSessionCount = providers.getSessionCount;
    this.getSessions = providers.getSessions;
    this.getClients = providers.getClients;
  }

  /**
   * Set handler for stopping the tunnel (called via API).
   */
  setTunnelStopHandler(handler: () => Promise<void>): void {
    this.tunnelStopHandler = handler;
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/api/status") {
      const status: ServerStatus = {
        running: true,
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        clientCount: this.getClientCount(),
        sessionCount: this.getSessionCount(),
      };
      res.writeHead(200);
      res.end(JSON.stringify(status));
      return;
    }

    if (req.method === "GET" && req.url === "/api/clients") {
      const clients = this.getClients().map((c) => ({
        socketId: c.socketId,
        deviceId: c.deviceId,
        connectedAt: c.connectedAt.toISOString(),
        lastAckAt: c.lastAckAt?.toISOString() ?? null,
      }));
      res.writeHead(200);
      res.end(JSON.stringify({ clients }));
      return;
    }

    if (req.method === "GET" && req.url === "/api/sessions") {
      res.writeHead(200);
      res.end(JSON.stringify({ sessions: this.getSessions() }));
      return;
    }

    if (req.method === "POST" && req.url === "/api/tunnel/stop") {
      if (this.tunnelStopHandler) {
        this.tunnelStopHandler()
          .then(() => {
            res.writeHead(200);
            res.end(JSON.stringify({ ok: true }));
          })
          .catch((err) => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: String(err) }));
          });
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, message: "No tunnel running" }));
      }
      return;
    }

    // Pairing API
    if (req.method === "POST" && req.url === "/api/pairing/start") {
      // Clear any previous completion state
      this.pairingCompletedDevice = undefined;
      const { code, formattedCode } = pairingManager.startPairing();
      const expiresIn = pairingManager.getRemainingTime();
      res.writeHead(200);
      res.end(JSON.stringify({ code, formattedCode, expiresIn }));
      console.log(`[control] Started pairing session: ${formattedCode}`);
      return;
    }

    if (req.method === "GET" && req.url === "/api/pairing/status") {
      const active = pairingManager.isPairingActive();
      const code = pairingManager.getActiveCode();
      const remainingMs = pairingManager.getRemainingTime();

      // Check if pairing completed
      if (this.pairingCompletedDevice) {
        const { deviceId, deviceName } = this.pairingCompletedDevice;
        this.pairingCompletedDevice = undefined; // Clear after reading
        res.writeHead(200);
        res.end(
          JSON.stringify({
            active: false,
            completed: true,
            deviceId,
            deviceName,
          }),
        );
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ active, code, remainingMs, completed: false }));
      return;
    }

    if (req.method === "POST" && req.url === "/api/pairing/cancel") {
      pairingManager.cancelPairing();
      this.pairingCompletedDevice = undefined;
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }

  close(): void {
    this.httpServer.close();
  }
}
