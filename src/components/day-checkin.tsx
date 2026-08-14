"use client";

import { CheckInRow } from "./checkin-row";
import { useHabits } from "@/lib/habits-context";
import { TODAY_INDEX } from "@/lib/habits";

export const MOOD_ENTRIES = [
  { id: "physical", emoji: "💪", label: "Body" },
  { id: "mind", emoji: "🧠", label: "Mind" },
  { id: "spirit", emoji: "☮️", label: "Spirit" },
] as const;

// The check-in controls, shared verbatim between Home (today) and the
// Progress day view (any past day) so the two can't drift apart.
export function DayCheckIn({ day = TODAY_INDEX }: { day?: number }) {
  const { habits, dayValue, setDayValue } = useHabits();
  const activeHabits = habits.filter((h) => !h.archived);

  return (
    <>
      <section
        className="rounded-[var(--radius-lg)] border p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="mb-1 text-sm font-bold" style={{ color: "var(--color-text)" }}>
          Daily Check-In
        </h2>

        {activeHabits.map((habit, i) => (
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
        ))}
      </section>

      <section
        className="rounded-[var(--radius-lg)] border p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Body, Mind &amp; Spirit
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
