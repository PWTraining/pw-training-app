"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_HABITS, MOCK_COMMENTS, TODAY_INDEX, type Habit } from "./habits";

const HABITS_KEY = "pw-habits";
const HISTORY_KEY = "pw-habit-history";
const COMMENTS_KEY = "pw-habit-comments";
const DAY_COMMENT_KEY = "pw-day-comment";
const TODAY_VALUES_KEY = "pw-today-values";

export type HabitHistoryEntry = {
  action: "added" | "archived" | "restored" | "renamed";
  label: string;
  at: string;
};

export type StoredComment = { day: number; text: string; at: string };

type CommentsByHabit = Record<string, StoredComment[]>;
type TodayValues = Record<string, number>;

const DEFAULT_COMMENTS: CommentsByHabit = Object.fromEntries(
  Object.entries(MOCK_COMMENTS).map(([id, comments]) => [
    id,
    comments.map((c) => ({ ...c, at: new Date().toISOString() })),
  ]),
);

const DEFAULT_TODAY_VALUES: TodayValues = {
  meals: 100,
  protein: 0,
  hydration: 50,
  light: 0,
  phone: 0,
  physical: 70,
  mind: 70,
  spirit: 80,
  training: 80,
  cardio: 60,
};

type HabitsContextValue = {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
  renameHabit: (id: string, label: string) => void;
  setHabitEmoji: (id: string, emoji: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  history: HabitHistoryEntry[];
  commentsFor: (habitId: string) => StoredComment[];
  hasComments: (habitId: string) => boolean;
  addComment: (habitId: string, text: string) => void;
  dayComment: string;
  setDayComment: (text: string) => void;
  todayValue: (habitId: string) => number;
  setTodayValue: (habitId: string, value: number) => void;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [history, setHistory] = useState<HabitHistoryEntry[]>([]);
  const [comments, setComments] = useState<CommentsByHabit>(DEFAULT_COMMENTS);
  const [dayComment, setDayComment] = useState("");
  const [todayValues, setTodayValues] = useState<TodayValues>(DEFAULT_TODAY_VALUES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedHabits = loadJSON(HABITS_KEY, DEFAULT_HABITS);
    const storedHistory = loadJSON(HISTORY_KEY, [] as HabitHistoryEntry[]);
    const storedComments = loadJSON(COMMENTS_KEY, DEFAULT_COMMENTS);
    const storedDayComment = loadJSON(DAY_COMMENT_KEY, "");
    const storedTodayValues = {
      ...DEFAULT_TODAY_VALUES,
      ...loadJSON(TODAY_VALUES_KEY, DEFAULT_TODAY_VALUES),
    };
    Promise.resolve().then(() => {
      setHabits(storedHabits);
      setHistory(storedHistory);
      setComments(storedComments);
      setDayComment(storedDayComment);
      setTodayValues(storedTodayValues);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }, [comments, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DAY_COMMENT_KEY, JSON.stringify(dayComment));
  }, [dayComment, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(TODAY_VALUES_KEY, JSON.stringify(todayValues));
  }, [todayValues, hydrated]);

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      addHabit: (habit) => {
        if (habits.some((h) => h.id === habit.id)) return;
        setHabits((prev) => [...prev, habit]);
        setHistory((prev) => [
          ...prev,
          { action: "added", label: habit.label, at: new Date().toISOString() },
        ]);
      },
      archiveHabit: (id) => {
        const target = habits.find((h) => h.id === id);
        if (!target) return;
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, archived: true } : h)));
        setHistory((prev) => [
          ...prev,
          { action: "archived", label: target.label, at: new Date().toISOString() },
        ]);
      },
      restoreHabit: (id) => {
        const target = habits.find((h) => h.id === id);
        if (!target) return;
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, archived: false } : h)));
        setHistory((prev) => [
          ...prev,
          { action: "restored", label: target.label, at: new Date().toISOString() },
        ]);
      },
      renameHabit: (id, label) => {
        const trimmed = label.trim();
        if (!trimmed) return;
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, label: trimmed } : h)));
        setHistory((prev) => [
          ...prev,
          { action: "renamed", label: trimmed, at: new Date().toISOString() },
        ]);
      },
      setHabitEmoji: (id, emoji) => {
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, emoji } : h)));
      },
      // Takes the new order for a subset of habits (the active ones being
      // dragged) and reconciles it against the full list, leaving anything
      // not included (e.g. archived habits) in place at the end.
      reorderHabits: (orderedIds) => {
        setHabits((prev) => {
          const byId = new Map(prev.map((h) => [h.id, h]));
          const reordered = orderedIds
            .map((id) => byId.get(id))
            .filter((h): h is Habit => !!h);
          const remaining = prev.filter((h) => !orderedIds.includes(h.id));
          return [...reordered, ...remaining];
        });
      },
      history,
      commentsFor: (habitId) => comments[habitId] ?? [],
      hasComments: (habitId) => (comments[habitId]?.length ?? 0) > 0,
      addComment: (habitId, text) => {
        setComments((prev) => ({
          ...prev,
          [habitId]: [
            ...(prev[habitId] ?? []),
            { day: TODAY_INDEX, text, at: new Date().toISOString() },
          ],
        }));
      },
      dayComment,
      setDayComment,
      todayValue: (habitId) => todayValues[habitId] ?? 0,
      setTodayValue: (habitId, val) => setTodayValues((prev) => ({ ...prev, [habitId]: val })),
    }),
    [habits, history, comments, dayComment, todayValues],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within a HabitsProvider");
  return ctx;
}
