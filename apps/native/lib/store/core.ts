import { Appearance } from 'react-native';
import { createIndexes, createQueries, createRelationships, createStore } from 'tinybase';
import type { Indexes, Queries, Relationships, Store } from 'tinybase';
import { Uniwind } from 'uniwind';

/** User's theme preference - can be explicit or follow system */
export type ThemePreference = 'light' | 'dark' | 'system';
/** Resolved theme for actual styling (no 'system' - always light or dark) */
export type ResolvedTheme = 'light' | 'dark';

// Store instance (singleton)
let coreStore: Store | null = null;
let indexes: Indexes | null = null;
let relationships: Relationships | null = null;
let queries: Queries | null = null;

/** Get the current system color scheme */
export function getSystemTheme(): ResolvedTheme {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

/** Resolve a theme preference to an actual theme */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

// Set Uniwind to system theme immediately (before async init)
Uniwind.setTheme(getSystemTheme());

/**
 * Create and configure the core TinyBase store with all tables, values, indexes, relationships, and queries.
 * Returns existing store if already created.
 */
export function createCoreStore(): {
  store: Store;
  indexes: Indexes;
  relationships: Relationships;
  queries: Queries;
} {
  if (coreStore && indexes && relationships && queries) {
    return { store: coreStore, indexes, relationships, queries };
  }

  // Create the store with initial values
  coreStore = createStore().setValues({
    theme: getSystemTheme(),
    device: '', // Generated UUID, set on first launch after persister load
    active_session_id: '', // Currently viewed session ID (for real-time artifact updates)
  });

  // Create indexes for efficient lookups
  indexes = createIndexes(coreStore);
  indexes.setIndexDefinition('sessionsByOpen', 'sessions', 'open');
  indexes.setIndexDefinition('messagesBySession', 'messages', 'session_id');
  indexes.setIndexDefinition('sessionsByProject', 'sessions', 'project_id');
  indexes.setIndexDefinition('artifactsBySession', 'artifacts', 'session_id');

  // Create relationships between tables
  relationships = createRelationships(coreStore);
  relationships.setRelationshipDefinition('messageSession', 'messages', 'sessions', 'session_id');
  relationships.setRelationshipDefinition('sessionProject', 'sessions', 'projects', 'project_id');
  relationships.setRelationshipDefinition(
    'sessionWorkstation',
    'sessions',
    'workstations',
    'workstation_id'
  );

  // Create queries for computed views
  queries = createQueries(coreStore);
  queries.setQueryDefinition('openSessions', 'sessions', ({ select, where }) => {
    select('id');
    select('name');
    select('first_message');
    select('provider');
    select('project_id');
    select('workstation_id');
    select('model');
    select('git_branch');
    select('started_at');
    select('ended_at');
    select('message_count');
    select('last_message_at');
    where('open', 1);
  });

  // Sync TinyBase theme value -> Uniwind on changes
  // Resolves 'system' to actual system theme before applying
  coreStore.addValueListener('theme', () => {
    const preference = coreStore?.getValue('theme') as ThemePreference | undefined;
    if (preference) {
      Uniwind.setTheme(resolveTheme(preference));
    }
  });

  return { store: coreStore, indexes, relationships, queries };
}

/**
 * Get the core store instance.
 * Throws if store hasn't been created yet.
 */
export function getCoreStore(): Store {
  if (!coreStore) {
    throw new Error('Core store not initialized. Call createCoreStore() first.');
  }
  return coreStore;
}

/**
 * Get the indexes instance.
 */
export function getIndexes(): Indexes {
  if (!indexes) {
    throw new Error('Indexes not initialized. Call createCoreStore() first.');
  }
  return indexes;
}

/**
 * Get the relationships instance.
 */
export function getRelationships(): Relationships {
  if (!relationships) {
    throw new Error('Relationships not initialized. Call createCoreStore() first.');
  }
  return relationships;
}

/**
 * Get the queries instance.
 */
export function getQueries(): Queries {
  if (!queries) {
    throw new Error('Queries not initialized. Call createCoreStore() first.');
  }
  return queries;
}

/**
 * Toggle between light and dark theme.
 * Note: If current preference is 'system', toggles based on resolved theme.
 */
export function toggleTheme(): void {
  if (!coreStore) return;
  const current = coreStore.getValue('theme') as ThemePreference;
  const resolved = resolveTheme(current);
  coreStore.setValue('theme', resolved === 'dark' ? 'light' : 'dark');
}

/**
 * Set theme preference explicitly.
 */
export function setTheme(theme: ThemePreference): void {
  if (!coreStore) return;
  coreStore.setValue('theme', theme);
}

/**
 * Get the current device ID.
 */
export function getDeviceId(): string {
  if (!coreStore) return '';
  return coreStore.getValue('device') as string;
}

/**
 * Get the currently active session ID.
 */
export function getActiveSessionId(): string {
  if (!coreStore) return '';
  return coreStore.getValue('active_session_id') as string;
}

/**
 * Set the currently active session ID.
 */
export function setActiveSessionId(sessionId: string): void {
  if (!coreStore) return;
  coreStore.setValue('active_session_id', sessionId);
}

/**
 * Destroy the store instance (for testing or cleanup).
 */
export function destroyCoreStore(): void {
  coreStore = null;
  indexes = null;
  relationships = null;
  queries = null;
}
