"use client";

import { useEffect, useState } from "react";
import { useDailyLog, todayKey } from "@/lib/daily-log";

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function WeightTracker() {
  const { hydrated, entryFor, write, previousWeight } = useDailyLog();
  const key = todayKey();
  const saved = entryFor(key).weightKg ?? "";
  const previous = previousWeight(key);

  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const change =
    saved && previous ? Number(saved) - Number(previous.weightKg) : null;
  const showForm = editing || !saved;

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <span className="text-base leading-none" aria-hidden>
            ⚖️
          </span>
          Weight
        </h2>
        {saved && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full px-2 py-1 text-xs font-semibold"
            style={{ color: "var(--color-brand)" }}
          >
            Edit
          </button>
        )}
      </div>

      {hydrated && showForm ? (
        <div className="flex items-center gap-2">
          <span className="flex flex-1 items-center gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="0.0"
              aria-label="Weight in kilograms"
              className="w-24 rounded-[var(--radius-sm)] border px-3 py-2.5 text-lg font-bold tabular-nums outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              kg
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              write(key, { weightKg: draft.trim() });
              setEditing(false);
            }}
            disabled={!draft.trim() && !saved}
            className="rounded-[var(--radius-sm)] px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
            {saved}
            <span className="text-base font-semibold"> kg</span>
          </span>
          {change !== null && Number.isFinite(change) && previous && (
            <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
              {change > 0 ? "+" : ""}
              {change.toFixed(1)} kg since {prettyDate(previous.date)}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
