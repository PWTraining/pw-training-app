"use client";

import { useState } from "react";
import { adherenceColor, sliderFill } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

export function CheckInRow({
  id,
  emoji,
  label,
  value,
  onChange,
  isLast,
  day,
}: {
  id: string;
  emoji: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  isLast?: boolean;
  // Which day of the block a comment is filed against. Defaults to today,
  // set explicitly when the row is editing a past day.
  day?: number;
}) {
  const { commentsFor, addComment } = useHabits();
  const [showComment, setShowComment] = useState(false);
  const [draft, setDraft] = useState("");

  const fill = adherenceColor(value);
  const comments = commentsFor(id);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    addComment(id, text, day);
    setDraft("");
    setShowComment(false);
  }

  return (
    <div
      className="py-3"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--color-border)" }}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span className="text-2xl leading-none" aria-hidden>
          {emoji}
        </span>
        <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {label}
        </span>
        <button
          type="button"
          onClick={() => setShowComment((v) => !v)}
          aria-label={`Leave a comment on ${label}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-sm"
          style={{
            color: comments.length > 0 ? "var(--color-brand)" : "var(--color-text-muted)",
          }}
        >
          💬
        </button>
        <span
          className="w-10 text-right text-sm font-semibold tabular-nums"
          style={{ color: fill }}
        >
          {value}%
        </span>
      </div>

      <input
        type="range"
        className="slider"
        min={0}
        max={100}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{ "--slider-fill": sliderFill(value) } as React.CSSProperties}
      />

      <div className="mt-1 flex justify-between px-0.5">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
          <span
            key={tick}
            className="text-[8px] tabular-nums"
            style={{ color: "var(--color-text-muted)" }}
          >
            {tick}%
          </span>
        ))}
      </div>

      {showComment && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Leave a comment"
            className="flex-1 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="button"
            onClick={submit}
            className="rounded-[var(--radius-sm)] px-3 text-xs font-medium"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
