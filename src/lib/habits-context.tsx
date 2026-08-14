"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_HABITS, MOCK_BLOCK, MOCK_COMMENTS, TODAY_INDEX, type Habit } from "./habits";

const HABITS_KEY = "pw-habits";
const HISTORY_KEY = "pw-habit-history";
const COMMENTS_KEY = "pw-habit-comments";
const DAY_COMMENT_KEY = "pw-day-comment";
const TODAY_VALUES_KEY = "pw-today-values";
const DAY_VALUES_KEY = "pw-day-values";
const REFLECTIONS_KEY = "pw-day-reflections";
const PHOTOS_KEY = "pw-day-photos";
const CLOSED_KEY = "pw-closed-days";

export type HabitHistoryEntry = {
  action: "added" | "archived" | "restored" | "renamed";
  label: string;
  at: string;
};

export type StoredComment = { day: number; text: string; at: string };

type CommentsByHabit = Record<string, StoredComment[]>;
type TodayValues = Record<string, number>;

// Values the client has actually logged, keyed habit -> day index. Only days
// they've touched appear here; anything absent falls back to the mock block
// history, so this is an override layer rather than a replacement for it.
type DayValues = Record<string, Record<number, number>>;

// One free-text reflection per day of the block.
type Reflections = Record<number, string>;

// A moment the client captured on a given day. `src` is a downscaled data
// URL — see moments.tsx for why they're shrunk before they get here.
export type DayPhoto = { id: string; src: string; caption: string };

type PhotosByDay = Record<number, DayPhoto[]>;

// Days the client has finished and put away. Today starts open; earlier
// days are closed unless they've reopened one to correct it.
type ClosedDays = Record<number, boolean>;

export const MAX_PHOTOS_PER_DAY = 3;

// Everything a single undo step needs to put back.
type Snapshot = {
  habits: Habit[];
  comments: CommentsByHabit;
  dayValues: DayValues;
  reflections: Reflections;
  photos: PhotosByDay;
};

const UNDO_LIMIT = 40;

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

const DEFAULT_DAY_VALUES: DayValues = Object.fromEntries(
  Object.entries(DEFAULT_TODAY_VALUES).map(([id, value]) => [id, { [TODAY_INDEX]: value }]),
);

