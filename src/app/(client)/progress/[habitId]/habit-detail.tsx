"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdherenceRing } from "@/components/adherence-ring";
import { HabitGrid } from "@/components/habit-grid";
import { useHabits } from "@/lib/habits-context";
import {
  BLOCK_LENGTH,
  TODAY_INDEX,
  MOCK_BLOCK,
  monthlyPct,
  weeklyPct,
  periodPct,
  adherenceColor,
  sliderFill,
} from "@/lib/habits";

export function HabitDetail({ habitId }: { habitId: string }) {
  const { habits, todayValue, setTodayValue, commentsFor, addComment } = useHabits();
  const habit = habits.find((h) => h.id === habitId);

  const loggedDays = useMemo(() => MOCK_BLOCK[habitId] ?? [], [habitId]);
  const today = todayValue(habitId);
  const comments = commentsFor(habitId);
  const [draft, setDraft] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedDayComments = comments.filter((c) => c.day === selectedDay);

  const blockPct = Math.round(monthlyPct(habitId, today));
  const weekPct = Math.round(weeklyPct(habitId, today));
  const yearPct = Math.round(periodPct(habitId, "Yearly", today));

  const completions = useMemo(() => {
    const values = [...loggedDays.slice(0, TODAY_INDEX), today];
    return values.filter((v) => v === 100).length;
  }, [loggedDays, today]);

  const fill = adherenceColor(today);

  function submitComment() {
    const text = draft.trim();
    if (!text) return;
    addComment(habitId, text);
    setDraft("");
  }

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
        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {habit.label}
        </h1>
      </header>

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
          {selectedDayComments.length > 0 && (
            <div
              className="mt-3 flex flex-col gap-1.5 rounded-[var(--radius-sm)] border px-3 py-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              {selectedDayComments.map((c, i) => (
                <div key={i} className="text-xs" style={{ color: "var(--color-text)" }}>
                  {c.text}
                </div>
              ))}
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
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Today
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: fill }}>
              {today}%
            </span>
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={100}
            step={10}
            value={today}
            onChange={(e) => setTodayValue(habitId, Number(e.target.value))}
            style={{ "--slider-fill": sliderFill(today) } as React.CSSProperties}
          />
          <div className="mt-1 flex justify-between px-0.5">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
              <span
                key={tick}
                className="text-[8px] tabular-nums"
                style={{ color: "var(--color-text-muted)" }}
              >
                {tick}%
              </span>
            ))}
          </div>
        </section>

        <section
          className="rounded-[var(--radius-md)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Comments
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Leave a comment"
              className="flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
            <button
              type="button"
              onClick={submitComment}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium"
              style={{
                background: "var(--color-brand)",
                color: "var(--color-brand-contrast)",
              }}
            >
              Add
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
