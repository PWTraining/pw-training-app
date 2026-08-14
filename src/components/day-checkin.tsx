"use client";

import { useState } from "react";
import { CheckInRow } from "./checkin-row";
import { HabitEditor } from "./habit-editor";
import { AddHabitSheet } from "./add-habit-sheet";
import { useHabits } from "@/lib/habits-context";
import { TODAY_INDEX, MAX_ACTIVE_HABITS } from "@/lib/habits";

export const MOOD_ENTRIES = [
  { id: "mind", emoji: "🧠", label: "Mind" },
  { id: "physical", emoji: "💪", label: "Body" },
  { id: "spirit", emoji: "☮️", label: "Spirit" },
] as const;

// The check-in controls, shared verbatim between Home (today) and the
// Progress day view (any past day) so the two can't drift apart.
export function DayCheckIn({ day = TODAY_INDEX }: { day?: number }) {
  const { habits, dayValue, setDayValue } = useHabits();
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const activeHabits = habits.filter((h) => !h.archived);
  const atLimit = activeHabits.length >= MAX_ACTIVE_HABITS;

  return (
    <>
      <section
        className="rounded-[var(--radius-lg)] border p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
            Daily Check-In
          </h2>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-xs font-semibold"
            style={{ color: "var(--color-brand)" }}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>

        {editing ? (
          <div className="mt-2 flex flex-col gap-2">
            <HabitEditor habits={activeHabits} onDone={() => setEditing(false)} />
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              disabled={atLimit}
              className="rounded-[var(--radius-sm)] border py-2 text-sm font-medium disabled:opacity-50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
            >
              {atLimit ? `Habit limit reached (${MAX_ACTIVE_HABITS})` : "+ Add habit"}
            </button>
          </div>
        ) : (
          activeHabits.map((habit, i) => (
            <CheckInRow
              key={habit.id}
              id={habit.id}
              emoji={habit.emoji}
              label={habit.label}
              value={dayValue(habit.id, day)}
              onChange={(v) => setDayValue(habit.id, day, v)}
              isLast={i === activeHabits.length - 1}
              day={day}
            />
          ))
        )}

        <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} />
      </section>

      <section
        className="rounded-[var(--radius-lg)] border p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Mind, Body &amp; Spirit
        </h2>
        <p className="mb-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
          How do you feel today?
        </p>

        {MOOD_ENTRIES.map((mood, i) => (
          <CheckInRow
            key={mood.id}
            id={mood.id}
            emoji={mood.emoji}
            label={mood.label}
            value={dayValue(mood.id, day)}
            onChange={(v) => setDayValue(mood.id, day, v)}
            isLast={i === MOOD_ENTRIES.length - 1}
            day={day}
          />
        ))}
      </section>
    </>
  );
}
