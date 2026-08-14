"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TopBar } from "@/components/top-bar";
import { exercisesForDate, useTrainLog } from "@/lib/train-log";
import { dateFromKey, longDateLabel, programDayFor } from "@/lib/train-schedule";

export function SessionView({ dateKey }: { dateKey: string }) {
  const date = useMemo(() => dateFromKey(dateKey), [dateKey]);
  const exercises = useMemo(() => (date ? exercisesForDate(date) : []), [date]);
  const { hydrated, sessionFor, updateSet, setSaved } = useTrainLog();

  if (!date) {
    return (
      <div>
        <TopBar />
        <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            That session couldn&rsquo;t be found.
          </p>
          <Link href="/train" className="text-sm font-medium" style={{ color: "var(--color-brand)" }}>
            Back to Train
          </Link>
        </div>
      </div>
    );
  }

  const day = programDayFor(date);
  const log = sessionFor(dateKey, exercises);

  return (
    <div>
      <TopBar />

      <div
        className="border-b px-4 py-2.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* The viewer's timezone decides how this reads, and the server can't
            know it, so let the client's value win over the prerendered one. */}
        <div
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
          suppressHydrationWarning
        >
          {longDateLabel(date)}
        </div>
        <div className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          {day.session ? day.session.title : "Rest day"}
        </div>
        {/* Coach's note on the session, written per day. */}
        {day.session?.note && (
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {day.session.note}
          </p>
        )}
      </div>

      {!day.session ? (
        <div className="px-4 pt-6">
          <div
            className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border p-6 text-center"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-2xl" aria-hidden>
              ☯️
            </span>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nothing programmed.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
          {/* Same pattern as a check-in day: finished work sits saved rather
              than staying open, and reopening it is one tap. */}
          {hydrated && log.saved ? (
            <div
              className="flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5"
              style={{
                borderColor: "color-mix(in srgb, var(--color-success) 45%, transparent)",
                background: "color-mix(in srgb, var(--color-success) 8%, var(--color-surface))",
              }}
            >
              <span className="text-base leading-none" style={{ color: "var(--color-success)" }}>
                ✓
              </span>
              <span className="flex-1 text-xs" style={{ color: "var(--color-text)" }}>
                Session saved.
              </span>
              <button
                type="button"
                onClick={() => setSaved(dateKey, exercises, false)}
                className="rounded-full px-2 py-1 text-xs font-semibold"
                style={{ color: "var(--color-brand)" }}
              >
                Edit session
              </button>
            </div>
          ) : null}

          {exercises.map((exercise) => {
            const rows = log.sets[exercise.id] ?? [];
            return (
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
                      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 px-3 text-xs font-bold"
                      style={{
                        borderColor: "var(--color-brand)",
                        background: "color-mix(in srgb, var(--color-brand) 10%, transparent)",
                        color: "var(--color-brand)",
                      }}
                    >
                      <span aria-hidden>▶</span> Video
                    </a>
                  )}
                </div>

                <div
                  className="mb-2 text-[11px] italic"
                  style={{ color: "var(--color-text-muted)", opacity: 0.75 }}
                >
                  {exercise.lastSession}
                </div>

                <div className="flex flex-col gap-2">
                  {rows.map((set, i) => (
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
                        disabled={log.saved}
                        onChange={(e) =>
                          updateSet(dateKey, exercises, exercise.id, i, { weight: e.target.value })
                        }
                        aria-label={`${exercise.name} set ${i + 1} weight`}
                        className="w-20 rounded-md border px-2 py-2 text-sm outline-none disabled:opacity-60"
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
                        disabled={log.saved}
                        onChange={(e) =>
                          updateSet(dateKey, exercises, exercise.id, i, { reps: e.target.value })
                        }
                        aria-label={`${exercise.name} set ${i + 1} reps`}
                        className="w-20 rounded-md border px-2 py-2 text-sm outline-none disabled:opacity-60"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                          background: "var(--color-surface)",
                        }}
                      />
                      <button
                        type="button"
                        disabled={log.saved}
                        onClick={() =>
                          updateSet(dateKey, exercises, exercise.id, i, { done: !set.done })
                        }
                        aria-label={`Mark ${exercise.name} set ${i + 1} done`}
                        aria-pressed={set.done}
                        className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border text-base"
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

                {/* Quiet on purpose: it's an occasional extra, not the thing
                    you came to this card to do. */}
                <button
                  type="button"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border py-2 text-xs font-medium"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <span className="text-sm leading-none" aria-hidden>
                    📷
                  </span>
                  Upload Video
                </button>
              </div>
            );
          })}

          {!log.saved && (
            <button
              type="button"
              onClick={() => setSaved(dateKey, exercises, true)}
              className="w-full rounded-[var(--radius-md)] py-3 text-sm font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Save session
            </button>
          )}
        </div>
      )}
    </div>
  );
}
