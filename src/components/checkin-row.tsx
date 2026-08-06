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
}: {
  id: string;
  emoji: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  isLast?: boolean;
}) {
  const { commentsFor, addComment } = useHabits();
  const [showComment, setShowComment] = useState(false);
  const [draft, setDraft] = useState("");

  const fill = adherenceColor(value);
  const comments = commentsFor(id);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    addComment(id, text);
    setDraft("");
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
          aria-label={`Comment on ${label}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs"
          style={{
            borderColor: comments.length > 0 ? "var(--color-brand)" : "var(--color-border)",
            color: comments.length > 0 ? "var(--color-brand)" : "var(--color-text-muted)",
          }}
        >
          💬
        </button>
        <span className="text-sm font-semibold tabular-nums" style={{ color: fill }}>
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
        <div className="mt-2.5 flex flex-col gap-2">
          {comments.length > 0 && (
            <div className="flex flex-col gap-1">
              {comments.map((c, i) => (
                <div key={i} className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  {c.text}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={`Leave a note on ${label} (optional)`}
              className="flex-1 rounded-[var(--radius-sm)] border px-3 py-2 text-xs outline-none"
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
        </div>
      )}
    </div>
  );
}
