/**
 * NK Database — expo-sqlite + Drizzle ORM
 * Handles initialization, migrations, and exports typed db instance
 */

import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// Open (or create) the SQLite database file
const sqlite = !isWeb ? openDatabaseSync('nk.db') : null as any;

// Export the Drizzle-wrapped db instance
export const db = !isWeb ? drizzle(sqlite, { schema }) : null as any;

/**
 * Run initial table creation migrations.
 * Call this once at app startup (in _layout.tsx).
 */
export async function initDatabase(): Promise<void> {
  if (isWeb) return;
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS finance_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'check-circle',
      color TEXT NOT NULL DEFAULT '#EBB328',
      streak INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      completed_at INTEGER NOT NULL,
      date_key TEXT NOT NULL,
      UNIQUE(habit_id, date_key)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'personal',
      is_completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date INTEGER,
      created_at INTEGER NOT NULL
    );
  `);
}

export { schema };
