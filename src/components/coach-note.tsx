"use client";

import { useEffect, useState } from "react";
import { TODAY_INDEX } from "@/lib/habits";

const REPLY_KEY = "pw-coach-note-replies";

// The client's reply to a given day's note. Kept per day so an older note and
// its reply stay together once the day view can show them.
function useReply(day: number) {
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REPLY_KEY);
      if (raw) setReplies(JSON.parse(raw) as Record<number, string>);
    } catch {
      // Nothing saved, or storage is unavailable. Start empty.
    }
    setHydrated(true);
  }, []);

  function save(text: string) {
    const next = { ...replies, [day]: text };
    setReplies(next);
    try {
      window.localStorage.setItem(REPLY_KEY, JSON.stringify(next));
    } catch {
      // Note is still on screen for this visit.
    }
  }

  return { reply: hydrated ? (replies[day] ?? "") : "", save };
}

export function CoachNote({ note, day = TODAY_INDEX }: { note: string; day?: number }) {
  const { reply, save } = useReply(day);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!note) return null;

  return (
    <section
      className="rounded-[var(--radius-lg)] border-2 p-4"
      style={{ background: "var(--color-note)", borderColor: "var(--color-brand-red)" }}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
          style={{ background: "var(--color-brand-red)" }}
          aria-hidden
        >
          ❗
        </span>
        <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          Coach&rsquo;s Note
        </div>
      </div>

      <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--color-text)" }}>
        {note}
      </p>

      <div
        className="mt-3 border-t pt-3"
        style={{ borderColor: "color-mix(in srgb, var(--color-brand-red) 25%, transparent)" }}
      >
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write back to your coach"
              rows={2}
              autoFocus
              className="w-full resize-none rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  save(draft);
                  setEditing(false);
                }}
                className="rounded-[var(--radius-sm)] px-4 py-2 text-xs font-semibold"
                style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-[var(--radius-sm)] border px-4 py-2 text-xs font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {reply && (
              <p className="mb-2 text-sm italic leading-relaxed" style={{ color: "var(--color-text)" }}>
                {reply}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setDraft(reply);
                setEditing(true);
              }}
              className="text-xs font-semibold"
              style={{ color: "var(--color-brand)" }}
            >
              {reply ? "Edit your note" : "Leave a note"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
