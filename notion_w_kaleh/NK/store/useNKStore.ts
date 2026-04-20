/**
 * NK Global Store — Zustand
 * Single source of truth synced with SQLite via Drizzle
 */

import { create } from 'zustand';
import { db } from '../lib/database';
import {
  financeTransactions,
  habits,
  habitLogs,
  tasks,
  type FinanceTransaction,
  type Habit,
  type HabitLog,
  type Task,
} from '../lib/schema';
import { desc, eq, sql } from 'drizzle-orm';

// ─── Helper ──────────────────────────────────────────────────────────────────

const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const todayKey = () => new Date().toISOString().split('T')[0];

// ─── State Types ──────────────────────────────────────────────────────────────

interface NKState {
  // Finance
  transactions: FinanceTransaction[];
  totalBalance: number;
  loadTransactions: () => Promise<void>;
  addTransaction: (
    type: 'income' | 'expense',
    amount: number,
    category: string,
    note?: string
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Habits
  habitList: Habit[];
  habitLogs: HabitLog[];
  loadHabits: () => Promise<void>;
  addHabit: (name: string, icon: string, color: string) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<boolean>; // returns true if just completed
  deleteHabit: (id: string) => Promise<void>;
  isHabitCompletedToday: (habitId: string) => boolean;

  // Tasks
  taskList: Task[];
  loadTasks: () => Promise<void>;
  addTask: (
    title: string,
    category: Task['category'],
    priority: Task['priority']
  ) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // App
  isLoading: boolean;
  loadAll: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNKStore = create<NKState>((set, get) => ({
  // ── Finance ──
  transactions: [],
  totalBalance: 0,

  loadTransactions: async () => {
    const rows = await db.query.financeTransactions.findMany({
      orderBy: [desc(financeTransactions.createdAt)],
    });
    const balance = rows.reduce(
      (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
      0
    );
    set({ transactions: rows, totalBalance: balance });
  },

  addTransaction: async (type, amount, category, note = '') => {
    const newTx = {
      id: uuid(),
      type,
      amount,
      category,
      note,
      createdAt: new Date(),
    };
    await db.insert(financeTransactions).values(newTx);
    await get().loadTransactions();
  },

  deleteTransaction: async (id) => {
    await db.delete(financeTransactions).where(eq(financeTransactions.id, id));
    await get().loadTransactions();
  },

  // ── Habits ──
  habitList: [],
  habitLogs: [],

  loadHabits: async () => {
    const habitRows = await db.query.habits.findMany({
      orderBy: [desc(habits.createdAt)],
    });
    const logRows = await db.query.habitLogs.findMany();
    set({ habitList: habitRows, habitLogs: logRows });
  },

  addHabit: async (name, icon, color) => {
    await db.insert(habits).values({
      id: uuid(),
      name,
      icon,
      color,
      streak: 0,
      createdAt: new Date(),
    });
    await get().loadHabits();
  },

  toggleHabit: async (habitId) => {
    const today = todayKey();
    const existing = get().habitLogs.find(
      (l) => l.habitId === habitId && l.dateKey === today
    );

    if (existing) {
      // Uncheck — remove log
      await db.delete(habitLogs).where(eq(habitLogs.id, existing.id));
      await get().loadHabits();
      return false;
    } else {
      // Check — add log and update streak
      await db.insert(habitLogs).values({
        id: uuid(),
        habitId,
        completedAt: new Date(),
        dateKey: today,
      });
      // Recalculate streak (simple: count consecutive days)
      await db
        .update(habits)
        .set({ streak: sql`${habits.streak} + 1` })
        .where(eq(habits.id, habitId));
      await get().loadHabits();
      return true;
    }
  },

  deleteHabit: async (id) => {
    await db.delete(habits).where(eq(habits.id, id));
    await get().loadHabits();
  },

  isHabitCompletedToday: (habitId) => {
    const today = todayKey();
    return get().habitLogs.some(
      (l) => l.habitId === habitId && l.dateKey === today
    );
  },

  // ── Tasks ──
  taskList: [],

  loadTasks: async () => {
    const rows = await db.query.tasks.findMany({
      orderBy: [desc(tasks.createdAt)],
    });
    set({ taskList: rows });
  },

  addTask: async (title, category, priority) => {
    await db.insert(tasks).values({
      id: uuid(),
      title,
      category,
      priority,
      isCompleted: false,
      createdAt: new Date(),
    });
    await get().loadTasks();
  },

  toggleTask: async (id) => {
    const task = get().taskList.find((t) => t.id === id);
    if (!task) return;
    await db
      .update(tasks)
      .set({ isCompleted: !task.isCompleted })
      .where(eq(tasks.id, id));
    await get().loadTasks();
  },

  deleteTask: async (id) => {
    await db.delete(tasks).where(eq(tasks.id, id));
    await get().loadTasks();
  },

  // ── App ──
  isLoading: true,

  loadAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().loadTransactions(),
      get().loadHabits(),
      get().loadTasks(),
    ]);
    set({ isLoading: false });
  },
}));
