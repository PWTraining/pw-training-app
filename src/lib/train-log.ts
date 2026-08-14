"use client";

import { useCallback, useEffect, useState } from "react";
import { WEEKLY_SESSION_PLAN } from "./train-schedule";

const LOG_KEY = "pw-train-log";

export type SetLog = { weight: string; reps: string; done: boolean };

export type Exercise = {
  id: string;
  name: string;
  target: string;
  lastSession: string;
  demoUrl?: string;
  setCount: number;
};

// Mock programming. A real backend would return the coach's prescription for
// this specific date; the shape here is what the session screen renders.
const SESSION_EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Back Squat",
    target: "4 x 6 @ RPE 8",
    lastSession: "last: 80kg x 6, 82.5kg x 6",
    demoUrl: "https://youtube.com",
    setCount: 4,
  },
  {
    id: "bench",
    name: "Flat Bench Press",
    target: "4 x 8 @ RPE 8",
    lastSession: "last: 60kg x 8, 60kg x 7",
    demoUrl: "https://youtube.com",
    setCount: 4,
  },
  {
    id: "row",
    name: "Chest Supported Row",
    target: "3 x 10",
    lastSession: "last: 24kg x 10",
    setCount: 3,
  },
];

export function exercisesForDate(date: Date): Exercise[] {
  return WEEKLY_SESSION_PLAN[date.getDay()] ? SESSION_EXERCISES : [];
}

// One recorded session: the sets the client typed in, plus whether they've
// finished and put it away.
export type SessionLog = {
  sets: Record<string, SetLog[]>;
  saved: boolean;
};

type LogStore = Record<string, SessionLog>;

function emptySets(exercises: Exercise[]): Record<string, SetLog[]> {
  return Object.fromEntries(
    exercises.map((ex) => [
      ex.id,
      Array.from({ length: ex.setCount }, () => ({ weight: "", reps: "", done: false })),
    ]),
  );
}

function readStore(): LogStore {
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as LogStore) : {};
  } catch {
    return {};
  }
}

// Sessions are read straight from storage rather than held in a provider:
// only two screens need them, and each remounts on navigation, so there's
// nothing to keep in sync between them.
export function useTrainLog() {
  const [store, setStore] = useState<LogStore>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(readStore());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LOG_KEY, JSON.stringify(store));
    } catch {
      // Storage full or blocked. The screen still works for this visit.
    }
  }, [store, hydrated]);

  const sessionFor = useCallback(
    (key: string, exercises: Exercise[]): SessionLog => {
      const stored = store[key];
      if (!stored) return { sets: emptySets(exercises), saved: false };
      // Programming can change under a half-logged session, so fill in any
      // exercise that has no rows yet rather than trusting what was saved.
      const sets = { ...emptySets(exercises), ...stored.sets };
      return { sets, saved: stored.saved };
    },
    [store],
  );

  const updateSet = useCallback(
    (key: string, exercises: Exercise[], exerciseId: string, index: number, patch: Partial<SetLog>) => {
      setStore((prev) => {
        const current = prev[key] ?? { sets: emptySets(exercises), saved: false };
        const rows = current.sets[exerciseId] ?? [];
        return {
          ...prev,
          [key]: {
            ...current,
            sets: {
              ...current.sets,
              [exerciseId]: rows.map((s, i) => (i === index ? { ...s, ...patch } : s)),
            },
          },
        };
      });
    },
    [],
  );

  const setSaved = useCallback((key: string, exercises: Exercise[], saved: boolean) => {
    setStore((prev) => {
      const current = prev[key] ?? { sets: emptySets(exercises), saved: false };
      return { ...prev, [key]: { ...current, saved } };
    });
  }, []);

  const isSessionSaved = useCallback((key: string) => store[key]?.saved ?? false, [store]);

  // Any set with a number in it counts as started, so a half-done session
  // reads differently from one that was never opened.
  const isSessionStarted = useCallback(
    (key: string) =>
      Object.values(store[key]?.sets ?? {}).some((rows) =>
        rows.some((s) => s.done || s.weight.trim() !== "" || s.reps.trim() !== ""),
      ),
    [store],
  );

  return { hydrated, sessionFor, updateSet, setSaved, isSessionSaved, isSessionStarted };
}
