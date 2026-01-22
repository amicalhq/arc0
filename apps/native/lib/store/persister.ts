/**
 * Persister utilities for TinyBase + SQLite.
 * Main persistence logic is in provider.tsx.
 * This file contains utility functions for direct database access.
 */

import type * as SQLite from 'expo-sqlite';

/**
 * Direct database reference for manual queries.
 * Set by StoreProvider during initialization.
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

export function setDbInstance(db: SQLite.SQLiteDatabase | null): void {
  dbInstance = db;
}

export function getDbInstance(): SQLite.SQLiteDatabase | null {
  return dbInstance;
}

/**
 * Execute a raw SQL query on the database.
 * Use for queries that bypass TinyBase (e.g., loading closed session messages).
 */
export async function executeQuery<T>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance.getAllAsync<T>(sql, params);
}

/**
 * Execute a raw SQL statement (INSERT, UPDATE, DELETE).
 */
export async function executeStatement(
  sql: string,
  params: (string | number | null)[] = []
): Promise<SQLite.SQLiteRunResult> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance.runAsync(sql, params);
}

/**
 * Execute multiple statements in a transaction.
 */
export async function withTransaction(fn: () => Promise<void>): Promise<void> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  await dbInstance.withTransactionAsync(fn);
}
