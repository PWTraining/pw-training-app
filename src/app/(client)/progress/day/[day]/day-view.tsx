"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayCheckIn } from "@/components/day-checkin";
import { TODAY_INDEX, fullDate } from "@/lib/habits";

export function DayView({ day }: { day: number }) {
  const router = useRouter();

  const isValid = Number.isInteger(day) && day >= 0 && day <= TODAY_INDEX;
  const hasPrev = day > 0;
  // Future days can't be filled in, so forward stops at today.
  const hasNext = day < TODAY_INDEX;

  if (!isValid) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          That day isn&rsquo;t part of the current block.
        </p>
        <Link href="/progress" className="text-sm font-medium" style={{ color: "var(--color-brand)" }}>
          Back to Progress
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header
        className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-3 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        }}
      >
        <Link
          href="/progress"
          className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
          style={{ color: "var(--color-brand)" }}
        >
          &lsaquo; Back
        </Link>

        <div className="flex-1 text-center">
          {/* Dates resolve in the viewer's timezone, which the server doesn't
              know, so let the client's value win over the prerendered one. */}
          <div
            className="text-base font-bold"
            style={{ color: "var(--color-text)" }}
            suppressHydrationWarning
          >
            {fullDate(day)}
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            {day === TODAY_INDEX ? "Today's check-in" : "Check-in"}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => router.push(`/progress/day/${day - 1}`)}
            className="rounded-full px-2 py-1 text-xs font-semibold disabled:opacity-30"
            style={{ color: "var(--color-brand)" }}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => router.push(`/progress/day/${day + 1}`)}
            className="rounded-full px-2 py-1 text-xs font-semibold disabled:opacity-30"
            style={{ color: "var(--color-brand)" }}
          >
            Next
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        <DayCheckIn day={day} />
      </div>
    </div>
  );
}
