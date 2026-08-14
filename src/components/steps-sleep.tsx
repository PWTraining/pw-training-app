"use client";

import { useDailyLog, todayKey } from "@/lib/daily-log";

// Typed in by hand for now. A watch can't reach a web app directly — that
// needs Apple Health or Google Fit, which only a native app can read — so
// these are the same two numbers either way, just entered manually.
export function StepsAndSleep() {
  const { hydrated, entryFor, write } = useDailyLog();
  const key = todayKey();
  const entry = entryFor(key);

  const fields = [
    {
      id: "steps" as const,
      emoji: "👟",
      label: "Steps",
      unit: "",
      placeholder: "0",
      value: entry.steps ?? "",
    },
    {
      id: "sleepHours" as const,
      emoji: "😴",
      label: "Sleep",
      unit: "hrs",
      placeholder: "0.0",
      value: entry.sleepHours ?? "",
    },
  ];

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--color-text)" }}>
        Steps &amp; Sleep
      </h2>

      <div className="flex flex-col gap-2.5">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center gap-2">
            <span className="text-xl leading-none" aria-hidden>
              {field.emoji}
            </span>
            <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {field.label}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={hydrated ? field.value : ""}
              onChange={(e) => write(key, { [field.id]: e.target.value })}
              placeholder={field.placeholder}
              aria-label={field.label}
              className="w-24 rounded-[var(--radius-sm)] border px-3 py-2 text-right text-sm font-semibold tabular-nums outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />
            {/* Always rendered, so the two input boxes line up whether or not
                the row carries a unit. */}
            <span
              className="w-7 shrink-0 text-left text-xs font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {field.unit}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
