"use client";

import { useEffect, useState } from "react";
import { useDailyLog, todayKey, type TrackerId } from "@/lib/daily-log";

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// Weight, steps and sleep are all the same shape: one number a day, a save,
// and a comment. One card so they can't drift apart.
export function TrackerCard({
  id,
  emoji,
  label,
  unit,
  placeholder,
  showChange = false,
}: {
  id: TrackerId;
  emoji: string;
  label: string;
  unit?: string;
  placeholder: string;
  // Only weight reads as a trend against the last entry.
  showChange?: boolean;
}) {
  const { hydrated, trackerFor, write, previousValue } = useDailyLog();
  const key = todayKey();
  const entry = trackerFor(key, id);
  const previous = showChange ? previousValue(key, id) : null;

  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    setDraft(entry.value);
  }, [entry.value]);

  const change =
    showChange && entry.value && previous ? Number(entry.value) - Number(previous.value) : null;
  const showForm = !hydrated || editing || !entry.value;

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <span className="text-base leading-none" aria-hidden>
            {emoji}
          </span>
          {label}
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full px-2 py-1 text-xs font-semibold"
            style={{ color: "var(--color-brand)" }}
          >
            Edit
          </button>
        )}
      </div>

      {showForm ? (
        <div className="flex items-center gap-2">
          <span className="flex flex-1 items-center gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              aria-label={unit ? `${label} in ${unit}` : label}
              className="w-28 rounded-[var(--radius-sm)] border px-3 py-2.5 text-lg font-bold tabular-nums outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />
            {unit && (
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
                {unit}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              write(key, id, { value: draft.trim() });
              setEditing(false);
            }}
            disabled={!draft.trim() && !entry.value}
            className="rounded-[var(--radius-sm)] px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
            {entry.value}
            {unit && <span className="text-base font-semibold"> {unit}</span>}
          </span>
          {change !== null && Number.isFinite(change) && previous && (
            <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
              {change > 0 ? "+" : ""}
              {change.toFixed(1)} {unit} since {prettyDate(previous.date)}
            </span>
          )}
        </div>
      )}

      {/* Same comment behaviour as a check-in row: bubble bottom right, the
          saved text sits above it, and the bubble reopens it. */}
      {entry.comment && !commentOpen && (
        <p
          className="mt-3 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs"
          style={{
            background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            color: "var(--color-text)",
          }}
        >
          {entry.comment}
        </p>
      )}

      <div className="mt-1 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setCommentDraft(entry.comment);
            setCommentOpen((v) => !v);
          }}
          aria-label={entry.comment ? `Edit your comment on ${label}` : `Leave a comment on ${label}`}
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-lg"
          style={{ color: entry.comment ? "var(--color-brand)" : "var(--color-text-muted)" }}
        >
          💬
        </button>
      </div>

      {commentOpen && (
        <div className="flex flex-col gap-2">
          <textarea
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
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
              onClick={() => {
                write(key, id, { comment: commentDraft });
                setCommentOpen(false);
              }}
              className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              {entry.comment ? "Save" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => setCommentOpen(false)}
              className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
