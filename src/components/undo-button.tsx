"use client";

import { useHabits } from "@/lib/habits-context";

// Steps back through anything awkward to redo by hand — a rename, a
// reorder, an archive, a comment, a photo. Sliders are excluded on purpose;
// they're a drag away from any other value.
export function UndoButton() {
  const { undo, canUndo } = useHabits();

  return (
    <button
      type="button"
      onClick={undo}
      disabled={!canUndo}
      aria-label="Undo the last change"
      title="Undo the last change"
      className="flex h-7 w-7 items-center justify-center rounded-full text-base disabled:opacity-30"
      style={{ color: "var(--color-brand)" }}
    >
      <span aria-hidden>↺</span>
    </button>
  );
}
