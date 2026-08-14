"use client";

import { useHabits } from "@/lib/habits-context";

// Steps back through anything logged or edited — a slider, a comment, a
// rename, an archive. Hidden until there is something to undo so it never
// sits there dead.
export function UndoButton({ label = "Undo" }: { label?: string }) {
  const { undo, canUndo } = useHabits();

  if (!canUndo) return null;

  return (
    <button
      type="button"
      onClick={undo}
      aria-label={label}
      title={label}
      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
      style={{ color: "var(--color-brand)" }}
    >
      <span aria-hidden>↺</span>
      {label}
    </button>
  );
}
