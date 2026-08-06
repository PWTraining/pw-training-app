"use client";

import { useMemo, useState } from "react";
import { useHabits } from "@/lib/habits-context";
import { MAX_ACTIVE_HABITS } from "@/lib/habits";
import {
  HABIT_CATALOG,
  CATEGORY_EMOJI,
  STRENGTH_COLOR,
  type CatalogEntry,
  type CatalogCategory,
} from "@/lib/habit-catalog";

const CATEGORIES: CatalogCategory[] = [
  "Sleep",
  "Digestion",
  "Body Composition",
  "Energy Levels & Fatigue",
  "Stress Tolerance & Anxiety",
];

export const QUICK_EMOJI = ["🎯", "💧", "🥗", "☀️", "📱", "🧘", "😴", "💪", "📚", "🚶"];

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AddHabitSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { habits, addHabit } = useHabits();
  const [mode, setMode] = useState<"browse" | "custom">("browse");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CatalogCategory | "All">("All");
  const [customEmoji, setCustomEmoji] = useState("🎯");
  const [customLabel, setCustomLabel] = useState("");
  const [why, setWhy] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<CatalogEntry | null>(null);

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const activeIds = useMemo(() => new Set(activeHabits.map((h) => h.id)), [activeHabits]);
  const atLimit = activeHabits.length >= MAX_ACTIVE_HABITS;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HABIT_CATALOG.filter((entry) => {
      if (category !== "All" && entry.category !== category) return false;
      if (q && !entry.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category]);

  if (!open) return null;

  function reset() {
    setWhy("");
    setSelectedEntry(null);
    setCustomLabel("");
  }

  function closeSheet() {
    reset();
    onClose();
  }

  function confirmFromCatalog() {
    if (!selectedEntry || atLimit) return;
    const reason = why.trim();
    if (!reason) return;
    addHabit({
      id: selectedEntry.id,
      emoji: CATEGORY_EMOJI[selectedEntry.category],
      label: selectedEntry.label,
      why: reason,
    });
    reset();
  }

  function addCustom() {
    if (atLimit) return;
    const label = customLabel.trim();
    const reason = why.trim();
    if (!label || !reason) return;
    addHabit({
      id: slugify(label) || `habit-${Date.now()}`,
      emoji: customEmoji || "🎯",
      label,
      why: reason,
    });
    reset();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={closeSheet} />
      <div
        className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-t-[var(--radius-lg)] p-4"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            Add a habit
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close"
            className="text-xl"
            style={{ color: "var(--color-text)" }}
          >
            ×
          </button>
        </div>

        {atLimit && (
          <p
            className="mb-3 rounded-[var(--radius-sm)] px-3 py-2 text-xs"
            style={{
              background: "color-mix(in srgb, var(--color-danger) 10%, transparent)",
              color: "var(--color-danger)",
            }}
          >
            You&rsquo;ve reached the {MAX_ACTIVE_HABITS} habit limit. Archive one first to add
            another.
          </p>
        )}

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("browse");
              reset();
            }}
            className="flex-1 rounded-full border py-1.5 text-xs font-medium"
            style={{
              borderColor: mode === "browse" ? "var(--color-brand)" : "var(--color-border)",
              background: mode === "browse" ? "var(--color-brand)" : "transparent",
              color: mode === "browse" ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
            }}
          >
            From Paul&rsquo;s list
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("custom");
              reset();
            }}
            className="flex-1 rounded-full border py-1.5 text-xs font-medium"
            style={{
              borderColor: mode === "custom" ? "var(--color-brand)" : "var(--color-border)",
              background: mode === "custom" ? "var(--color-brand)" : "transparent",
              color: mode === "custom" ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
            }}
          >
            Create my own
          </button>
        </div>

        {mode === "custom" ? (
          <div className="flex flex-col gap-3 pb-2">
            <div>
              <div
                className="mb-1.5 text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                Emoji — type to use your keyboard&rsquo;s picker, or pick one below
              </div>
              <input
                type="text"
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value.slice(0, 4))}
                className="w-16 rounded-[var(--radius-sm)] border px-3 py-2 text-center text-xl outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                }}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setCustomEmoji(e)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border text-lg"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                className="mb-1.5 text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                Habit name
              </div>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Read 10 pages"
                className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div>
              <div
                className="mb-1.5 text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                Why are you adding this?
              </div>
              <textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="e.g. I want to start running so I want to hydrate more"
                rows={2}
                className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={addCustom}
              disabled={!customLabel.trim() || !why.trim() || atLimit}
              className="rounded-[var(--radius-sm)] py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Add habit
            </button>
          </div>
        ) : selectedEntry ? (
          <div className="flex flex-col gap-3 pb-2">
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              className="self-start text-xs font-medium"
              style={{ color: "var(--color-brand)" }}
            >
              &lsaquo; Back to list
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none" aria-hidden>
                {CATEGORY_EMOJI[selectedEntry.category]}
              </span>
              <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {selectedEntry.label}
              </div>
            </div>

            <div>
              <div
                className="mb-1.5 text-xs font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                Why are you adding this?
              </div>
              <textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="e.g. I'm low in potassium so I want to track electrolytes"
                rows={2}
                className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <button
              type="button"
              onClick={confirmFromCatalog}
              disabled={!why.trim() || atLimit}
              className="rounded-[var(--radius-sm)] py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Add habit
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search interventions"
              className="mb-2.5 w-full rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />

            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
              {(["All", ...CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: category === cat ? "var(--color-brand)" : "var(--color-border)",
                    background: category === cat ? "var(--color-brand)" : "transparent",
                    color:
                      category === cat ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
                  }}
                >
                  {cat === "All" ? "All" : `${CATEGORY_EMOJI[cat]} ${cat}`}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2 pb-4">
                {filtered.map((entry) => {
                  const added = activeIds.has(entry.id);
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      disabled={added || atLimit}
                      onClick={() => setSelectedEntry(entry)}
                      className="flex items-start gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5 text-left disabled:opacity-50"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span className="mt-0.5 text-lg leading-none" aria-hidden>
                        {CATEGORY_EMOJI[entry.category]}
                      </span>
                      <div className="flex-1">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text)" }}
                        >
                          {entry.label}
                        </div>
                        {entry.notes && (
                          <div
                            className="text-[11px]"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {entry.notes}
                          </div>
                        )}
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: STRENGTH_COLOR[entry.strength],
                          color: "#1a1a1a",
                        }}
                      >
                        {added ? "Added" : entry.strength}
                      </span>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="py-6 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Nothing matches that search.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
