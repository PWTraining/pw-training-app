"use client";

import { useHabits } from "@/lib/habits-context";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HabitHistorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { history } = useHabits();

  if (!open) return null;

  const entries = [...history].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative flex max-h-[70vh] w-full max-w-md flex-col rounded-t-[var(--radius-lg)] p-4"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            Habit changes
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl"
            style={{ color: "var(--color-text)" }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="py-6 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
              No changes yet, additions and removals will show up here.
            </p>
          ) : (
            <div className="flex flex-col gap-2 pb-2">
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] border px-3 py-2"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="text-xs" style={{ color: "var(--color-text)" }}>
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          entry.action === "added" ? "var(--color-success)" : "var(--color-danger)",
                      }}
                    >
                      {entry.action === "added" ? "Added" : "Removed"}
                    </span>{" "}
                    {entry.label}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                    {formatWhen(entry.at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
