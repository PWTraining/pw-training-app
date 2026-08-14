"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BLOCK_LENGTH, TODAY_INDEX, type Timeframe } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_MS = 86_400_000;

// Which block days the timeframe toggle above the calendar is covering, so
// the month view reflects the same range the adherence figure is built from.
function rangeFor(timeframe: Timeframe): [number, number] {
  if (timeframe === "Daily") return [TODAY_INDEX, TODAY_INDEX];
  if (timeframe === "Weekly") return [TODAY_INDEX - 6, TODAY_INDEX];
  if (timeframe === "Monthly") return [0, BLOCK_LENGTH - 1];
  return [-364, BLOCK_LENGTH - 1];
}

export function MonthCalendar({ timeframe }: { timeframe: Timeframe }) {
  const { isDayLogged } = useHabits();
  const [monthOffset, setMonthOffset] = useState(0);
  // Today is only knowable on the client, so the grid renders after mount
  // rather than hydrating over a server guess in the wrong timezone.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const view = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shown = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = shown.getFullYear();
    const month = shown.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first grid, so shift Sunday (0) to the end of the week.
    const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;

    const label = shown.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const blockIndex = TODAY_INDEX + Math.round((date.getTime() - today.getTime()) / DAY_MS);
      return { dayOfMonth: i + 1, blockIndex };
    });

    return { label, leadingBlanks, days };
  }, [monthOffset]);

  const [rangeStart, rangeEnd] = rangeFor(timeframe);

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonthOffset((v) => v - 1)}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
          style={{ color: "var(--color-brand)" }}
        >
          &lsaquo;
        </button>

        <h2
          className="text-base font-bold"
          style={{ color: "var(--color-text)" }}
          suppressHydrationWarning
        >
          {view.label}
        </h2>

        <button
          type="button"
          onClick={() => setMonthOffset((v) => v + 1)}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
          style={{ color: "var(--color-brand)" }}
        >
          &rsaquo;
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((initial, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            {initial}
          </div>
        ))}
      </div>

      {/* Fixed-height placeholder keeps the card from jumping on mount. */}
      {!mounted ? (
        <div className="h-[232px]" />
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: view.leadingBlanks }, (_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {view.days.map(({ dayOfMonth, blockIndex }) => {
            const isToday = blockIndex === TODAY_INDEX;
            const isFuture = blockIndex > TODAY_INDEX;
            const inRange = blockIndex >= rangeStart && blockIndex <= rangeEnd;
            const logged = !isFuture && isDayLogged(blockIndex);

            const cell = (
              <div
                className="flex aspect-square w-full items-center justify-center rounded-[var(--radius-sm)] border text-[11px] font-medium tabular-nums"
                style={{
                  borderColor: isToday
                    ? "var(--color-brand)"
                    : inRange
                      ? "color-mix(in srgb, var(--color-brand) 35%, var(--color-border))"
                      : "var(--color-border)",
                  borderWidth: isToday ? 2 : 1,
                  background: logged
                    ? "color-mix(in srgb, var(--color-brand) 10%, var(--color-surface))"
                    : "var(--color-surface)",
                  color: "var(--color-text)",
                  opacity: isFuture ? 0.3 : inRange ? 1 : 0.5,
                }}
              >
                {dayOfMonth}
              </div>
            );

            // Only elapsed days of the current block have a snapshot to open.
            const canOpen = !isFuture && blockIndex >= 0;
            if (!canOpen) return <div key={dayOfMonth}>{cell}</div>;

            return (
              <Link key={dayOfMonth} href={`/progress/day/${blockIndex}`}>
                {cell}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
