"use client";

import { useState } from "react";
import { AdherenceRing } from "./adherence-ring";
import {
  MOCK_TRAINING_SESSIONS_BY_PERIOD,
  MOCK_WEEKLY_REVIEWS,
  MOCK_CHECKIN_CALLS,
  MOCK_CHECKIN_CALLS_TOTAL,
  type WeeklyReviewStatus,
  type CallStatus,
} from "@/lib/progress-mocks";
import type { Timeframe } from "@/lib/habits";

const STATUS_COLOR: Record<WeeklyReviewStatus | CallStatus, string> = {
  Done: "var(--color-success)",
  Completed: "var(--color-success)",
  Missed: "var(--color-danger)",
  Pending: "var(--color-text-muted)",
  Upcoming: "var(--color-text-muted)",
};

const PERIOD_NOUN: Record<Timeframe, string> = {
  Daily: "today",
  Weekly: "this week",
  Monthly: "this block",
  Yearly: "this year",
};

const TRAIN_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly", "Monthly", "Yearly"];
const TRAIN_TIMEFRAME_LABELS: Record<Timeframe, string> = {
  Daily: "Day",
  Weekly: "Week",
  Monthly: "Block",
  Yearly: "Year",
};

// One combined number covering gym, stretching, cardio and anything else.
export function TrainingAdherenceCard() {
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");
  const { completed, planned } = MOCK_TRAINING_SESSIONS_BY_PERIOD[timeframe];
  const pct = planned > 0 ? Math.round((completed / planned) * 100) : 0;

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
          Training Adherence
        </h2>
        <div
          className="flex gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: "var(--color-border)" }}
        >
          {TRAIN_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className="rounded-full px-2 py-1 text-[10px] font-medium"
              style={{
                background: timeframe === tf ? "var(--color-brand)" : "transparent",
                color:
                  timeframe === tf ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
              }}
            >
              {TRAIN_TIMEFRAME_LABELS[tf]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <AdherenceRing pct={pct} />
        <div className="flex-1">
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {completed} of {planned} sessions completed {PERIOD_NOUN[timeframe]}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WeeklyReviewsCard() {
  return (
    <section
      className="rounded-[var(--radius-lg)] border p-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
        Weekly Reviews
      </h2>
      <div className="flex flex-col gap-2">
        {MOCK_WEEKLY_REVIEWS.map((review) => (
          <div key={review.week} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--color-text)" }}>
              Week {review.week}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                background: `color-mix(in srgb, ${STATUS_COLOR[review.status]} 16%, transparent)`,
                color: STATUS_COLOR[review.status],
              }}
            >
              {review.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CheckInCallsCard() {
  const [reasons, setReasons] = useState<Record<number, string>>({});

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Check-In Calls
        </h2>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {MOCK_CHECKIN_CALLS.filter((c) => c.status === "Completed").length} of{" "}
          {MOCK_CHECKIN_CALLS_TOTAL} completed
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {MOCK_CHECKIN_CALLS.map((call) => (
          <div key={call.call} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--color-text)" }}>
                Call {call.call}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  background: `color-mix(in srgb, ${STATUS_COLOR[call.status]} 16%, transparent)`,
                  color: STATUS_COLOR[call.status],
                }}
              >
                {call.status}
              </span>
            </div>
            {call.status === "Missed" && (
              <input
                type="text"
                value={reasons[call.call] ?? ""}
                onChange={(e) =>
                  setReasons((prev) => ({ ...prev, [call.call]: e.target.value }))
                }
                placeholder="Why was this missed?"
                className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
