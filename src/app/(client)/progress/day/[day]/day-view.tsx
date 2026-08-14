"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayCheckIn } from "@/components/day-checkin";
import { BLOCK_LENGTH, TODAY_INDEX, formatDay, dateForDay } from "@/lib/habits";

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
          aria-label="Back to progress"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
          style={{ color: "var(--color-text)" }}
        >
          &lsaquo;
        </Link>

        <div className="flex-1 text-center">
          {/* Dates resolve in the viewer's timezone, which the server doesn't
              know, so let the client's value win over the prerendered one. */}
          <div
            className="text-base font-bold"
            style={{ color: "var(--color-text)" }}
            suppressHydrationWarning
          >
            {formatDay(day)}
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            Day {day + 1} of {BLOCK_LENGTH}
          </div>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => router.push(`/progress/day/${day - 1}`)}
            aria-label="Previous day"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl disabled:opacity-30"
            style={{ color: "var(--color-text)" }}
          >
            &lsaquo;
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => router.push(`/progress/day/${day + 1}`)}
            aria-label="Next day"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl disabled:opacity-30"
            style={{ color: "var(--color-text)" }}
          >
            &rsaquo;
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-4 pt-4 pb-6">
        {day < TODAY_INDEX && (
          <p
            className="rounded-[var(--radius-md)] border px-3 py-2 text-xs"
            style={{
              borderColor: "color-mix(in srgb, var(--color-brand) 30%, var(--color-border))",
              background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
              color: "var(--color-text-muted)",
            }}
          >
            Filling in{" "}
            <b style={{ color: "var(--color-text)" }} suppressHydrationWarning>
              {dateForDay(day).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </b>
            .
          </p>
        )}

        <DayCheckIn day={day} />
      </div>
    </div>
  );
}
