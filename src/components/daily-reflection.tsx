"use client";

import { useEffect, useState } from "react";
import { TODAY_INDEX } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

// One free-text reflection per day, always open as a plain box so it reads
// the same as the habit comments rather than hiding behind an Add button.
export function DailyReflection({ day = TODAY_INDEX }: { day?: number }) {
  const { reflectionFor, setReflection } = useHabits();
  const saved = reflectionFor(day);

  const [draft, setDraft] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);

  // Moving between days swaps the underlying entry out from under the box.
  useEffect(() => {
    setDraft(saved);
  }, [saved, day]);

  function submit() {
    setReflection(draft, day);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  return (
    <section
      className="rounded-[var(--radius-lg)] border-2 p-4"
      style={{
        borderColor: "color-mix(in srgb, var(--color-brand) 35%, var(--color-border))",
        background: "color-mix(in srgb, var(--color-brand) 5%, var(--color-surface))",
      }}
    >
      <h2
        className="mb-2 flex items-center gap-1.5 text-sm font-bold"
        style={{ color: "var(--color-brand)" }}
      >
        <span aria-hidden>✍️</span> Daily Reflection
      </h2>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Anything to add today?"
        rows={3}
        className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm italic leading-relaxed outline-none"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      />

      <button
        type="button"
        onClick={submit}
        disabled={draft === saved}
        className="mt-2.5 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium disabled:opacity-40"
        style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
      >
        {justSaved ? "Saved" : "Save"}
      </button>
    </section>
  );
}
