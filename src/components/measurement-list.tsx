"use client";

import { useEffect, useRef, useState } from "react";
import type { Stat } from "./editable-stats";

// Measurements come from a fixed set so every client's numbers mean the same
// thing. They choose which ones to keep and what order to keep them in; the
// rest sit parked below and can be brought back at any time.
type Stored = { order: string[]; parked: string[]; values: Record<string, string> };

function load(storageKey: string, catalogue: Stat[]): Stored {
  const fallback: Stored = {
    order: catalogue.map((s) => s.id),
    parked: [],
    values: Object.fromEntries(catalogue.map((s) => [s.id, s.value])),
  };

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const known = new Set(catalogue.map((s) => s.id));
    const order = (parsed.order ?? []).filter((id) => known.has(id));
    const parked = (parsed.parked ?? []).filter((id) => known.has(id));
    // Anything added to the catalogue since they last looked joins the list
    // rather than disappearing.
    const seen = new Set([...order, ...parked]);
    const missing = catalogue.map((s) => s.id).filter((id) => !seen.has(id));
    return {
      order: [...order, ...missing],
      parked,
      values: { ...fallback.values, ...(parsed.values ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function MeasurementList({
  storageKey,
  catalogue,
}: {
  storageKey: string;
  catalogue: Stat[];
}) {
  const byId = new Map(catalogue.map((s) => [s.id, s]));
  const [state, setState] = useState<Stored>({ order: [], parked: [], values: {} });
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setState(load(storageKey, catalogue));
    setHydrated(true);
    // Catalogue is a module constant, so this runs once per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Values still hold for this visit.
    }
  }, [state, hydrated, storageKey]);

  const rows = useRef<Map<string, HTMLElement>>(new Map());

  function setValue(id: string, value: string) {
    setState((prev) => ({ ...prev, values: { ...prev.values, [id]: value } }));
  }

  function park(id: string) {
    setState((prev) => ({
      ...prev,
      order: prev.order.filter((x) => x !== id),
      parked: [...prev.parked, id],
    }));
  }

  function restore(id: string) {
    setState((prev) => ({
      ...prev,
      parked: prev.parked.filter((x) => x !== id),
      order: [...prev.order, id],
    }));
  }

  // Drag to reorder, matching how habits are reordered on the check-in.
  function onDragMove(e: React.PointerEvent) {
    if (!draggingId) return;
    const overId = [...rows.current.entries()].find(([, el]) => {
      const box = el.getBoundingClientRect();
      return e.clientY >= box.top && e.clientY <= box.bottom;
    })?.[0];

    if (!overId || overId === draggingId) return;
    setState((prev) => {
      const next = [...prev.order];
      const from = next.indexOf(draggingId);
      const to = next.indexOf(overId);
      if (from < 0 || to < 0) return prev;
      next.splice(to, 0, next.splice(from, 1)[0]);
      return { ...prev, order: next };
    });
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
        {state.order.map((id, i) => {
          const stat = byId.get(id);
          if (!stat) return null;

          return (
            <div
              key={id}
              ref={(el) => {
                if (el) rows.current.set(id, el);
                else rows.current.delete(id);
              }}
              className="flex items-center gap-2 px-3 py-2.5"
              style={{
                borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                background: draggingId === id ? "var(--color-surface-raised)" : "transparent",
              }}
            >
              {editing && (
                <span
                  onPointerDown={(e) => {
                    setDraggingId(id);
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      // Capture unavailable; the drag flag still works.
                    }
                  }}
                  onPointerMove={onDragMove}
                  onPointerUp={() => setDraggingId(null)}
                  onPointerCancel={() => setDraggingId(null)}
                  role="button"
                  aria-label={`Reorder ${stat.label}`}
                  className="flex h-9 w-6 shrink-0 cursor-grab items-center justify-center text-base"
                  style={{ color: "var(--color-text-muted)", touchAction: "none" }}
                >
                  ⠿
                </span>
              )}

              <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--color-text)" }}>
                {stat.label}
              </span>

              {editing ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={state.values[id] ?? ""}
                  onChange={(e) => setValue(id, e.target.value)}
                  aria-label={`${stat.label} value`}
                  className="w-20 shrink-0 rounded-[var(--radius-sm)] border px-2 py-1 text-right text-sm outline-none"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                  }}
                />
              ) : (
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: "var(--color-text)" }}
                >
                  {state.values[id]}
                </span>
              )}

              {/* The unit belongs to the measurement, not to the client, so
                  it's fixed text rather than a field. */}
              <span
                className="w-8 shrink-0 text-left text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                {stat.unit}
              </span>

              {editing && (
                <button
                  type="button"
                  onClick={() => park(id)}
                  aria-label={`Remove ${stat.label}`}
                  className="shrink-0 px-1 text-lg"
                  style={{ color: "var(--color-danger)" }}
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}

        {state.order.length === 0 && (
          <p className="px-4 py-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Nothing here. Add one back from the list below.
          </p>
        )}
      </section>

      {state.parked.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Not tracking
          </h2>
          <div
            className="overflow-hidden rounded-[var(--radius-lg)] border"
            style={{ borderColor: "var(--color-border)" }}
          >
            {state.parked.map((id, i) => {
              const stat = byId.get(id);
              if (!stat) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-border)" }}
                >
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {stat.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => restore(id)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold"
                    style={{ color: "var(--color-brand)" }}
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
