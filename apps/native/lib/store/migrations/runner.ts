import type * as SQLite from 'expo-sqlite';

import * as migration001 from './001_initial_schema';
import * as migration002 from './002_add_session_status';
import * as migration003 from './003_add_artifacts';
import * as migration004 from './004_add_session_interactive';

interface Migration {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

// Register all migrations in order
const migrations: Migration[] = [migration001, migration002, migration003, migration004];

/**
 * Run all pending migrations.
 * Tracks applied migrations in a _migrations table.
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create migrations tracking table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Get current version
  const result = await db.getFirstAsync<{ max_version: number | null }>(
    'SELECT MAX(version) as max_version FROM _migrations'
  );
  const currentVersion = result?.max_version ?? 0;

  // Run pending migrations
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`[migrations] Running migration ${migration.version}...`);
      await migration.up(db);
      await db.runAsync('INSERT INTO _migrations (version) VALUES (?)', [migration.version]);
      console.log(`[migrations] Migration ${migration.version} complete`);
    }
  }
}

/**
 * Rollback the last migration.
 */
export async function rollbackMigration(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ max_version: number | null }>(
    'SELECT MAX(version) as max_version FROM _migrations'
  );
  const currentVersion = result?.max_version;

  if (!currentVersion) {
    console.log('[migrations] No migrations to rollback');
    return;
  }

  const migration = migrations.find((m) => m.version === currentVersion);
  if (migration) {
    console.log(`[migrations] Rolling back migration ${migration.version}...`);
    await migration.down(db);
    await db.runAsync('DELETE FROM _migrations WHERE version = ?', [migration.version]);
    console.log(`[migrations] Rollback of migration ${migration.version} complete`);
  }
}

/**
 * Get the current database version.
 */
export async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ max_version: number | null }>(
      'SELECT MAX(version) as max_version FROM _migrations'
    );
    return result?.max_version ?? 0;
  } catch {
    return 0;
  }
}
