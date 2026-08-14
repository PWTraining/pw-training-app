"use client";

import { useCallback, useEffect, useState } from "react";

const LOG_KEY = "pw-daily-log";

// Everything tracked once a day that isn't a habit slider. Keyed by real
// calendar date, so each new day starts blank on its own.
export type DailyEntry = {
  weightKg?: string;
  steps?: string;
  sleepHours?: string;
};

type LogStore = Record<string, DailyEntry>;

export function todayKey(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function readStore(): LogStore {
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as LogStore) : {};
  } catch {
    return {};
  }
}

export function useDailyLog() {
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
      // Storage unavailable. Values still hold for this visit.
    }
  }, [store, hydrated]);

  const entryFor = useCallback((key: string): DailyEntry => store[key] ?? {}, [store]);

  const write = useCallback((key: string, patch: Partial<DailyEntry>) => {
    setStore((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), ...patch } }));
  }, []);

  // The most recent day before this one that has a weight on it, which is
  // what any change is measured against.
  const previousWeight = useCallback(
    (key: string): { date: string; weightKg: string } | null => {
      const earlier = Object.entries(store)
        .filter(([date, entry]) => date < key && entry.weightKg?.trim())
        .sort(([a], [b]) => b.localeCompare(a));
      const [date, entry] = earlier[0] ?? [];
      return date && entry?.weightKg ? { date, weightKg: entry.weightKg } : null;
    },
    [store],
  );

  return { hydrated, entryFor, write, previousWeight };
}
