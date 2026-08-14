"use client";

import { useState } from "react";
import { TODAY_INDEX } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

// One free-text reflection per day. Reads as plain text once written, and
// says so plainly when a day has none, rather than showing an empty box.
export function DailyReflection({ day = TODAY_INDEX }: { day?: number }) {
  const { reflectionFor, setReflection } = useHabits();
  const saved = reflectionFor(day);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(saved);

  function startEditing() {
    setDraft(saved);
    setOpen(true);
  }

  function submit() {
    setReflection(draft, day);
    setOpen(false);
  }

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Daily Reflection
        </h2>
        {!open && (
          <button
            type="button"
            onClick={startEditing}
            className="text-xs font-semibold"
            style={{ color: "var(--color-brand)" }}
          >
            {saved ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {open ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Anything to add today?"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              className="rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : saved ? (
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: "var(--color-text)" }}
        >
          {saved}
        </p>
      ) : (
        <p className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>
          No reflection for this day.
        </p>
      )}
    </section>
  );
}
