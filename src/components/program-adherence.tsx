"use client";

import { AdherenceRing } from "./adherence-ring";
import type { Timeframe } from "@/lib/habits";

const ALL_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly", "Monthly", "Yearly"];

export function ProgramAdherence({
  values,
  timeframe,
  onTimeframeChange,
  timeframes = ALL_TIMEFRAMES,
  labels,
}: {
  values: Partial<Record<Timeframe, number>>;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  timeframes?: Timeframe[];
  labels?: Partial<Record<Timeframe, string>>;
}) {
  const pct = values[timeframe] ?? 0;
  const label = (tf: Timeframe) => labels?.[tf] ?? tf;

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
          Adherence
        </h2>
        {timeframes.length > 1 && (
          <div
            className="flex gap-0.5 rounded-full border p-0.5"
            style={{ borderColor: "var(--color-border)" }}
          >
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className="rounded-full px-2 py-1 text-[10px] font-medium"
                style={{
                  background: timeframe === tf ? "var(--color-brand)" : "transparent",
                  color:
                    timeframe === tf ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
                }}
              >
                {label(tf)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <AdherenceRing pct={pct} />
        <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {label(timeframe)}: {pct}%
        </div>
      </div>
    </section>
  );
}
