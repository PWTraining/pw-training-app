"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";
import {
  getWeekDays,
  weekRangeLabel,
  minWeekOffset,
  MAX_WEEK_OFFSET,
  todaysSession,
  type DayStatus,
} from "@/lib/train-schedule";

type SetLog = { weight: string; reps: string; done: boolean };

type Exercise = {
  id: string;
  name: string;
  target: string;
  lastSession: string;
  demoUrl?: string;
  sets: SetLog[];
};

const INITIAL: Exercise[] = [
  {
    id: "squat",
    name: "Back Squat",
    target: "4 x 6 @ RPE 8",
    lastSession: "last: 80kg x 6, 82.5kg x 6",
    demoUrl: "https://youtube.com",
    sets: [
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
    ],
  },
  {
    id: "bench",
    name: "Flat Bench Press",
    target: "4 x 8 @ RPE 8",
    lastSession: "last: 60kg x 8, 60kg x 7",
    demoUrl: "https://youtube.com",
    sets: [
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
    ],
  },
  {
    id: "row",
    name: "Chest Supported Row",
    target: "3 x 10",
    lastSession: "last: 24kg x 10",
    sets: [
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
      { weight: "", reps: "", done: false },
    ],
  },
];

const STATUS_LABEL: Record<DayStatus, string> = {
  completed: "Done",
  missed: "Missed",
  today: "Today",
  upcoming: "Upcoming",
  rest: "Rest day",
};

const STATUS_COLOR: Record<DayStatus, string> = {
  completed: "var(--color-success)",
  missed: "var(--color-danger)",
  today: "var(--color-text)",
  upcoming: "var(--color-text-muted)",
  rest: "var(--color-text-muted)",
};

export default function TrainPage() {
  const [exercises, setExercises] = useState(INITIAL);
  const session = useMemo(() => todaysSession(), []);
  const minOffset = useMemo(() => minWeekOffset(), []);

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedDay = weekDays.find((d) => d.key === selectedKey);

  // Collapse the day detail whenever the viewed week changes, so switching
  // weeks never leaves a stale day's workout showing.
  useEffect(() => {
    setSelectedKey(null);
  }, [weekOffset]);

  function changeWeek(delta: number) {
    setWeekOffset((prev) => Math.max(minOffset, Math.min(MAX_WEEK_OFFSET, prev + delta)));
  }

  function goToToday() {
    setWeekOffset(0);
  }

  function updateSet(exerciseId: string, index: number, patch: Partial<SetLog>) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, i) => (i === index ? { ...s, ...patch } : s)),
            },
      ),
    );
  }

  const weekLabel =
    weekOffset === 0
      ? "This Week"
      : weekOffset === 1
        ? "Next Week"
        : weekOffset === -1
          ? "Last Week"
          : weekRangeLabel(weekDays);

  return (
    <div>
      <TopBar />

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        <div
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4"
          style={{
            borderColor: "var(--color-brand)",
            background: "color-mix(in srgb, var(--color-brand) 8%, var(--color-surface))",
          }}
        >
          <span className="text-2xl leading-none" aria-hidden>
            {session ? "🏋️" : "☯️"}
          </span>
          <div>
            <div className="text-base font-bold" style={{ color: "var(--color-brand)" }}>
              Today&rsquo;s Session
            </div>
            <div className="text-sm" style={{ color: "var(--color-text)" }}>
              {session ?? "Rest day"}
            </div>
          </div>
        </div>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{
            borderColor: "var(--color-brand-yellow)",
            background: "color-mix(in srgb, var(--color-brand-yellow) 8%, var(--color-surface))",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              disabled={weekOffset <= minOffset}
              aria-label="Previous week"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg disabled:opacity-30"
              style={{ color: "var(--color-text)" }}
            >
              ‹
            </button>
            <div className="flex flex-col items-center">
              <span
                className="text-base font-bold"
                style={{ color: "color-mix(in srgb, var(--color-brand-yellow) 55%, black)" }}
              >
                {weekLabel}
              </span>
              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={goToToday}
                  className="text-[11px] font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  Back to today
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => changeWeek(1)}
              disabled={weekOffset >= MAX_WEEK_OFFSET}
              aria-label="Next week"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg disabled:opacity-30"
              style={{ color: "var(--color-text)" }}
            >
              ›
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {weekDays.map((day) => {
              const selected = day.key === selectedKey;
              const isTraining = !!day.session;
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedKey(day.key)}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3.5 text-left"
                  style={{
                    background: isTraining
                      ? "color-mix(in srgb, var(--color-brand-yellow) 20%, var(--color-surface-raised))"
                      : "var(--color-surface-raised)",
                    border: selected
                      ? "2px solid var(--color-text)"
                      : isTraining
                        ? "1px solid var(--color-brand-yellow)"
                        : "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex w-11 shrink-0 flex-col items-center gap-1">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {day.weekdayLabel}
                    </span>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: day.status === "today" ? "var(--color-text)" : "transparent",
                        color:
                          day.status === "today" ? "var(--color-surface)" : "var(--color-text)",
                      }}
                    >
                      {day.dateNum}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {day.session ? (
                      <>
                        <div
                          className="truncate text-sm font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {day.session.title}
                        </div>
                        <div
                          className="text-xs font-semibold"
                          style={{ color: STATUS_COLOR[day.status] }}
                        >
                          {STATUS_LABEL[day.status]}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Rest day
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedDay?.session ? (
          <>
            <div className="-mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {selectedDay.session.title}
            </div>
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="rounded-[var(--radius-lg)] border p-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      {exercise.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {exercise.target}
                    </div>
                  </div>
                  {exercise.demoUrl && (
                    <a
                      href={exercise.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs font-medium"
                      style={{ color: "var(--color-brand)" }}
                    >
                      Video ▸
                    </a>
                  )}
                </div>

                <div
                  className="mb-2 text-[11px] italic"
                  style={{ color: "var(--color-text-muted)", opacity: 0.75 }}
                >
                  {exercise.lastSession}
                </div>

                <div className="flex flex-col gap-1.5">
                  {exercise.sets.map((set, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-4 text-[11px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {i + 1}
                      </span>
                      <input
                        inputMode="decimal"
                        placeholder="kg"
                        value={set.weight}
                        onChange={(e) => updateSet(exercise.id, i, { weight: e.target.value })}
                        className="w-16 rounded-md border px-2 py-1.5 text-sm outline-none"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                          background: "var(--color-surface)",
                        }}
                      />
                      <input
                        inputMode="numeric"
                        placeholder="reps"
                        value={set.reps}
                        onChange={(e) => updateSet(exercise.id, i, { reps: e.target.value })}
                        className="w-16 rounded-md border px-2 py-1.5 text-sm outline-none"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                          background: "var(--color-surface)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => updateSet(exercise.id, i, { done: !set.done })}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border text-xs"
                        style={{
                          borderColor: set.done ? "var(--color-success)" : "var(--color-border)",
                          background: set.done ? "var(--color-success)" : "transparent",
                          color: set.done ? "#fff" : "transparent",
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-3 w-full rounded-md border py-2 text-xs font-medium"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
                >
                  🎥 Upload technique video
                </button>
              </div>
            ))}
          </>
        ) : selectedDay ? (
          <div
            className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border p-6 text-center"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-2xl" aria-hidden>
              ☯️
            </span>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Rest day. Nothing programmed.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
