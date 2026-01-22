import type * as SQLite from 'expo-sqlite';

/**
 * Add status and status_detail columns to sessions table.
 * Tracks the current state of each session for UI display.
 */
export const version = 2;

export async function up(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- Add status column (ask_user, plan_approval, working, idle, ended)
    ALTER TABLE sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'idle';

    -- Add status_detail column (human-readable status like "Reading file.ts")
    ALTER TABLE sessions ADD COLUMN status_detail TEXT DEFAULT 'Ready';

    -- Set ended sessions to 'ended' status
    UPDATE sessions SET status = 'ended', status_detail = 'Ended' WHERE open = 0;
  `);
}

export async function down(db: SQLite.SQLiteDatabase): Promise<void> {
  // SQLite doesn't support DROP COLUMN directly in older versions
  // For a rollback, we'd need to recreate the table without these columns
  // This is a simplified version that just logs the intention
  console.log('[migrations] Rolling back migration 2 - status columns will remain but be unused');
}
