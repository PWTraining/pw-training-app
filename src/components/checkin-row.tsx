"use client";

import { useRef, useState } from "react";
import { adherenceColor, sliderFill, TODAY_INDEX } from "@/lib/habits";
import { useHabits } from "@/lib/habits-context";
import { useScrollLock } from "@/lib/scroll-lock";

// Matches the thumb width in globals.css. The thumb's centre can only reach
// half a thumb in from each end, so that's the range a touch maps onto.
const THUMB = 28;
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
    /* The divider runs the full width of the card, negative margins undoing
       the card's own padding, so each row reads as its own band. */
    <div
      className="py-3"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--color-border)",
        marginInline: "-1rem",
        paddingInline: "1rem",
      }}
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

      {/* The markers sit tight under the track. That space is what pays for
          the thicker slider without the row growing. */}
      <div className="mt-0.5 flex justify-between px-0.5">
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

      {/* Both drawn rather than typed. The old glyphs were thin outlines at
          text size and read as decoration rather than buttons. */}
      <div className="flex items-center justify-between">
        {why ? (
          <button
            type="button"
            onClick={() => setWhyOpen(true)}
            aria-label={`About ${label}`}
            className="-ml-1.5 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9.25" />
              <path d="M12 11.2v5.4" />
              <path d="M12 7.5v.2" strokeWidth="2.9" />
            </svg>
          </button>
        ) : (
          <span />
        )}

        {/* Comments stay open on a saved day. Writing one doesn't touch a
            score, so it never needs the day reopened first. */}
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : startEditing())}
          aria-label={saved ? `Edit your comment on ${label}` : `Leave a comment on ${label}`}
          className="-mr-1.5 flex h-11 w-11 items-center justify-center rounded-full"
          style={{ color: saved ? "var(--color-brand)" : "var(--color-text-muted)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20.5 11.7a7.8 7.8 0 0 1-8.5 7.8 8.6 8.6 0 0 1-2.9-.5L4 21l1.6-4.6a7.7 7.7 0 0 1-.8-3.4 7.8 7.8 0 0 1 8-7.7 7.8 7.8 0 0 1 7.7 6.4z" />
          </svg>
        </button>
      </div>

      {/* A saved comment sits there as text with no Edit label beside it.
          Tapping the text, or the bubble, opens it again. */}
      {saved && !open && (
        <button
          type="button"
          onClick={startEditing}
          className="mt-2 block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-xs"
          style={{
            background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            color: "var(--color-text)",
          }}
        >
          {saved}
        </button>
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
            <div className="flex items-start gap-2.5">
              <span className="text-2xl leading-none" aria-hidden>
                {emoji}
              </span>
              <h3 className="flex-1 text-xl font-bold" style={{ color: "var(--color-text)" }}>
                {label}
              </h3>
              {/* Two ways out: the cross up here, or the button at the
                  bottom. Nothing else on screen responds until one is used. */}
              <button
                type="button"
                onClick={() => setWhyOpen(false)}
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

      {open && (
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
