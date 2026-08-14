"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdherenceRing } from "@/components/adherence-ring";
import { HabitGrid } from "@/components/habit-grid";
import { HabitEditor } from "@/components/habit-editor";
import { CheckInRow } from "@/components/checkin-row";
import { useHabits } from "@/lib/habits-context";
import {
  BLOCK_LENGTH,
  TODAY_INDEX,
  MOCK_BLOCK,
  monthlyPct,
  weeklyPct,
  periodPct,
  adherenceColor,
} from "@/lib/habits";

export function HabitDetail({ habitId }: { habitId: string }) {
  const { habits, todayValue, setTodayValue, commentsFor, commentFor } = useHabits();
  const habit = habits.find((h) => h.id === habitId);

  const loggedDays = useMemo(() => MOCK_BLOCK[habitId] ?? [], [habitId]);
  const today = todayValue(habitId);
  const comments = commentsFor(habitId);
  const [editing, setEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedDayComment = selectedDay === null ? "" : commentFor(habitId, selectedDay);

  const blockPct = Math.round(monthlyPct(habitId, today));
  const weekPct = Math.round(weeklyPct(habitId, today));
  const yearPct = Math.round(periodPct(habitId, "Yearly", today));

  const completions = useMemo(() => {
    const values = [...loggedDays.slice(0, TODAY_INDEX), today];
    return values.filter((v) => v === 100).length;
  }, [loggedDays, today]);

  const fill = adherenceColor(today);


  if (!habit) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          That habit isn&rsquo;t in your list anymore.
        </p>
        <Link
          href="/progress"
          className="text-sm font-medium"
          style={{ color: "var(--color-brand)" }}
        >
          Back to Progress
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header
        className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-3 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        }}
      >
        <Link
          href="/progress"
          aria-label="Back to progress"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
          style={{ color: "var(--color-text)" }}
        >
          &lsaquo;
        </Link>
        <span className="text-xl leading-none" aria-hidden>
          {habit.emoji}
        </span>
        <h1 className="flex-1 text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {habit.label}
        </h1>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
          style={{ color: "var(--color-brand)" }}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </header>

      {editing && (
        <div className="px-4 pt-4">
          <HabitEditor habits={[habit]} onDone={() => setEditing(false)} />
        </div>
      )}

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        {habit.why && (
          <section
            className="rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Why this habit
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              {habit.why}
            </p>
          </section>
        )}

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Day
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: fill }}>
              {today}%
            </span>
          </div>
          <HabitGrid habitId={habit.id} todayValue={today} period="Daily" />
          <div className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Today
          </div>
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Week
            </span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: adherenceColor(weekPct) }}
            >
              {weekPct}%
            </span>
          </div>
          <HabitGrid habitId={habit.id} todayValue={today} period="Weekly" />
          <div className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            This week
          </div>
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Block
            </span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: adherenceColor(blockPct) }}
            >
              {blockPct}%
            </span>
          </div>
          <HabitGrid
            habitId={habit.id}
            todayValue={today}
            period="Monthly"
            comments={comments}
            onSelectDay={setSelectedDay}
          />
          <div className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Day {TODAY_INDEX + 1} of {BLOCK_LENGTH}, resets every 4-week block
          </div>
          {selectedDayComment && (
            <div
              className="mt-3 rounded-[var(--radius-sm)] border px-3 py-2 text-xs"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              {selectedDayComment}
            </div>
          )}
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Year
            </span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: adherenceColor(yearPct) }}
            >
              {yearPct}%
            </span>
          </div>
          <HabitGrid habitId={habit.id} todayValue={today} period="Yearly" />
          <div className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Year to date
          </div>
        </section>

        <section
          className="flex items-center gap-4 rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <AdherenceRing pct={blockPct} />
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
              {habit.label}
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Block adherence
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {completions} completions this block
            </div>
          </div>
        </section>

        <section
          className="rounded-[var(--radius-md)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Today
          </h2>
          <CheckInRow
            id={habit.id}
            emoji={habit.emoji}
            label={habit.label}
            value={today}
            onChange={(v) => setTodayValue(habitId, v)}
            isLast
          />
        </section>

      </div>
    </div>
  );
}
