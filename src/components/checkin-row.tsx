"use client";

import { useState } from "react";
import { adherenceColor, sliderFill, TODAY_INDEX } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";

export function CheckInRow({
  id,
  emoji,
  label,
  value,
  onChange,
  isLast,
  day,
  readOnly = false,
  why,
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
  // A saved day shows its values but doesn't take new input until reopened.
  readOnly?: boolean;
  // The client's reason for tracking this habit, surfaced without leaving
  // the check-in. Absent for Mind/Body/Spirit, which aren't habits.
  why?: string;
}) {
  const { commentFor, setComment } = useHabits();
  const targetDay = day ?? TODAY_INDEX;
  const saved = commentFor(id, targetDay);

  const [open, setOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [draft, setDraft] = useState(saved);

  const fill = adherenceColor(value);

  function startEditing() {
    setDraft(saved);
    setOpen(true);
  }

  function submit() {
    setComment(id, draft, targetDay);
    setOpen(false);
  }

  return (
    <div
      className="py-3"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--color-border)" }}
    >
      <div className="mb-1 flex items-center gap-1">
        <span className="text-2xl leading-none" aria-hidden>
          {emoji}
        </span>
        <span className="flex-1 pl-1.5 text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {label}
        </span>
        {why && (
          <button
            type="button"
            onClick={() => setWhyOpen(true)}
            aria-label={`Why ${label} matters`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            ⓘ
          </button>
        )}
        <button
          type="button"
          disabled={readOnly && !saved}
          onClick={() => (open ? setOpen(false) : startEditing())}
          aria-label={saved ? `Edit your comment on ${label}` : `Leave a comment on ${label}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ color: saved ? "var(--color-brand)" : "var(--color-text-muted)" }}
        >
          💬
        </button>
        <span
          className="w-14 shrink-0 text-right text-lg font-bold tabular-nums"
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
        disabled={readOnly}
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

      {/* The saved comment reads as plain text until tapped, so a past day
          shows as a snapshot rather than a form. */}
      {saved && !open && readOnly && (
        <p
          className="mt-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs"
          style={{
            background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            color: "var(--color-text)",
          }}
        >
          {saved}
        </p>
      )}

      {saved && !open && !readOnly && (
        <button
          type="button"
          onClick={startEditing}
          className="mt-2 w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-xs"
          style={{
            background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            color: "var(--color-text)",
          }}
        >
          {saved}
          <span className="ml-1.5 font-semibold" style={{ color: "var(--color-brand)" }}>
            Edit
          </span>
        </button>
      )}

      {whyOpen && why && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => setWhyOpen(false)}
          />
          <div
            className="relative w-full max-w-sm rounded-[var(--radius-lg)] p-4"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl leading-none" aria-hidden>
                {emoji}
              </span>
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Why {label}
              </h3>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              {why}
            </p>
            <button
              type="button"
              onClick={() => setWhyOpen(false)}
              className="mt-3 w-full rounded-[var(--radius-sm)] py-2 text-sm font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {open && !readOnly && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Leave a comment"
            rows={2}
            autoFocus
            className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-xs outline-none"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              {saved ? "Save" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
