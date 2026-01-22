import type * as SQLite from 'expo-sqlite';

/**
 * Add artifacts table for storing extracted plan and todo data.
 * Artifacts are stored in SQLite and loaded into TinyBase on demand.
 */
export const version = 3;

export async function up(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- Artifacts: extracted plan and todo data from session messages
    -- ID format: <session_id>:plan or <session_id>:todos
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      content TEXT NOT NULL,
      source_message_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    -- Indexes for efficient lookups
    CREATE INDEX IF NOT EXISTS idx_artifacts_session_id ON artifacts(session_id);
    CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
  `);
}

export async function down(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_artifacts_type;
    DROP INDEX IF EXISTS idx_artifacts_session_id;
    DROP TABLE IF EXISTS artifacts;
  `);
}
