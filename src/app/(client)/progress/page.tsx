"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { HabitGrid } from "@/components/habit-grid";
import { AddHabitSheet } from "@/components/add-habit-sheet";
import { ProgramAdherence } from "@/components/program-adherence";
import { MonthCalendar } from "@/components/month-calendar";
import { MOOD_ENTRIES } from "@/components/day-checkin";
import { SectionDivider } from "@/components/section-divider";
import {
  TrainingAdherenceCard,
  WeeklyReviewsCard,
  CheckInCallsCard,
} from "@/components/progress-sections";
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

export default function ProgressPage() {
  const { habits, todayValue, restoreHabit } = useHabits();
  const [addOpen, setAddOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const archivedHabits = useMemo(() => habits.filter((h) => h.archived), [habits]);

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

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        <ProgramAdherence
          values={adherenceValues}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          timeframes={LIST_TIMEFRAMES}
          labels={LIST_TIMEFRAME_LABELS}
        />

        <MonthCalendar timeframe={timeframe} />

        <SectionDivider label="Habit Tracker" />

        <section className="flex flex-col gap-3">
          {activeHabits.map((habit) => {
            const habitPct = Math.round(periodPct(habit.id, timeframe, todayValue(habit.id)));

            return (
              <Link
                key={habit.id}
                href={`/progress/${habit.id}`}
                className="block rounded-[var(--radius-md)] border px-3 py-3"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="text-2xl leading-none" aria-hidden>
                    {habit.emoji}
                  </span>
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {habit.label}
                  </span>
                  <span className="text-xs font-medium" style={{ color: "var(--color-brand)" }}>
                    View &rsaquo;
                  </span>
                  <span
                    className="w-10 text-right text-sm font-semibold tabular-nums"
                    style={{ color: adherenceColor(habitPct) }}
                  >
                    {habitPct}%
                  </span>
                </div>
                <HabitGrid habitId={habit.id} todayValue={todayValue(habit.id)} period={timeframe} />
              </Link>
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

        <SectionDivider label="Body, Mind & Spirit" />
        <p className="-mt-3 px-1 text-xs italic" style={{ color: "var(--color-text-muted)" }}>
          How you&rsquo;re feeling, not a task to tick off — logged on Home.
        </p>

        <section className="flex flex-col gap-3">
          {MOOD_ENTRIES.map((mood) => {
            const moodPct = Math.round(periodPct(mood.id, timeframe, todayValue(mood.id)));

            return (
              <div
                key={mood.id}
                className="rounded-[var(--radius-md)] border px-3 py-3"
                style={{
                  borderColor: "color-mix(in srgb, var(--habit-color-5) 30%, var(--color-border))",
                  background: "color-mix(in srgb, var(--habit-color-5) 5%, var(--color-surface))",
                }}
              >
                <div className="mb-2 flex items-center gap-2.5">
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

        <TrainingAdherenceCard />

        <SectionDivider label="Reviews & Calls" />

        <WeeklyReviewsCard />

        <CheckInCallsCard />

        {archivedHabits.length > 0 && (
          <>
            <SectionDivider label="Archive" />
            <section className="flex flex-col gap-2">
              {archivedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span className="text-xl leading-none opacity-60" aria-hidden>
                    {habit.emoji}
                  </span>
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {habit.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => restoreHabit(habit.id)}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ color: "var(--color-brand)" }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </section>
          </>
        )}
      </div>

      <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
