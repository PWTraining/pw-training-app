"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { DayCheckIn } from "@/components/day-checkin";
import { DailyReflection } from "@/components/daily-reflection";
import { Moments } from "@/components/moments";
import { TODAY_INDEX, fullDate } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

export function DayView({ day }: { day: number }) {
  const router = useRouter();
  const { isDayClosed, setDayClosed } = useHabits();

  // Days run backwards indefinitely so earlier blocks stay reachable; only
  // the future is off limits.
  const isValid = Number.isInteger(day) && day <= TODAY_INDEX;
  const hasNext = day < TODAY_INDEX;
  const closed = isDayClosed(day);

  if (!isValid) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          That day hasn&rsquo;t happened yet.
        </p>
        <Link href="/progress" className="text-sm font-medium" style={{ color: "var(--color-brand)" }}>
          Back to Progress
        </Link>
      </div>
    );
  }

  return (
    <div>
      <TopBar />

      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Dates resolve in the viewer's timezone, which the server doesn't
            know, so let the client's value win over the prerendered one. */}
        <div
          className="flex-1 text-base font-bold"
          style={{ color: "var(--color-text)" }}
          suppressHydrationWarning
        >
          {fullDate(day)}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => router.push(`/progress/day/${day - 1}`)}
            className="rounded-full px-1.5 py-1 text-xs font-semibold"
            style={{ color: "var(--color-brand)" }}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => router.push(`/progress/day/${day + 1}`)}
            className="rounded-full px-1.5 py-1 text-xs font-semibold disabled:opacity-30"
            style={{ color: "var(--color-brand)" }}
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        {/* A finished day sits saved rather than permanently open. Reopening
            is one tap, and saving puts it away again. */}
        {closed ? (
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
              This day is saved.
            </span>
            <button
              type="button"
              onClick={() => setDayClosed(day, false)}
              className="rounded-full px-2 py-1 text-xs font-semibold"
              style={{ color: "var(--color-brand)" }}
            >
              Edit day
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5"
            style={{
              borderColor: "color-mix(in srgb, var(--color-brand) 35%, var(--color-border))",
              background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            }}
          >
            <span className="flex-1 text-xs" style={{ color: "var(--color-text)" }}>
              {day === TODAY_INDEX ? "Today is still open." : "Editing this day."}
            </span>
            <button
              type="button"
              onClick={() => setDayClosed(day, true)}
              className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Save day
            </button>
          </div>
        )}

        <DayCheckIn day={day} readOnly={closed} />
        <DailyReflection day={day} />
        <Moments day={day} />
      </div>
    </div>
  );
}
