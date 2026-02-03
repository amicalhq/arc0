import type * as SQLite from 'expo-sqlite';

/**
 * Add interactive column to sessions table.
 * Indicates whether the session can accept interactive input (e.g. running in tmux).
 */
export const version = 4;

export async function up(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    -- interactive: 1 = can receive input, 0 = read-only (non-interactive)
    ALTER TABLE sessions ADD COLUMN interactive INTEGER NOT NULL DEFAULT 1;
  `);
}

export async function down(_db: SQLite.SQLiteDatabase): Promise<void> {
  // SQLite doesn't support DROP COLUMN directly in older versions.
  console.log(
    '[migrations] Rolling back migration 4 - interactive column will remain but be unused'
  );
}
