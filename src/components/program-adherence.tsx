"use client";

import { useState } from "react";
import { AdherenceRing } from "./adherence-ring";
import { adherenceColor, type Timeframe } from "@/lib/habits";
import { useScrollLock } from "@/lib/scroll-lock";

const ALL_TIMEFRAMES: Timeframe[] = ["Daily", "Weekly", "Monthly", "Yearly"];

export type AdherencePart = { label: string; pct: number };

// One line per thing being counted, so "why am I not at 100" has an answer
// rather than being left to guesswork.
export type AdherenceItem = { label: string; pct: number; group: string };

export function ProgramAdherence({
  values,
  timeframe,
  onTimeframeChange,
  timeframes = ALL_TIMEFRAMES,
  labels,
  parts,
  items,
}: {
  values: Partial<Record<Timeframe, number>>;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  timeframes?: Timeframe[];
  labels?: Partial<Record<Timeframe, string>>;
  // What the number is made of. Without this the score reads as arbitrary.
  parts?: AdherencePart[];
  // Every individual item behind those parts, for the breakdown.
  items?: AdherenceItem[];
}) {
  const pct = values[timeframe] ?? 0;
  const label = (tf: Timeframe) => labels?.[tf] ?? tf;

  const [open, setOpen] = useState(false);
  useScrollLock(open);

  const shortfalls = (items ?? []).filter((item) => item.pct < 100);

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

      {items?.length ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-1 py-1 text-sm font-bold"
            style={{ color: "var(--color-brand)" }}
          >
            View &rsaquo;
          </button>
        </div>
      ) : null}

      {open && items && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative flex max-h-[80vh] w-full max-w-sm flex-col rounded-[var(--radius-lg)] p-5"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="flex items-start gap-2">
              <h3 className="flex-1 text-xl font-bold" style={{ color: "var(--color-text)" }}>
                {label(timeframe)}: {pct}%
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-2 -mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ color: "var(--color-text-muted)" }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-3 min-h-0 overflow-y-auto">
              {shortfalls.length === 0 ? (
                <p className="text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
                  Everything is at 100%. Nothing outstanding.
                </p>
              ) : (
                <>
                  <p className="text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
                    To reach 100% you still need:
                  </p>
                  <ul className="mt-3 flex flex-col">
                    {shortfalls.map((item, i) => (
                      <li
                        key={`${item.group}-${item.label}`}
                        className="flex items-center gap-3 py-2.5"
                        style={{
                          borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                        }}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className="block text-sm font-semibold"
                            style={{ color: "var(--color-text)" }}
                          >
                            {item.label}
                          </span>
                          <span className="block text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {item.group}
                          </span>
                        </span>
                        <span
                          className="shrink-0 text-sm font-bold tabular-nums"
                          style={{ color: adherenceColor(item.pct) }}
                        >
                          {item.pct}%
                        </span>
                        <span
                          className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          +{100 - item.pct}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full shrink-0 rounded-[var(--radius-sm)] py-3 text-sm font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
