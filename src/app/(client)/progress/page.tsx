"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { HabitGrid } from "@/components/habit-grid";
import { AddHabitSheet } from "@/components/add-habit-sheet";
import { ProgramAdherence } from "@/components/program-adherence";
import { MonthCalendar } from "@/components/month-calendar";
import { MOOD_ENTRIES } from "@/components/day-checkin";
import { SectionDivider } from "@/components/section-divider";
import { WeeklyReviewsCard, CheckInCallsCard } from "@/components/progress-sections";
import { useHabits } from "@/lib/habits-context";
import {
  adherenceColor,
  periodPct,
  MAX_ACTIVE_HABITS,
  MOCK_TRAINING_PCT,
  MOCK_TRAINING_PCT_MONTHLY,
  MOCK_TRAINING_PCT_YEARLY,
  type Timeframe,
} from "@/lib/habits";

const LIST_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly", "Monthly", "Yearly"];
const LIST_TIMEFRAME_LABELS = { Daily: "Today", Weekly: "Week", Monthly: "Block", Yearly: "Year" };

const TIMEFRAME_KEY = "pw-progress-timeframe";

export default function ProgressPage() {
  const { habits, todayValue } = useHabits();
  const [addOpen, setAddOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");

  // Opening a day and coming back should land on the same view you left, not
  // reset to Week. Session storage, so it doesn't outlive the app being open.
  useEffect(() => {
    const stored = window.sessionStorage.getItem(TIMEFRAME_KEY);
    if (stored) setTimeframe(stored as Timeframe);
  }, []);

  function chooseTimeframe(next: Timeframe) {
    setTimeframe(next);
    window.sessionStorage.setItem(TIMEFRAME_KEY, next);
  }

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

  const adherenceValues = useMemo<Partial<Record<Timeframe, number>>>(() => {
    function avgHabitsPct(period: Timeframe) {
      if (activeHabits.length === 0) return 0;
      return (
        activeHabits.reduce(
          (sum, habit) => sum + periodPct(habit.id, period, todayValue(habit.id)),
          0,
        ) / activeHabits.length
      );
    }

    if (activeHabits.length === 0) {
      return {
        Daily: MOCK_TRAINING_PCT,
        Weekly: MOCK_TRAINING_PCT,
        Monthly: MOCK_TRAINING_PCT_MONTHLY,
        Yearly: MOCK_TRAINING_PCT_YEARLY,
      };
    }

    return {
      Daily: Math.round((avgHabitsPct("Daily") + MOCK_TRAINING_PCT) / 2),
      Weekly: Math.round((avgHabitsPct("Weekly") + MOCK_TRAINING_PCT) / 2),
      Monthly: Math.round((avgHabitsPct("Monthly") + MOCK_TRAINING_PCT_MONTHLY) / 2),
      Yearly: Math.round((avgHabitsPct("Yearly") + MOCK_TRAINING_PCT_YEARLY) / 2),
    };
  }, [activeHabits, todayValue]);

  const atLimit = activeHabits.length >= MAX_ACTIVE_HABITS;

  return (
    <div>
      <TopBar />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <ProgramAdherence
          values={adherenceValues}
          timeframe={timeframe}
          onTimeframeChange={chooseTimeframe}
          timeframes={LIST_TIMEFRAMES}
          labels={LIST_TIMEFRAME_LABELS}
        />

        <MonthCalendar />

        <SectionDivider label="Habit Tracker" />

        <section className="flex flex-col gap-2">
          {activeHabits.map((habit) => {
            const habitPct = Math.round(periodPct(habit.id, timeframe, todayValue(habit.id)));

            return (
              <div
                key={habit.id}
                className="rounded-[var(--radius-md)] border px-3 py-2"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-2xl leading-none" aria-hidden>
                    {habit.emoji}
                  </span>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {habit.label}
                  </span>
                  <span
                    className="w-10 text-right text-sm font-semibold tabular-nums"
                    style={{ color: adherenceColor(habitPct) }}
                  >
                    {habitPct}%
                  </span>
                </div>
                <HabitGrid habitId={habit.id} todayValue={todayValue(habit.id)} period={timeframe} />
                {/* Same control in the same corner as the check-in rows on
                    Home, so it's one icon to learn rather than two. */}
                <div className="mt-0.5 flex">
                  <Link
                    href={`/progress/${habit.id}`}
                    aria-label={`About ${habit.label}`}
                    className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-lg"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ⓘ
                  </Link>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            disabled={atLimit}
            className="rounded-[var(--radius-md)] border py-3 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
          >
            {atLimit ? `Habit limit reached (${MAX_ACTIVE_HABITS})` : "+ Add habit"}
          </button>
        </section>

        <SectionDivider label="Mind, Body & Spirit" />
        <p className="-mt-3 px-1 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
          How you&rsquo;re feeling, not a task to tick off. Logged on Home.
        </p>

        <section className="flex flex-col gap-2">
          {MOOD_ENTRIES.map((mood) => {
            const moodPct = Math.round(periodPct(mood.id, timeframe, todayValue(mood.id)));

            return (
              <div
                key={mood.id}
                className="rounded-[var(--radius-md)] border px-3 py-2"
                style={{
                  borderColor: "color-mix(in srgb, var(--habit-color-5) 30%, var(--color-border))",
                  background: "color-mix(in srgb, var(--habit-color-5) 5%, var(--color-surface))",
                }}
              >
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-2xl leading-none" aria-hidden>
                    {mood.emoji}
                  </span>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {mood.label}
                  </span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: adherenceColor(moodPct) }}
                  >
                    {moodPct}%
                  </span>
                </div>
                <HabitGrid habitId={mood.id} todayValue={todayValue(mood.id)} period={timeframe} />
              </div>
            );
          })}
        </section>

        <SectionDivider label="Training" />

        <Link
          href="/progress/training"
          className="flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <span className="text-xl leading-none" aria-hidden>
            🏋
          </span>
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Training Adherence
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--color-brand)" }}>
            View &rsaquo;
          </span>
        </Link>

        <SectionDivider label="Reviews & Calls" />

        <WeeklyReviewsCard />

        <CheckInCallsCard />

      </div>

      <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
