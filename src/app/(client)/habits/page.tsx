"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/top-bar";

type Habit = {
  id: string;
  emoji: string;
  label: string;
};

const HABITS: Habit[] = [
  { id: "meals", emoji: "🥗", label: "Meals x3" },
  { id: "protein", emoji: "🎯", label: "Protein Target" },
  { id: "hydration", emoji: "💧", label: "Hydration 2L" },
  { id: "light", emoji: "☀️", label: "Morning Light" },
  { id: "phone", emoji: "📱", label: "Phone Boundaries" },
];

// Mock week: which habits are done on which day. Day 4 (index) is "today".
const TODAY_INDEX = 3;
const MOCK_WEEK: Record<string, boolean[]> = {
  meals: [true, true, false, false, false, false, false],
  protein: [true, false, true, false, false, false, false],
  hydration: [true, true, true, false, false, false, false],
  light: [false, true, true, false, false, false, false],
  phone: [true, true, false, false, false, false, false],
};

function adherenceColor(pct: number) {
  const step = Math.min(100, Math.max(0, Math.round(pct / 10) * 10));
  return `var(--adherence-${step})`;
}

export default function HabitsPage() {
  const [today, setToday] = useState<Record<string, boolean>>({
    meals: true,
    protein: false,
    hydration: false,
    light: false,
    phone: false,
  });
  const [physical, setPhysical] = useState<number | null>(7);
  const [mental, setMental] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const todayPct = useMemo(() => {
    const done = Object.values(today).filter(Boolean).length;
    return Math.round((done / HABITS.length) * 100);
  }, [today]);

  const weekPct = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const habit of HABITS) {
      const days = MOCK_WEEK[habit.id];
      for (let i = 0; i <= TODAY_INDEX; i++) {
        total += 1;
        if (i === TODAY_INDEX ? today[habit.id] : days[i]) done += 1;
      }
    }
    return Math.round((done / total) * 100);
  }, [today]);

  return (
    <div>
      <TopBar title="Habits" />

      <div className="flex flex-col gap-5 px-4 pt-4">
        <div
          className="rounded-[var(--radius-lg)] border p-3 text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          Here&rsquo;s the plan. Feel free to change it, but let&rsquo;s discuss and make it
          relevant.
        </div>

        <section className="flex flex-col gap-2">
          {HABITS.map((habit) => {
            const done = today[habit.id];
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => setToday((prev) => ({ ...prev, [habit.id]: !prev[habit.id] }))}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors"
                style={{
                  borderColor: done ? "var(--color-brand)" : "var(--color-border)",
                  background: done
                    ? "color-mix(in srgb, var(--color-brand) 10%, var(--color-surface))"
                    : "var(--color-surface)",
                }}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {habit.emoji}
                </span>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  {habit.label}
                </span>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-xs"
                  style={{
                    borderColor: done ? "var(--color-brand)" : "var(--color-border)",
                    background: done ? "var(--color-brand)" : "transparent",
                    color: done ? "var(--color-brand-contrast)" : "transparent",
                  }}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </section>

        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            How are you feeling today?
          </h2>

          <ScaleRow label="Physical" value={physical} onChange={setPhysical} />
          <div className="h-3" />
          <ScaleRow label="Mental" value={mental} onChange={setMental} />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything you want Paul to know? (optional)"
            rows={2}
            className="mt-3 w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
        </section>

        <section
          className="mb-6 flex items-center gap-4 rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Ring pct={weekPct} />
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              This week&rsquo;s adherence
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Today: {todayPct}% &middot; missing data never counts as failure
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="flex h-7 flex-1 items-center justify-center rounded-md border text-[11px] font-medium"
            style={{
              borderColor: value === n ? "var(--color-brand)" : "var(--color-border)",
              background: value === n ? "var(--color-brand)" : "transparent",
              color: value === n ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const color = adherenceColor(pct);
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        background: `conic-gradient(${color} ${pct * 3.6}deg, var(--color-border) 0deg)`,
        color: "var(--color-text)",
      }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: "var(--color-surface)" }}
      >
        {pct}%
      </div>
    </div>
  );
}
