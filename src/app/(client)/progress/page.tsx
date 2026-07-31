"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { HabitGrid } from "@/components/habit-grid";
import { AddHabitSheet } from "@/components/add-habit-sheet";
import { HabitHistorySheet } from "@/components/habit-history-sheet";
import { ProgramAdherence, type Timeframe } from "@/components/program-adherence";
import { SectionDivider } from "@/components/section-divider";
import { CheckInRow } from "@/components/checkin-row";
import {
  TrainingAdherenceCard,
  WeeklyReviewsCard,
  CheckInCallsCard,
} from "@/components/progress-sections";
import { useHabits } from "@/lib/habits-context";
import {
  adherenceColor,
  weeklyPct,
  monthlyPct,
  MOCK_TRAINING_PCT,
  MOCK_TRAINING_PCT_MONTHLY,
  MOCK_TRAINING_PCT_YEARLY,
  MOCK_HABITS_PCT_YEARLY,
} from "@/lib/habits";

export default function ProgressPage() {
  const { habits, removeHabit, todayValue, setTodayValue, hasComments } = useHabits();
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  return (
    <div>
      <TopBar
        title="Progress"
        right={
          <>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              History
            </button>
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                color: editing ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
                background: editing ? "var(--color-brand)" : "transparent",
              }}
            >
              {editing ? "Done" : "Edit"}
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        <ProgramAdherence values={adherenceValues} />

        <SectionDivider label="Habit Tracker" />

        <section className="flex flex-col gap-3">
          {habits.map((habit) => {
            const habitPct = Math.round(monthlyPct(habit.id, todayValue(habit.id)));

            const cardHeader = (
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
                {hasComments(habit.id) && (
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-brand)" }}
                    aria-label="Has a note"
                    title="Has a note"
                  >
                    💬
                  </span>
                )}
                {editing ? (
                  <button
                    type="button"
                    onClick={() => removeHabit(habit.id)}
                    aria-label={`Remove ${habit.label}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: "var(--color-danger)", color: "#fff" }}
                  >
                    ×
                  </button>
                ) : (
                  <>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: adherenceColor(habitPct) }}
                    >
                      {habitPct}%
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                      aria-hidden
                    >
                      &rsaquo;
                    </span>
                  </>
                )}
              </div>
            );

            const cardStyle = {
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
            } as const;

            if (editing) {
              return (
                <div
                  key={habit.id}
                  className="rounded-[var(--radius-md)] border px-3 py-3"
                  style={cardStyle}
                >
                  {cardHeader}
                  <HabitGrid habitId={habit.id} todayValue={todayValue(habit.id)} />
                </div>
              );
            }

            return (
              <Link
                key={habit.id}
                href={`/progress/${habit.id}`}
                className="block rounded-[var(--radius-md)] border px-3 py-3"
                style={cardStyle}
              >
                {cardHeader}
                <HabitGrid habitId={habit.id} todayValue={todayValue(habit.id)} />
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-[var(--radius-md)] border py-3 text-sm font-medium"
            style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
          >
            + Add habit
          </button>
        </section>

        <SectionDivider label="Training" />

        <TrainingAdherenceCard />

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Physical &amp; Training
          </h2>
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
          />
          <CheckInRow
            id="training"
            emoji="🏋"
            label="Training"
            value={todayValue("training")}
            onChange={(v) => setTodayValue("training", v)}
          />
          <CheckInRow
            id="cardio"
            emoji="🏃"
            label="Cardio"
            value={todayValue("cardio")}
            onChange={(v) => setTodayValue("cardio", v)}
            isLast
          />
        </section>

        <SectionDivider label="Reviews & Calls" />

        <WeeklyReviewsCard />

        <CheckInCallsCard />
      </div>

      <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <HabitHistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
