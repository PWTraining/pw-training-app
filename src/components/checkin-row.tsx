"use client";

import { useRef, useState } from "react";
import { adherenceColor, sliderFill, TODAY_INDEX } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";
import { useScrollLock } from "@/lib/scroll-lock";

// Matches the thumb width in globals.css. The thumb's centre can only reach
// half a thumb in from each end, so that's the range a touch maps onto.
const THUMB = 22;
const STEP = 10;

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

  const slider = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const fill = adherenceColor(value);

  // While the description is open the page behind it holds still, and the
  // only thing that moves is the text itself.
  useScrollLock(whyOpen);

  // Touching the track anywhere jumps the value to that spot and keeps
  // following the finger, so setting a value is one movement rather than
  // find-the-dot then drag it.
  function valueAt(clientX: number) {
    const el = slider.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    const usable = rect.width - THUMB;
    const ratio = usable > 0 ? (clientX - rect.left - THUMB / 2) / usable : 0;
    const clamped = Math.min(1, Math.max(0, ratio));
    return Math.round((clamped * 100) / STEP) * STEP;
  }

  function trackPointer(e: React.PointerEvent<HTMLInputElement>) {
    if (readOnly) return;
    const next = valueAt(e.clientX);
    if (next !== value) onChange(next);
  }

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
      {/* Name and score on top, controls underneath: the top of the row was
          getting crowded once both buttons were finger-sized. */}
      <div className="mb-1 flex items-center gap-1">
        <span className="text-2xl leading-none" aria-hidden>
          {emoji}
        </span>
        <span className="flex-1 pl-1.5 text-sm font-medium" style={{ color: "var(--color-text)" }}>
          {label}
        </span>
        <span
          className="w-14 shrink-0 text-right text-lg font-bold tabular-nums"
          style={{ color: fill }}
        >
          {value}%
        </span>
      </div>

      <input
        ref={slider}
        type="range"
        className="slider"
        min={0}
        max={100}
        step={STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={(e) => {
          if (readOnly) return;
          dragging.current = true;
          // Capture keeps the events coming even if the finger wanders off
          // the track, but the drag flag is what actually gates the move.
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Not supported here; the flag alone still works.
          }
          trackPointer(e);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          trackPointer(e);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onLostPointerCapture={() => {
          dragging.current = false;
        }}
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

      <div className="mt-1 flex items-center justify-between">
        {why ? (
          <button
            type="button"
            onClick={() => setWhyOpen(true)}
            aria-label={`About ${label}`}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            ⓘ
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          disabled={readOnly && !saved}
          onClick={() => (open ? setOpen(false) : startEditing())}
          aria-label={saved ? `Edit your comment on ${label}` : `Leave a comment on ${label}`}
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-lg"
          style={{ color: saved ? "var(--color-brand)" : "var(--color-text-muted)" }}
        >
          💬
        </button>
      </div>

      {/* A saved comment just sits there as text. Changing it is the comment
          button again, so there's no second control saying the same thing. */}
      {saved && !open && (
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

      {/* Centred, and only as tall as the text needs. Long entries scroll
          inside the card rather than pushing the button off screen. */}
      {whyOpen && why && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => setWhyOpen(false)}
          />
          <div
            className="relative flex max-h-[80vh] w-full max-w-sm flex-col rounded-[var(--radius-lg)] p-5"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none" aria-hidden>
                {emoji}
              </span>
              <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                {label}
              </h3>
            </div>

            <div className="mt-4 min-h-0 overflow-y-auto">
              <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                Description
              </div>
              <p
                className="mt-1.5 whitespace-pre-wrap text-base leading-relaxed"
                style={{ color: "var(--color-text)" }}
              >
                {why}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setWhyOpen(false)}
              className="mt-5 w-full shrink-0 rounded-[var(--radius-sm)] py-3 text-sm font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              Close
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
