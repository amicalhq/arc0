import type * as SQLite from 'expo-sqlite';

/**
 * Initial database schema for Arc0 mobile app.
 * Creates tables for workstations, projects, sessions, and messages.
 */
export const version = 1;

export async function up(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- Workstations: machines running the Base service
    -- Multi-workstation support: stores connection config (secrets in SecureStore)
    CREATE TABLE IF NOT EXISTS workstations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Projects: identified by hash of (workstation_id, path)
    -- Same path on different workstations = different projects
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workstation_id TEXT NOT NULL,
      path TEXT NOT NULL,
      name TEXT NOT NULL,
      starred INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(workstation_id, path)
    );

    -- Sessions: coding sessions from Claude/CLI providers
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT,
      first_message TEXT,
      provider TEXT NOT NULL DEFAULT 'claude',
      project_id TEXT,
      workstation_id TEXT,
      open INTEGER NOT NULL DEFAULT 1,
      model TEXT,
      git_branch TEXT,
      started_at TEXT,
      ended_at TEXT,
      message_count INTEGER NOT NULL DEFAULT 0,
      last_message_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (workstation_id) REFERENCES workstations(id)
    );

    -- Messages: individual messages from sessions
    -- NOTE: content and usage are stored as JSON STRINGS
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      parent_id TEXT,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      content TEXT,
      stop_reason TEXT,
      usage TEXT,
      raw_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    -- SQL Views for convenience
    CREATE VIEW IF NOT EXISTS open_sessions AS
      SELECT * FROM sessions WHERE open = 1;

    CREATE VIEW IF NOT EXISTS open_messages AS
      SELECT m.* FROM messages m
      INNER JOIN sessions s ON m.session_id = s.id
      WHERE s.open = 1;

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_open ON sessions(open);
    CREATE INDEX IF NOT EXISTS idx_sessions_workstation_id ON sessions(workstation_id);
  `);
}

export async function down(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP VIEW IF EXISTS open_messages;
    DROP VIEW IF EXISTS open_sessions;
    DROP INDEX IF EXISTS idx_sessions_workstation_id;
    DROP INDEX IF EXISTS idx_sessions_open;
    DROP INDEX IF EXISTS idx_sessions_project_id;
    DROP INDEX IF EXISTS idx_messages_timestamp;
    DROP INDEX IF EXISTS idx_messages_session_id;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS projects;
    DROP TABLE IF EXISTS workstations;
  `);
}
