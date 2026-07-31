"use client";

import { useState } from "react";
import { AdherenceRing } from "./adherence-ring";

export type Timeframe = "Daily" | "Weekly" | "Monthly" | "Yearly";

const TIMEFRAMES: Timeframe[] = ["Daily", "Weekly", "Monthly", "Yearly"];

export function ProgramAdherence({ values }: { values: Record<Timeframe, number> }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");
  const pct = values[timeframe];

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Program Adherence
        </h2>
        <div
          className="flex gap-0.5 rounded-full border p-0.5"
          style={{ borderColor: "var(--color-border)" }}
        >
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className="rounded-full px-2 py-1 text-[10px] font-medium"
              style={{
                background: timeframe === tf ? "var(--color-brand)" : "transparent",
                color:
                  timeframe === tf ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <AdherenceRing pct={pct} />
        <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {timeframe}: {pct}%
        </div>
      </div>
    </section>
  );
}
