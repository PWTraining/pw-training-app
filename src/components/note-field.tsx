"use client";

import { useEffect, useState } from "react";

// The same comment control used on the check-in rows: bubble on the right,
// saved text sitting above it, tap either to open the editor.
export function NoteField({
  value,
  onSave,
  label,
  readOnly = false,
  placeholder = "Leave a comment",
}: {
  value: string;
  onSave: (text: string) => void;
  label: string;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <>
      {value && !open && (
        <button
          type="button"
          onClick={() => !readOnly && setOpen(true)}
          className="mt-2 block w-full rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-xs"
          style={{
            background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))",
            color: "var(--color-text)",
          }}
        >
          {value}
        </button>
      )}

      {!open && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setOpen(true)}
            aria-label={value ? `Edit your comment on ${label}` : `Leave a comment on ${label}`}
            className="-mr-1.5 flex h-11 w-11 items-center justify-center rounded-full text-xl disabled:opacity-30"
            style={{ opacity: value ? 1 : 0.55 }}
          >
            💬
          </button>
        </div>
      )}

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
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
                onSave(draft);
                setOpen(false);
              }}
              className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold"
              style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
            >
              {value ? "Save" : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(value);
                setOpen(false);
              }}
              className="rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
