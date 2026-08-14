"use client";

import { useRef, useState } from "react";
import { useHabits } from "@/lib/habits-context";
import type { Habit } from "@/lib/habits";

// Takes whatever the phone's emoji keyboard produced and keeps the last
// whole character, so multi-codepoint emoji (skin tones, flags, ZWJ
// sequences) survive instead of being cut in half.
function lastGrapheme(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const parts = [...segmenter.segment(trimmed)];
    return parts[parts.length - 1]?.segment ?? "";
  }
  const chars = Array.from(trimmed);
  return chars[chars.length - 1] ?? "";
}

// Edit mode for the check-in list: drag to reorder, rename, pick any emoji
// from the phone's own keyboard, or archive. Archiving rather than deleting
// keeps the habit's history intact.
export function HabitEditor({ habits, onDone }: { habits: Habit[]; onDone: () => void }) {
  const { habits: allHabits, reorderHabits, renameHabit, setHabitEmoji, archiveHabit, restoreHabit } =
    useHabits();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  const archived = allHabits.filter((h) => h.archived);
  const ids = habits.map((h) => h.id);

  function handlePointerMove(event: React.PointerEvent) {
    if (!draggingId) return;

    const order = [...ids];
    const from = order.indexOf(draggingId);
    if (from === -1) return;

    // Walk the rows and find the one whose midpoint the finger has crossed.
    let to = from;
    order.forEach((id, index) => {
      const element = rowRefs.current.get(id);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const middle = rect.top + rect.height / 2;
      if (index < from && event.clientY < middle) to = Math.min(to, index);
      if (index > from && event.clientY > middle) to = Math.max(to, index);
    });

    if (to !== from) {
      order.splice(to, 0, order.splice(from, 1)[0]);
      reorderHabits(order);
    }
  }

  return (
    <div className="flex flex-col gap-2" onPointerMove={handlePointerMove}>
      {habits.map((habit) => (
        <div
          key={habit.id}
          ref={(element) => {
            if (element) rowRefs.current.set(habit.id, element);
            else rowRefs.current.delete(habit.id);
          }}
          className="rounded-[var(--radius-md)] border p-2.5"
          style={{
            borderColor:
              draggingId === habit.id ? "var(--color-brand)" : "var(--color-border)",
            background: "var(--color-surface)",
            opacity: draggingId && draggingId !== habit.id ? 0.6 : 1,
            boxShadow: draggingId === habit.id ? "0 6px 16px rgba(0,0,0,0.14)" : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Drag to reorder ${habit.label}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDraggingId(habit.id);
              }}
              onPointerUp={() => setDraggingId(null)}
              onPointerCancel={() => setDraggingId(null)}
              // Stops the page scrolling under the finger mid-drag.
              className="shrink-0 cursor-grab touch-none px-1 text-base leading-none"
              style={{ color: "var(--color-text-muted)" }}
            >
              ⠿
            </button>

            <input
              type="text"
              value={habit.emoji}
              onChange={(e) => {
                const next = lastGrapheme(e.target.value);
                if (next) setHabitEmoji(habit.id, next);
              }}
              aria-label={`Icon for ${habit.label}. Use your emoji keyboard.`}
              className="h-9 w-9 shrink-0 rounded-full border-0 text-center text-xl outline-none"
              style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
            />

            <input
              type="text"
              defaultValue={habit.label}
              onBlur={(e) => renameHabit(habit.id, e.target.value)}
              aria-label={`Rename ${habit.label}`}
              className="min-w-0 flex-1 rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-sm outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />

            <button
              type="button"
              onClick={() => setConfirmingId(habit.id)}
              className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              Archive
            </button>
          </div>

          {confirmingId === habit.id && (
            <div
              className="mt-2 rounded-[var(--radius-sm)] p-2.5"
              style={{ background: "var(--color-bg)" }}
            >
              <p className="text-xs" style={{ color: "var(--color-text)" }}>
                Archive <b>{habit.label}</b>? It drops off your check-in but keeps its history,
                and you can restore it any time.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    archiveHabit(habit.id);
                    setConfirmingId(null);
                  }}
                  className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold"
                  style={{ background: "var(--color-danger)", color: "#fff" }}
                >
                  Archive
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(null)}
                  className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <p className="px-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
        Drag <span aria-hidden>⠿</span> to reorder. Tap an icon and use your emoji keyboard to
        change it.
      </p>

      {archived.length > 0 && (
        <div
          className="rounded-[var(--radius-md)] border"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            type="button"
            onClick={() => setShowArchive((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Archived ({archived.length})
            <span aria-hidden>{showArchive ? "▲" : "▼"}</span>
          </button>

          {showArchive && (
            <div
              className="flex flex-col gap-2 border-t p-2.5"
              style={{ borderColor: "var(--color-border)" }}
            >
              {archived.map((habit) => (
                <div key={habit.id} className="flex items-center gap-2.5">
                  <span className="text-lg leading-none opacity-60" aria-hidden>
                    {habit.emoji}
                  </span>
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {habit.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => restoreHabit(habit.id)}
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ color: "var(--color-brand)" }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="mt-1 rounded-[var(--radius-sm)] py-2 text-sm font-semibold"
        style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
      >
        Done
      </button>
    </div>
  );
}
