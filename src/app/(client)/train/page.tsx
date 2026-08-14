"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";
import { useTrainLog } from "@/lib/train-log";
import {
  dateKey,
  getWeekDays,
  weekRangeLabel,
  minWeekOffset,
  MAX_WEEK_OFFSET,
  todaysSession,
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
  const session = useMemo(() => todaysSession(), []);
  const todayKey = useMemo(() => dateKey(new Date()), []);
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
        {/* Today's session is the one thing most people open this tab for, so
            it's a direct way into the log rather than a heading. */}
        <Link
          href={`/train/${todayKey}`}
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4"
          style={{
            borderColor: "var(--color-brand)",
            background: "color-mix(in srgb, var(--color-brand) 8%, var(--color-surface))",
          }}
        >
          <span className="text-2xl leading-none" aria-hidden>
            {session ? "🏋️" : "☯️"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold" style={{ color: "var(--color-brand)" }}>
              Today&rsquo;s Session
            </div>
            <div className="text-sm" style={{ color: "var(--color-text)" }}>
              {session ?? "Rest day"}
            </div>
          </div>
          <span className="shrink-0 text-lg" aria-hidden style={{ color: "var(--color-brand)" }}>
            &#8250;
          </span>
        </Link>

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
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg disabled:opacity-30"
              style={{ color: "var(--color-text)" }}
            >
              ›
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {weekDays.map((day) => {
              const isTraining = !!day.session;
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
                  className="flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3.5 text-left"
                  style={{
                    background: isTraining
                      ? "color-mix(in srgb, var(--color-brand-yellow) 20%, var(--color-surface-raised))"
                      : "var(--color-surface-raised)",
                    border: isTraining
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
                        <div className="text-xs font-semibold" style={{ color: statusColor }}>
                          {statusLabel}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        Rest day
                      </div>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-lg"
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
