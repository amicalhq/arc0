/**
 * Persister utilities for TinyBase + SQLite.
 * Main persistence logic is in provider.tsx.
 * This file contains utility functions for direct database access.
 */

import type * as SQLite from 'expo-sqlite';
import { Mutex } from 'async-mutex';

/**
 * Direct database reference for manual queries.
 * Set by StoreProvider during initialization.
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Transaction mutex to prevent nested transactions.
 * expo-sqlite's withTransactionAsync doesn't support nesting, so we serialize
 * all transaction requests to ensure only one runs at a time.
 */
const transactionMutex = new Mutex();

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
 * Uses a mutex to serialize transactions and prevent nesting errors.
 */
export async function withTransaction(fn: () => Promise<void>): Promise<void> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  await transactionMutex.runExclusive(async () => {
    await dbInstance!.withTransactionAsync(fn);
  });
}
