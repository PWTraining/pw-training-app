"use client";

import { useState } from "react";
import { useHabits } from "@/lib/habits-context";
import type { Habit } from "@/lib/habits";

// Small hand-picked set rather than a full emoji keyboard — these cover the
// habit types in the catalogue and keep the picker to two thumb-sized rows.
const EMOJI_CHOICES = [
  "🥗", "🎯", "💧", "☀️", "📱", "🏋", "🏃", "🧘",
  "😴", "📖", "🧠", "☮️", "🚶", "🥦", "💊", "✍️",
];

// Edit mode for the Home check-in list: reorder, rename, change the emoji,
// or take a habit off the list. Archiving rather than deleting keeps the
// habit's history intact, see the Archive section on Progress.
export function HabitEditor({ habits, onDone }: { habits: Habit[]; onDone: () => void }) {
  const { reorderHabits, renameHabit, setHabitEmoji, archiveHabit } = useHabits();
  const [emojiOpenFor, setEmojiOpenFor] = useState<string | null>(null);

  const ids = habits.map((h) => h.id);

  function move(index: number, delta: number) {
    const next = [...ids];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorderHabits(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {habits.map((habit, i) => (
        <div
          key={habit.id}
          className="rounded-[var(--radius-md)] border p-2.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEmojiOpenFor(emojiOpenFor === habit.id ? null : habit.id)}
              aria-label={`Change icon for ${habit.label}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl"
              style={{ background: "var(--color-bg)" }}
            >
              {habit.emoji}
            </button>

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

            <div className="flex shrink-0 flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${habit.label} up`}
                className="px-1.5 text-xs leading-tight disabled:opacity-25"
                style={{ color: "var(--color-text)" }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === habits.length - 1}
                aria-label={`Move ${habit.label} down`}
                className="px-1.5 text-xs leading-tight disabled:opacity-25"
                style={{ color: "var(--color-text)" }}
              >
                ▼
              </button>
            </div>

            <button
              type="button"
              onClick={() => archiveHabit(habit.id)}
              aria-label={`Remove ${habit.label}`}
              className="shrink-0 px-1.5 text-lg"
              style={{ color: "var(--color-danger)" }}
            >
              &times;
            </button>
          </div>

          {emojiOpenFor === habit.id && (
            <div className="mt-2 flex flex-wrap gap-1">
              {EMOJI_CHOICES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setHabitEmoji(habit.id, emoji);
                    setEmojiOpenFor(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
                  style={{
                    background:
                      habit.emoji === emoji
                        ? "color-mix(in srgb, var(--color-brand) 18%, transparent)"
                        : "var(--color-bg)",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

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
