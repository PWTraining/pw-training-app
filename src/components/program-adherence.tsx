"use client";

import { AdherenceRing } from "./adherence-ring";
import { adherenceColor, type Timeframe } from "@/lib/habits";

const ALL_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly", "Monthly", "Yearly"];

export type AdherencePart = { label: string; pct: number };

export function ProgramAdherence({
  values,
  timeframe,
  onTimeframeChange,
  timeframes = ALL_TIMEFRAMES,
  labels,
  parts,
}: {
  values: Partial<Record<Timeframe, number>>;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  timeframes?: Timeframe[];
  labels?: Partial<Record<Timeframe, string>>;
  // What the number is made of. Without this the score reads as arbitrary.
  parts?: AdherencePart[];
}) {
  const pct = values[timeframe] ?? 0;
  const label = (tf: Timeframe) => labels?.[tf] ?? tf;

  return (
    <section
      className="rounded-[var(--radius-lg)] border-2 p-4"
      style={{ borderColor: "color-mix(in srgb, var(--color-brand) 45%, var(--color-border))" }}
    >
      <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
        Overall Adherence
      </h2>

      {/* Full-width segmented control on its own line. Sharing a row with the
          heading is what kept these targets too small to hit. */}
      {timeframes.length > 1 && (
        <div
          className="mt-2.5 flex gap-1 rounded-full p-1"
          style={{ background: "var(--color-surface-raised)" }}
        >
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className="flex h-10 flex-1 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: timeframe === tf ? "var(--color-brand)" : "transparent",
                color: timeframe === tf ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
              }}
            >
              {label(tf)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <AdherenceRing pct={pct} />

        {parts?.length ? (
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {parts.map((part) => (
              <div key={part.label} className="flex items-center gap-2">
                <span
                  className="w-24 shrink-0 truncate text-xs font-medium"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {part.label}
                </span>
                <span
                  className="h-2 flex-1 overflow-hidden rounded-full"
                  style={{ background: "var(--color-surface-raised)" }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(2, part.pct)}%`,
                      background: adherenceColor(part.pct),
                    }}
                  />
                </span>
                <span
                  className="w-9 shrink-0 text-right text-xs font-bold tabular-nums"
                  style={{ color: "var(--color-text)" }}
                >
                  {part.pct}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {label(timeframe)}: {pct}%
          </div>
        )}
      </div>
    </section>
  );
}
