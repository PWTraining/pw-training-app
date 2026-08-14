"use client";

import Link from "next/link";
import { BLOCK_LENGTH, TODAY_INDEX, dateForDay } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

// Calendar for the current block. Elapsed days are tappable and open the day
// view so a missed day can be filled in; future days are inert.
export function BlockCalendar() {
  const { isDayLogged } = useHabits();

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
          Your Block
        </h2>
        <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          Tap a day to fill it in
        </span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {Array.from({ length: BLOCK_LENGTH }, (_, i) => {
          const date = dateForDay(i);
          const isToday = i === TODAY_INDEX;
          const isFuture = i > TODAY_INDEX;
          const logged = !isFuture && isDayLogged(i);

          const cell = (
            // Date numbers resolve in the viewer's timezone, which the server
            // doesn't know, so let the client's value win over the prerender.
            <div
              suppressHydrationWarning
              className="flex aspect-square w-full flex-col items-center justify-center rounded-[var(--radius-sm)] border text-[11px] font-medium tabular-nums"
              style={{
                borderColor: isToday ? "var(--color-brand)" : "var(--color-border)",
                borderWidth: isToday ? 2 : 1,
                background: logged
                  ? "color-mix(in srgb, var(--color-brand) 10%, var(--color-surface))"
                  : "var(--color-surface)",
                color: isFuture ? "var(--color-text-muted)" : "var(--color-text)",
                opacity: isFuture ? 0.35 : 1,
              }}
            >
              {date.getDate()}
            </div>
          );

          if (isFuture) return <div key={i}>{cell}</div>;

          return (
            <Link
              key={i}
              href={`/progress/day/${i}`}
              aria-label={`Fill in ${date.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}`}
            >
              {cell}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
