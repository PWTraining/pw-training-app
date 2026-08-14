"use client";

import { useCallback, useEffect, useState } from "react";

const LOG_KEY = "pw-daily-log";

export type TrackerId = "weight" | "steps" | "sleep";

// Each tracked number carries its own comment, the same way a habit slider
// does, so the three cards behave identically.
export type TrackerEntry = { value: string; comment: string };

export type DailyEntry = Partial<Record<TrackerId, TrackerEntry>>;

type LogStore = Record<string, DailyEntry>;

const EMPTY: TrackerEntry = { value: "", comment: "" };

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

// Everything tracked once a day that isn't a habit slider, keyed by real
// calendar date so each new day starts blank on its own.
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

  const trackerFor = useCallback(
    (key: string, id: TrackerId): TrackerEntry => store[key]?.[id] ?? EMPTY,
    [store],
  );

  const write = useCallback((key: string, id: TrackerId, patch: Partial<TrackerEntry>) => {
    setStore((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [id]: { ...(prev[key]?.[id] ?? EMPTY), ...patch } },
    }));
  }, []);

  // The most recent earlier day carrying a value, which is what any change is
  // measured against.
  const previousValue = useCallback(
    (key: string, id: TrackerId): { date: string; value: string } | null => {
      const earlier = Object.entries(store)
        .filter(([date, entry]) => date < key && entry[id]?.value.trim())
        .sort(([a], [b]) => b.localeCompare(a));
      const [date, entry] = earlier[0] ?? [];
      const value = entry?.[id]?.value;
      return date && value ? { date, value } : null;
    },
    [store],
  );

  return { hydrated, trackerFor, write, previousValue };
}
