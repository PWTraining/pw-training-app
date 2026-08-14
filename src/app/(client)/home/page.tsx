"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { WeatherPill } from "@/components/weather-pill";
import { DayCheckIn } from "@/components/day-checkin";
import { DailyReflection } from "@/components/daily-reflection";
import { Moments } from "@/components/moments";
import { ProgramAdherence } from "@/components/program-adherence";
import { useHabits } from "@/lib/habits-context";
import { MOCK_TRAINING_PCT, MOCK_COACH_COMMENT, weeklyPct, type Timeframe } from "@/lib/habits";
import { todaysSession } from "@/lib/train-schedule";

const HOME_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly"];
const HOME_TIMEFRAME_LABELS = { Daily: "Today", Weekly: "This week" };

export default function HomePage() {
  const { habits, todayValue } = useHabits();
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");
  const session = useMemo(() => todaysSession(), []);

  const adherenceValues = useMemo<Partial<Record<Timeframe, number>>>(() => {
    if (habits.length === 0) {
      return { Daily: MOCK_TRAINING_PCT, Weekly: MOCK_TRAINING_PCT };
    }

    const dailyHabits =
      habits.reduce((sum, habit) => sum + todayValue(habit.id), 0) / habits.length;
    const weeklyHabits =
      habits.reduce((sum, habit) => sum + weeklyPct(habit.id, todayValue(habit.id)), 0) /
      habits.length;

    return {
      Daily: Math.round((dailyHabits + MOCK_TRAINING_PCT) / 2),
      Weekly: Math.round((weeklyHabits + MOCK_TRAINING_PCT) / 2),
    };
  }, [habits, todayValue]);


  return (
    <div>
      <TopBar />

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        <section className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              Greetings, Paul
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nice to see you today.
            </p>
          </div>
          <WeatherPill />
        </section>

        <ProgramAdherence
          values={adherenceValues}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          timeframes={HOME_TIMEFRAMES}
          labels={HOME_TIMEFRAME_LABELS}
        />

        {session ? (
          <div
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{
              borderColor: "var(--color-brand)",
              background: "color-mix(in srgb, var(--color-brand) 8%, var(--color-surface))",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none" aria-hidden>
                🏋️
              </span>
              <div className="text-base font-bold" style={{ color: "var(--color-brand)" }}>
                Today&rsquo;s Session
              </div>
            </div>
            <Link
              href="/train"
              className="rounded-full py-2.5 text-center text-sm font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              View Session
            </Link>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{
              borderColor: "var(--color-brand)",
              background: "color-mix(in srgb, var(--color-brand) 8%, var(--color-surface))",
            }}
          >
            <span className="text-2xl leading-none" aria-hidden>
              ☯️
            </span>
            <div>
              <div className="text-base font-bold" style={{ color: "var(--color-brand)" }}>
                Today&rsquo;s Session
              </div>
              <div className="text-sm" style={{ color: "var(--color-text)" }}>
                Rest day
              </div>
            </div>
          </div>
        )}

        {MOCK_COACH_COMMENT && (
          <section
            className="flex gap-3 rounded-[var(--radius-lg)] border-2 p-4"
            style={{
              borderColor: "color-mix(in srgb, var(--color-brand-teal) 55%, var(--color-border))",
              background: "color-mix(in srgb, var(--color-brand-teal) 8%, var(--color-surface))",
            }}
          >
            <div>
              <h2
                className="mb-1 flex items-center gap-1.5 text-base font-bold"
                style={{ color: "var(--color-brand-teal)" }}
              >
                <span aria-hidden>📣</span> Coach&rsquo;s Comment
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                {MOCK_COACH_COMMENT}
              </p>
            </div>
          </section>
        )}

        <DayCheckIn />

        <DailyReflection />

        <Moments />

      </div>
    </div>
  );
}
