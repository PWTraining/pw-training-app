"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";

export type Stat = {
  id: string;
  label: string;
  value: string;
  // Fixed unit for this row. The client types the number, the unit stays put.
  unit?: string;
  // Turns the row into a pick-one instead of free text.
  options?: string[];
};

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
  const [pendingRemove, setPendingRemove] = useState<Stat | null>(null);

  function update(id: string, patch: Partial<Stat>) {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function add() {
    // Empty rather than a placeholder dash: a dash has to be deleted before
    // anything can be typed.
    setStats((prev) => [...prev, { id: `row-${Date.now()}`, label: "", value: "" }]);
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
                  placeholder="Name"
                  aria-label="Name"
                  className="min-w-0 flex-1 rounded-[var(--radius-sm)] border px-2 py-1 text-sm outline-none"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                />

                {stat.options ? (
                  <select
                    value={stat.value}
                    onChange={(e) => update(stat.id, { value: e.target.value })}
                    aria-label={`${stat.label} value`}
                    className="w-32 shrink-0 rounded-[var(--radius-sm)] border px-2 py-1 text-sm outline-none"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                  >
                    {stat.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="flex shrink-0 items-center gap-1">
                    <input
                      type="text"
                      inputMode={stat.unit ? "decimal" : "text"}
                      value={stat.value}
                      onChange={(e) => update(stat.id, { value: e.target.value })}
                      aria-label={`${stat.label} value`}
                      className="w-20 rounded-[var(--radius-sm)] border px-2 py-1 text-right text-sm outline-none"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-bg)",
                        color: "var(--color-text)",
                      }}
                    />
                    {stat.unit && (
                      <span
                        className="w-6 text-left text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {stat.unit}
                      </span>
                    )}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setPendingRemove(stat)}
                  aria-label={`Remove ${stat.label || "row"}`}
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
                  {stat.unit}
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

      <ConfirmDialog
        open={!!pendingRemove}
        title="Delete this entry?"
        body={
          pendingRemove?.label
            ? `"${pendingRemove.label}" will be removed.`
            : "This row will be removed."
        }
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          setStats((prev) => prev.filter((s) => s.id !== pendingRemove?.id));
          setPendingRemove(null);
        }}
      />
    </>
  );
}