type HabitsContextValue = {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
  renameHabit: (id: string, label: string) => void;
  setHabitEmoji: (id: string, emoji: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  history: HabitHistoryEntry[];
  commentFor: (habitId: string, day?: number) => string;
  commentsFor: (habitId: string) => StoredComment[];
  hasComments: (habitId: string) => boolean;
  setComment: (habitId: string, text: string, day?: number) => void;
  reflectionFor: (day?: number) => string;
  setReflection: (text: string, day?: number) => void;
  todayValue: (habitId: string) => number;
  setTodayValue: (habitId: string, value: number) => void;
  dayValue: (habitId: string, day: number) => number;
  setDayValue: (habitId: string, day: number, value: number) => void;
  isDayLogged: (day: number) => boolean;
  isDayClosed: (day: number) => boolean;
  setDayClosed: (day: number, closed: boolean) => void;
  photosFor: (day: number) => DayPhoto[];
  addPhotos: (day: number, photos: DayPhoto[]) => void;
  removePhoto: (day: number, id: string) => void;
  setPhotoCaption: (day: number, id: string, caption: string) => void;
  undo: () => void;
  canUndo: boolean;
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

// A day the client has logged wins; otherwise fall back to the mock block
// history so untouched days keep reading as they always have.
function readDayValue(dayValues: DayValues, habitId: string, day: number) {
  return dayValues[habitId]?.[day] ?? MOCK_BLOCK[habitId]?.[day] ?? 0;
}

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [history, setHistory] = useState<HabitHistoryEntry[]>([]);
  const [comments, setComments] = useState<CommentsByHabit>(DEFAULT_COMMENTS);
  const [dayValues, setDayValues] = useState<DayValues>(DEFAULT_DAY_VALUES);
  const [reflections, setReflections] = useState<Reflections>({});
  const [photos, setPhotos] = useState<PhotosByDay>({});
  const [closedDays, setClosedDays] = useState<ClosedDays>({});
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Dragging a slider fires a change per step; without this every step would
  // become its own undo, so consecutive edits to the same thing collapse
  // into the one snapshot taken before the first of them.
  const lastActionKey = useRef<string | null>(null);

  useEffect(() => {
    const storedHabits = loadJSON(HABITS_KEY, DEFAULT_HABITS);
    const storedHistory = loadJSON(HISTORY_KEY, [] as HabitHistoryEntry[]);
    const storedComments = loadJSON(COMMENTS_KEY, DEFAULT_COMMENTS);
    // Older builds stored a single value per habit under TODAY_VALUES_KEY.
    // Fold those into day-keyed storage at today's index so an existing
    // client doesn't lose the day they'd already logged.
    const legacyToday: TodayValues = loadJSON(TODAY_VALUES_KEY, DEFAULT_TODAY_VALUES);
    const storedDayValues = loadJSON(DAY_VALUES_KEY, null as DayValues | null);
    const mergedDayValues =
      storedDayValues ??
      Object.fromEntries(
        Object.entries({ ...DEFAULT_TODAY_VALUES, ...legacyToday }).map(([id, value]) => [
          id,
          { [TODAY_INDEX]: value },
        ]),
      );

    // The single global reflection older builds kept becomes today's entry.
    const legacyReflection = loadJSON(DAY_COMMENT_KEY, "");
    const storedReflections = loadJSON(REFLECTIONS_KEY, null as Reflections | null);
    const mergedReflections =
      storedReflections ?? (legacyReflection ? { [TODAY_INDEX]: legacyReflection } : {});

    const storedPhotos = loadJSON(PHOTOS_KEY, {} as PhotosByDay);
    const storedClosed = loadJSON(CLOSED_KEY, {} as ClosedDays);

    Promise.resolve().then(() => {
      setHabits(storedHabits);
      setPhotos(storedPhotos);
      setClosedDays(storedClosed);
      setHistory(storedHistory);
      setComments(storedComments);
      setDayValues(mergedDayValues);
      setReflections(mergedReflections);
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
    window.localStorage.setItem(DAY_VALUES_KEY, JSON.stringify(dayValues));
  }, [dayValues, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections));
  }, [reflections, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    } catch {
      // Photos are the one thing here big enough to hit the storage quota.
      // Failing to persist beats throwing mid-render; see moments.tsx.
    }
  }, [photos, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CLOSED_KEY, JSON.stringify(closedDays));
  }, [closedDays, hydrated]);

  const value = useMemo<HabitsContextValue>(() => {
    // Snapshot the state as it is before a change lands, so undo restores
    // exactly what was on screen a moment ago.
    function remember(coalesceKey?: string) {
      if (coalesceKey && lastActionKey.current === coalesceKey) return;
      lastActionKey.current = coalesceKey ?? null;
      setUndoStack((prev) =>
        [...prev, { habits, comments, dayValues, reflections, photos }].slice(-UNDO_LIMIT),
      );
    }

    // Sliders deliberately sit outside undo: they're a drag away from any
    // other value, so recording them would only bury the changes that are
    // actually awkward to redo by hand.
    function writeDayValue(habitId: string, day: number, val: number) {
      setDayValues((prev) => ({ ...prev, [habitId]: { ...(prev[habitId] ?? {}), [day]: val } }));
    }

    return {
      habits,
      addHabit: (habit) => {
        if (habits.some((h) => h.id === habit.id)) return;
        remember();
        setHabits((prev) => [...prev, habit]);
        setHistory((prev) => [
          ...prev,
          { action: "added", label: habit.label, at: new Date().toISOString() },
        ]);
      },
      archiveHabit: (id) => {
        const target = habits.find((h) => h.id === id);
        if (!target) return;
        remember();
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, archived: true } : h)));
        setHistory((prev) => [
          ...prev,
          { action: "archived", label: target.label, at: new Date().toISOString() },
        ]);
      },
      restoreHabit: (id) => {
        const target = habits.find((h) => h.id === id);
        if (!target) return;
        remember();
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, archived: false } : h)));
        setHistory((prev) => [
          ...prev,
          { action: "restored", label: target.label, at: new Date().toISOString() },
        ]);
      },
      renameHabit: (id, label) => {
        const trimmed = label.trim();
        if (!trimmed) return;
        if (habits.find((h) => h.id === id)?.label === trimmed) return;
        remember(`rename:${id}`);
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, label: trimmed } : h)));
        setHistory((prev) => [
          ...prev,
          { action: "renamed", label: trimmed, at: new Date().toISOString() },
        ]);
      },
      setHabitEmoji: (id, emoji) => {
        remember(`emoji:${id}`);
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, emoji } : h)));
      },
      // Takes the new order for a subset of habits (the active ones being
      // dragged) and reconciles it against the full list, leaving anything
      // not included (e.g. archived habits) in place at the end.
      reorderHabits: (orderedIds) => {
        remember("reorder");
        setHabits((prev) => {
          const byId = new Map(prev.map((h) => [h.id, h]));
          const reordered = orderedIds.map((id) => byId.get(id)).filter((h): h is Habit => !!h);
          const remaining = prev.filter((h) => !orderedIds.includes(h.id));
          return [...reordered, ...remaining];
        });
      },
      history,
      // One comment per habit per day — writing again replaces it rather
      // than stacking a second note underneath.
      commentFor: (habitId, day = TODAY_INDEX) =>
        comments[habitId]?.find((c) => c.day === day)?.text ?? "",
      commentsFor: (habitId) => comments[habitId] ?? [],
      hasComments: (habitId) => (comments[habitId]?.length ?? 0) > 0,
      setComment: (habitId, text, day = TODAY_INDEX) => {
        remember();
        const trimmed = text.trim();
        setComments((prev) => {
          const rest = (prev[habitId] ?? []).filter((c) => c.day !== day);
          const next = trimmed
            ? [...rest, { day, text: trimmed, at: new Date().toISOString() }]
            : rest;
          return { ...prev, [habitId]: next };
        });
      },
      reflectionFor: (day = TODAY_INDEX) => reflections[day] ?? "",
      setReflection: (text, day = TODAY_INDEX) => {
        remember();
        setReflections((prev) => ({ ...prev, [day]: text.trim() }));
      },
      todayValue: (habitId) => readDayValue(dayValues, habitId, TODAY_INDEX),
      setTodayValue: (habitId, val) => writeDayValue(habitId, TODAY_INDEX, val),
      dayValue: (habitId, day) => readDayValue(dayValues, habitId, day),
      setDayValue: (habitId, day, val) => writeDayValue(habitId, day, val),
      isDayLogged: (day) => Object.values(dayValues).some((byDay) => byDay[day] !== undefined),
      // Today stays open; anything earlier is put away unless reopened.
      isDayClosed: (day) => closedDays[day] ?? day < TODAY_INDEX,
      setDayClosed: (day, closed) => setClosedDays((prev) => ({ ...prev, [day]: closed })),
      photosFor: (day) => photos[day] ?? [],
      addPhotos: (day, next) => {
        remember();
        setPhotos((prev) => ({
          ...prev,
          [day]: [...(prev[day] ?? []), ...next].slice(0, MAX_PHOTOS_PER_DAY),
        }));
      },
      removePhoto: (day, id) => {
        remember();
        setPhotos((prev) => ({ ...prev, [day]: (prev[day] ?? []).filter((p) => p.id !== id) }));
      },
      setPhotoCaption: (day, id, caption) => {
        remember(`caption:${day}:${id}`);
        setPhotos((prev) => ({
          ...prev,
          [day]: (prev[day] ?? []).map((p) => (p.id === id ? { ...p, caption } : p)),
        }));
      },
      canUndo: undoStack.length > 0,
      undo: () => {
        const previous = undoStack[undoStack.length - 1];
        if (!previous) return;
        lastActionKey.current = null;
        setHabits(previous.habits);
        setComments(previous.comments);
        setDayValues(previous.dayValues);
        setReflections(previous.reflections);
        setPhotos(previous.photos);
        setUndoStack((prev) => prev.slice(0, -1));
      },
    };
  }, [habits, history, comments, dayValues, reflections, photos, closedDays, undoStack]);

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within a HabitsProvider");
  return ctx;
}
