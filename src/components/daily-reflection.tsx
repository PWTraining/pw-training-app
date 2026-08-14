"use client";

import { useEffect, useState } from "react";
import { TODAY_INDEX } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

// One free-text reflection per day. Open as a plain box until it's saved,
// then it settles into a finished note with an Edit control rather than
// sitting there looking like unsubmitted work.
export function DailyReflection({ day = TODAY_INDEX }: { day?: number }) {
  const { reflectionFor, setReflection } = useHabits();
  const saved = reflectionFor(day);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);

  // Moving between days swaps the underlying entry out from under the box.
  useEffect(() => {
    setDraft(saved);
    setEditing(false);
  }, [saved, day]);

  const showForm = editing || !saved;

  return (
    <section
      className="rounded-[var(--radius-lg)] border-2 p-4"
      style={{
        borderColor: saved
          ? "color-mix(in srgb, var(--color-success) 45%, transparent)"
          : "color-mix(in srgb, var(--color-brand) 35%, var(--color-border))",
        background: saved
          ? "color-mix(in srgb, var(--color-success) 7%, var(--color-surface))"
          : "color-mix(in srgb, var(--color-brand) 5%, var(--color-surface))",
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: saved ? "var(--color-success)" : "var(--color-brand)" }}
        >
          <span aria-hidden>{saved && !editing ? "✓" : "✍️"}</span> Daily Reflection
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

      {showForm ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Capture what's on your mind today"
            rows={3}
            className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm italic leading-relaxed outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />

          {/* Clearing the text and saving is how a reflection gets deleted,
              so an empty draft is only inert when there's nothing saved to
              clear in the first place. */}
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setReflection(draft, day);
                setEditing(false);
              }}
              disabled={!draft.trim() && !saved}
              className="rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium disabled:opacity-40"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Save
            </button>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setDraft(saved);
                  setEditing(false);
                }}
                className="rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Cancel
              </button>
            )}
          </div>
        </>
      ) : (
        <p
          className="whitespace-pre-wrap text-sm italic leading-relaxed"
          style={{ color: "var(--color-text)" }}
        >
          {saved}
        </p>
      )}
    </section>
  );
}
