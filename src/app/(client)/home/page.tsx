"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { WeatherPill } from "@/components/weather-pill";
import { CheckInRow } from "@/components/checkin-row";
import { ProgramAdherence } from "@/components/program-adherence";
import { useHabits } from "@/lib/habits-context";
import { MOCK_TRAINING_PCT, MOCK_COACH_COMMENT, weeklyPct, type Timeframe } from "@/lib/habits";
import { todaysSession } from "@/lib/train-schedule";

const HOME_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly"];
const HOME_TIMEFRAME_LABELS = { Daily: "Today", Weekly: "This week" };

export default function HomePage() {
  const { habits, dayComment, setDayComment, todayValue, setTodayValue } = useHabits();
  const [draftComment, setDraftComment] = useState(dayComment);
  const [saved, setSaved] = useState(false);
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

  function submitComment() {
    setDayComment(draftComment);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

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
          <Link
            href="/train"
            className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border p-4 transition-opacity active:opacity-80"
            style={{
              borderColor: "var(--color-brand)",
              background: "color-mix(in srgb, var(--color-brand) 8%, var(--color-surface))",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none" aria-hidden>
                🏋️
              </span>
              <div>
                <div className="text-base font-bold" style={{ color: "var(--color-brand)" }}>
                  Today&rsquo;s Session
                </div>
                <div className="text-sm" style={{ color: "var(--color-text)" }}>
                  {session}
                </div>
              </div>
            </div>
            <span className="text-lg" style={{ color: "var(--color-brand)" }} aria-hidden>
              ›
            </span>
          </Link>
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
            className="rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <h2 className="mb-1 text-base font-bold" style={{ color: "var(--color-text)" }}>
              Coach&rsquo;s Comment
            </h2>
            <p className="text-sm leading-relaxed font-bold" style={{ color: "var(--color-text)" }}>
              {MOCK_COACH_COMMENT}
            </p>
          </section>
        )}

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-1 text-sm font-bold" style={{ color: "var(--color-text)" }}>
            Daily Check-In
          </h2>

          {habits.map((habit, i) => (
            <CheckInRow
              key={habit.id}
              id={habit.id}
              emoji={habit.emoji}
              label={habit.label}
              value={todayValue(habit.id)}
              onChange={(v) => setTodayValue(habit.id, v)}
              isLast={i === habits.length - 1}
            />
          ))}
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Body, Mind &amp; Spirit
          </h2>
          <p className="mb-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Rate how you generally feel today.
          </p>

          <CheckInRow
            id="physical"
            emoji="💪"
            label="Body"
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
            id="spirit"
            emoji="☮️"
            label="Spirit"
            value={todayValue("spirit")}
            onChange={(v) => setTodayValue("spirit", v)}
            isLast
          />
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Daily Reflection
          </h2>
          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            placeholder="Anything to add today? (optional)"
            rows={2}
            className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="button"
            onClick={submitComment}
            className="mt-2.5 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            {saved ? "Saved" : "Submit"}
          </button>
        </section>
      </div>
    </div>
  );
}
