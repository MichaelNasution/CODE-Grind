/**
 * NK Database Schema — Drizzle ORM + expo-sqlite
 * Tables: finance_transactions, habits, habit_logs, tasks
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Finance ─────────────────────────────────────────────────────────────────

export const financeTransactions = sqliteTable('finance_transactions', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  note: text('note').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type FinanceTransaction = typeof financeTransactions.$inferSelect;
export type NewFinanceTransaction = typeof financeTransactions.$inferInsert;

// ─── Habits ──────────────────────────────────────────────────────────────────

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('check-circle'),
  color: text('color').notNull().default('#EBB328'),
  streak: integer('streak').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const habitLogs = sqliteTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
  dateKey: text('date_key').notNull(), // 'YYYY-MM-DD' for deduplication
});

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category', {
    enum: ['personal', 'work', 'health', 'finance', 'other'],
  })
    .notNull()
    .default('personal'),
  isCompleted: integer('is_completed', { mode: 'boolean' })
    .notNull()
    .default(false),
  priority: text('priority', { enum: ['low', 'medium', 'high'] })
    .notNull()
    .default('medium'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
