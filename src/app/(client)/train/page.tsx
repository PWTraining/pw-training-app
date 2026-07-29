"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";

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

export default function TrainPage() {
  const [exercises, setExercises] = useState(INITIAL);

  const totalReps = useMemo(
    () =>
      exercises.reduce(
        (sum, ex) =>
          sum + ex.sets.reduce((s, set) => s + (set.done ? Number(set.reps) || 0 : 0), 0),
        0,
      ),
    [exercises],
  );

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

  return (
    <div>
      <TopBar title="Train" />

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div
          className="flex items-center justify-between rounded-[var(--radius-lg)] border p-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Today&rsquo;s session
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Upper / Lower — Week 4
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: "var(--color-brand)" }}>
              {totalReps}
            </div>
            <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
              reps logged
            </div>
          </div>
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
                  Demo ▸
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
      </div>
    </div>
  );
}
