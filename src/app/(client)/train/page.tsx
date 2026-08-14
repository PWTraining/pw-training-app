"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { useTrainLog } from "@/lib/train-log";
import {
  getWeekDays,
  weekRangeLabel,
  minWeekOffset,
  MAX_WEEK_OFFSET,
  type DayStatus,
} from "@/lib/train-schedule";

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
  const minOffset = useMemo(() => minWeekOffset(), []);

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  const { isSessionSaved, isSessionStarted } = useTrainLog();

  function changeWeek(delta: number) {
    setWeekOffset((prev) => Math.max(minOffset, Math.min(MAX_WEEK_OFFSET, prev + delta)));
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
        {/* No separate "today" callout — today is the highlighted row in the
            week below, which is the same tap and half the screen space. */}
        {/* Tightened up so a full week fits on one screen, and the yellow
            wash pulled right back so it isn't competing with the rows. */}
        <section
          className="rounded-[var(--radius-lg)] border p-3"
          style={{
            borderColor: "var(--color-border)",
            background: "color-mix(in srgb, var(--color-brand-yellow) 3%, var(--color-surface))",
          }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
              disabled={weekOffset <= minOffset}
              aria-label="Previous week"
              className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30"
              style={{ color: "var(--color-text)" }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 5 8 12l7 7" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold" style={{ color: "var(--color-text)" }}>
                {weekLabel}
              </span>
              {weekOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
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
              className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30"
              style={{ color: "var(--color-text)" }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* The week has the screen to itself now, so the rows can breathe
              and still fit a phone without scrolling. */}
          <div className="flex flex-col gap-2">
            {weekDays.map((day) => {
              const isTraining = !!day.session;
              const isToday = day.status === "today";
              // A locally recorded session is the truth about whether the work
              // happened, so it wins over the programmed status.
              const saved = isSessionSaved(day.key);
              const started = !saved && isSessionStarted(day.key);
              const statusLabel = saved
                ? "Done"
                : started
                  ? "In progress"
                  : STATUS_LABEL[day.status];
              const statusColor = saved
                ? "var(--color-success)"
                : started
                  ? "var(--color-brand)"
                  : STATUS_COLOR[day.status];

              return (
                <Link
                  key={day.key}
                  href={`/train/${day.key}`}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left"
                  style={{
                    // Only today is filled. Every other row is plain, with a
                    // green outline marking the training days.
                    background: isToday
                      ? "color-mix(in srgb, var(--color-brand) 12%, var(--color-surface))"
                      : "var(--color-surface)",
                    border: isToday
                      ? "2px solid var(--color-brand)"
                      : isTraining
                        ? "1px solid color-mix(in srgb, var(--color-success) 55%, transparent)"
                        : "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex w-9 shrink-0 flex-col items-center">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: isToday ? "var(--color-brand)" : "var(--color-text-muted)" }}
                    >
                      {day.weekdayLabel}
                    </span>
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: isToday ? "var(--color-brand)" : "transparent",
                        color: isToday ? "var(--color-brand-contrast)" : "var(--color-text)",
                      }}
                    >
                      {day.dateNum}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-baseline gap-2">
                    {day.session ? (
                      <>
                        <span
                          className="truncate text-sm font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {day.session.title}
                        </span>
                        <span
                          className="shrink-0 text-[11px] font-semibold"
                          style={{ color: statusColor }}
                        >
                          {statusLabel}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Rest day
                      </span>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-base"
                    aria-hidden
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    &#8250;
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
