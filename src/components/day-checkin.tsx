"use client";

import { useState } from "react";
import { CheckInRow } from "./checkin-row";
import { HabitEditor } from "./habit-editor";
import { AddHabitSheet } from "./add-habit-sheet";
import { UndoButton } from "./undo-button";
import { useHabits } from "@/lib/habits-context";
import { TODAY_INDEX, MAX_ACTIVE_HABITS } from "@/lib/habits";

// Unlike a habit's "why", these read the same for every client — they explain
// what the slider is asking, not anything personal to the person moving it.
export const MOOD_ENTRIES = [
  {
    id: "mind",
    emoji: "🧠",
    label: "Mind",
    why: "How your head felt today. Clear, focused and calm sits high. Foggy, scattered or stressed sits low.",
  },
  {
    id: "physical",
    emoji: "💪",
    label: "Body",
    why: "How your body felt today. Rested, strong and moving well sits high. Sore, heavy or run down sits low.",
  },
  {
    id: "spirit",
    emoji: "☮️",
    label: "Spirit",
    why: "How you felt in yourself today. Motivated and connected sits high. Flat or disconnected sits low.",
  },
] as const;

// Shown to a client who hasn't set their habits up yet, so the check-in has
// something in it and it's obvious what to do next.
const PLACEHOLDER_HABITS = ["Habit 1", "Habit 2", "Habit 3"];

// The check-in controls, shared verbatim between Home (today) and the
// Progress day view (any past day) so the two can't drift apart.
export function DayCheckIn({
  day = TODAY_INDEX,
  readOnly = false,
}: {
  day?: number;
  readOnly?: boolean;
}) {
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
          <div className="flex items-center gap-1">
            {editing && <UndoButton />}
            {!readOnly && (
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="text-xs font-semibold"
                style={{ color: "var(--color-brand)" }}
              >
                {editing ? "Done" : "Edit"}
              </button>
            )}
          </div>
        </div>

        {editing && !readOnly ? (
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
        ) : activeHabits.length === 0 ? (
          <div className="mt-2 flex flex-col gap-2">
            {PLACEHOLDER_HABITS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setAddOpen(true)}
                disabled={readOnly}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed px-3 py-3 text-left disabled:opacity-50"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="text-xl leading-none" aria-hidden>
                  ➕
                </span>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  {name}
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--color-brand)" }}>
                  Set up
                </span>
              </button>
            ))}
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
              readOnly={readOnly}
              why={habit.why}
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
            readOnly={readOnly}
            why={mood.why}
          />
        ))}
      </section>
    </>
  );
}
