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
import { Platform } from 'react-native';

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
    if (Platform.OS === 'web') return;
    const rows = await db.query.financeTransactions.findMany({
      orderBy: [desc(financeTransactions.createdAt)],
    });
    const balance = rows.reduce(
      (acc: number, t: FinanceTransaction) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
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
    if (Platform.OS === 'web') {
      const list = [newTx, ...get().transactions];
      const bal = list.reduce((a: number, t: FinanceTransaction) => t.type === 'income' ? a + t.amount : a - t.amount, 0);
      set({ transactions: list, totalBalance: bal });
      return;
    }
    await db.insert(financeTransactions).values(newTx);
    await get().loadTransactions();
  },

  deleteTransaction: async (id) => {
    if (Platform.OS === 'web') {
      const list = get().transactions.filter(t => t.id !== id);
      const bal = list.reduce((a: number, t: FinanceTransaction) => t.type === 'income' ? a + t.amount : a - t.amount, 0);
      set({ transactions: list, totalBalance: bal });
      return;
    }
    await db.delete(financeTransactions).where(eq(financeTransactions.id, id));
    await get().loadTransactions();
  },

  // ── Habits ──
  habitList: [],
  habitLogs: [],

  loadHabits: async () => {
    if (Platform.OS === 'web') return;
    const habitRows = await db.query.habits.findMany({
      orderBy: [desc(habits.createdAt)],
    });
    const logRows = await db.query.habitLogs.findMany();
    set({ habitList: habitRows, habitLogs: logRows });
  },

  addHabit: async (name, icon, color) => {
    const newHabit = {
      id: uuid(),
      name,
      icon,
      color,
      streak: 0,
      createdAt: new Date(),
    };
    if (Platform.OS === 'web') {
      set({ habitList: [newHabit, ...get().habitList] });
      return;
    }
    await db.insert(habits).values(newHabit);
    await get().loadHabits();
  },

  toggleHabit: async (habitId) => {
    const today = todayKey();
    const existing = get().habitLogs.find(
      (l) => l.habitId === habitId && l.dateKey === today
    );

    if (existing) {
      // Uncheck — remove log
      if (Platform.OS === 'web') {
        set({ habitLogs: get().habitLogs.filter(l => l.id !== existing.id) });
        return false;
      }
      await db.delete(habitLogs).where(eq(habitLogs.id, existing.id));
      await get().loadHabits();
      return false;
    } else {
      // Check — add log and update streak
      const newLog = {
        id: uuid(),
        habitId,
        completedAt: new Date(),
        dateKey: today,
      };
      if (Platform.OS === 'web') {
        set({ habitLogs: [...get().habitLogs, newLog] });
        set({ habitList: get().habitList.map(h => h.id === habitId ? { ...h, streak: h.streak + 1 } : h) });
        return true;
      }
      await db.insert(habitLogs).values(newLog);
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
    if (Platform.OS === 'web') {
      set({ habitList: get().habitList.filter(h => h.id !== id), habitLogs: get().habitLogs.filter(l => l.habitId !== id) });
      return;
    }
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
    if (Platform.OS === 'web') return;
    const rows = await db.query.tasks.findMany({
      orderBy: [desc(tasks.createdAt)],
    });
    set({ taskList: rows });
  },

  addTask: async (title, category, priority) => {
    const newTask = {
      id: uuid(),
      title,
      category,
      priority,
      isCompleted: false,
      createdAt: new Date(),
      dueDate: null,
    };
    if (Platform.OS === 'web') {
      set({ taskList: [newTask, ...get().taskList] });
      return;
    }
    await db.insert(tasks).values(newTask);
    await get().loadTasks();
  },

  toggleTask: async (id) => {
    const task = get().taskList.find((t) => t.id === id);
    if (!task) return;
    if (Platform.OS === 'web') {
      set({ taskList: get().taskList.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t) });
      return;
    }
    await db
      .update(tasks)
      .set({ isCompleted: !task.isCompleted })
      .where(eq(tasks.id, id));
    await get().loadTasks();
  },

  deleteTask: async (id) => {
    if (Platform.OS === 'web') {
      set({ taskList: get().taskList.filter(t => t.id !== id) });
      return;
    }
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
