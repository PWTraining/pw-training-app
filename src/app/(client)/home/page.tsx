"use client";

import { useMemo, useState } from "react";
import { MenuButton, MenuDrawer } from "@/components/menu-drawer";
import { Wordmark } from "@/components/wordmark";
import { WeatherPill } from "@/components/weather-pill";
import { CheckInRow } from "@/components/checkin-row";
import { ProgramAdherence, type Timeframe } from "@/components/program-adherence";
import { useHabits } from "@/lib/habits-context";
import {
  MOCK_TRAINING_PCT,
  MOCK_TRAINING_PCT_MONTHLY,
  MOCK_TRAINING_PCT_YEARLY,
  MOCK_HABITS_PCT_YEARLY,
  MOCK_COACH_COMMENT,
  weeklyPct,
  monthlyPct,
} from "@/lib/habits";

export default function HomePage() {
  const { habits, dayComment, setDayComment, todayValue, setTodayValue } = useHabits();
  const [menuOpen, setMenuOpen] = useState(false);
  const [draftComment, setDraftComment] = useState(dayComment);
  const [saved, setSaved] = useState(false);

  const adherenceValues = useMemo<Record<Timeframe, number>>(() => {
    if (habits.length === 0) {
      return {
        Daily: MOCK_TRAINING_PCT,
        Weekly: MOCK_TRAINING_PCT,
        Monthly: MOCK_TRAINING_PCT_MONTHLY,
        Yearly: MOCK_TRAINING_PCT_YEARLY,
      };
    }

    const dailyHabits =
      habits.reduce((sum, habit) => sum + todayValue(habit.id), 0) / habits.length;
    const weeklyHabits =
      habits.reduce((sum, habit) => sum + weeklyPct(habit.id, todayValue(habit.id)), 0) /
      habits.length;
    const monthlyHabits =
      habits.reduce((sum, habit) => sum + monthlyPct(habit.id, todayValue(habit.id)), 0) /
      habits.length;

    return {
      Daily: Math.round((dailyHabits + MOCK_TRAINING_PCT) / 2),
      Weekly: Math.round((weeklyHabits + MOCK_TRAINING_PCT) / 2),
      Monthly: Math.round((monthlyHabits + MOCK_TRAINING_PCT_MONTHLY) / 2),
      Yearly: Math.round((MOCK_HABITS_PCT_YEARLY + MOCK_TRAINING_PCT_YEARLY) / 2),
    };
  }, [habits, todayValue]);

  function submitComment() {
    setDayComment(draftComment);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        }}
      >
        <MenuButton onClick={() => setMenuOpen(true)} />
        <Wordmark />
      </header>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        <section className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              Greetings, Paul
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nice to see you today.
            </p>
          </div>
          <WeatherPill />
        </section>

        <ProgramAdherence values={adherenceValues} />

        {MOCK_COACH_COMMENT && (
          <section
            className="rounded-[var(--radius-lg)] border p-4"
            style={{
              borderColor: "var(--color-brand)",
              background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            }}
          >
            <h2 className="mb-1 text-xs font-semibold" style={{ color: "var(--color-brand)" }}>
              Coach&rsquo;s Comment
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
              {MOCK_COACH_COMMENT}
            </p>
          </section>
        )}

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Daily Check-In
          </h2>

          {habits.map((habit) => (
            <CheckInRow
              key={habit.id}
              id={habit.id}
              emoji={habit.emoji}
              label={habit.label}
              value={todayValue(habit.id)}
              onChange={(v) => setTodayValue(habit.id, v)}
            />
          ))}

          <CheckInRow
            id="physical"
            emoji="💪"
            label="Physical"
            value={todayValue("physical")}
            onChange={(v) => setTodayValue("physical", v)}
          />
          <CheckInRow
            id="mind"
            emoji="🧠"
            label="Mind"
            value={todayValue("mind")}
            onChange={(v) => setTodayValue("mind", v)}
            isLast
          />
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Member comment
          </h2>
          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            placeholder="Leave a comment for Paul (optional)"
            rows={2}
            className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="button"
            onClick={submitComment}
            className="mt-2.5 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            {saved ? "Saved" : "Submit"}
          </button>
        </section>
      </div>
    </div>
  );
}
