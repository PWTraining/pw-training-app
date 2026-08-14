"use client";

import { useEffect, useState } from "react";

export type Stat = { id: string; label: string; value: string };

// Rows on the Profile sub-pages are the client's own, so they persist per
// page key alongside the rest of the app's local state.
function useStoredStats(storageKey: string, defaults: Stat[]) {
  const [stats, setStats] = useState<Stat[]>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setStats(JSON.parse(stored) as Stat[]);
    } catch {
      // Corrupt or unavailable storage just falls back to the defaults.
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(stats));
  }, [stats, hydrated, storageKey]);

  return [stats, setStats] as const;
}

export function EditableStats({
  storageKey,
  defaults,
  addLabel = "+ Add",
}: {
  storageKey: string;
  defaults: Stat[];
  addLabel?: string;
}) {
  const [stats, setStats] = useStoredStats(storageKey, defaults);
  const [editing, setEditing] = useState(false);

  function update(id: string, patch: Partial<Stat>) {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function remove(id: string) {
    setStats((prev) => prev.filter((s) => s.id !== id));
  }

  function add() {
    setStats((prev) => [
      ...prev,
      { id: `row-${Date.now()}`, label: "New entry", value: "—" },
    ]);
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="rounded-full px-2 py-1 text-xs font-semibold"
          style={{ color: "var(--color-brand)" }}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>

      <section
        className="overflow-hidden rounded-[var(--radius-lg)] border"
        style={{ borderColor: "var(--color-border)" }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.id}
            className="flex items-center gap-2 px-4 py-2.5"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-border)" }}
          >
            {editing ? (
              <>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => update(stat.id, { label: e.target.value })}
                  aria-label="Name"
                  className="min-w-0 flex-1 rounded-[var(--radius-sm)] border px-2 py-1 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                />
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => update(stat.id, { value: e.target.value })}
                  aria-label={`${stat.label} value`}
                  className="w-28 shrink-0 rounded-[var(--radius-sm)] border px-2 py-1 text-right text-sm outline-none"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => remove(stat.id)}
                  aria-label={`Remove ${stat.label}`}
                  className="shrink-0 px-1 text-lg"
                  style={{ color: "var(--color-danger)" }}
                >
                  &times;
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm" style={{ color: "var(--color-text)" }}>
                  {stat.label}
                </span>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: "var(--color-text)" }}
                >
                  {stat.value}
                </span>
              </>
            )}
          </div>
        ))}

        {stats.length === 0 && (
          <p className="px-4 py-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Nothing here yet. Tap Edit, then add your first entry.
          </p>
        )}
      </section>

      {editing && (
        <button
          type="button"
          onClick={add}
          className="rounded-[var(--radius-md)] border py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
        >
          {addLabel}
        </button>
      )}
    </>
  );
}
