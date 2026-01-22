#!/usr/bin/env node
/**
 * Headless mode for basemock - runs server without TUI.
 * Used by Playwright tests for E2E testing.
 *
 * Usage: tsx headless.ts --port 3863 --secret mysecret
 */

import { startServer, stopServer, createSession, sendSessionsSync } from './server.js';

// =============================================================================
// CLI Argument Parsing
// =============================================================================

function parseArgs(): { port: number; secret?: string } {
  const args = process.argv.slice(2);
  let port = 3863;
  let secret: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const nextArg = args[i + 1];
    if (args[i] === '--port' && nextArg) {
      port = parseInt(nextArg, 10);
      i++;
    } else if (args[i] === '--secret' && nextArg) {
      secret = nextArg;
      i++;
    }
  }

  return { port, secret };
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main() {
  const { port, secret } = parseArgs();

  console.log(`[basemock] Starting headless server on port ${port}...`);
  if (secret) {
    console.log(`[basemock] Secret configured: ${secret.slice(0, 8)}...`);
  }

  try {
    await startServer({ port, secret });
    console.log(`[basemock] Server running on http://localhost:${port}`);

    // Create a default session for testing
    const session = createSession('Sample Session');
    console.log(`[basemock] Created default session: ${session.id.slice(0, 8)}...`);
    sendSessionsSync();

    // Keep process alive and handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('[basemock] Received SIGTERM, shutting down...');
      await stopServer();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[basemock] Received SIGINT, shutting down...');
      await stopServer();
      process.exit(0);
    });

    // Heartbeat to show server is alive
    setInterval(() => {
      // Keep process alive
    }, 1000);
  } catch (err) {
    console.error('[basemock] Failed to start:', err);
    process.exit(1);
  }
}

main();
