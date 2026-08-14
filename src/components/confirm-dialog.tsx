"use client";

import { useScrollLock } from "@/lib/scroll-lock";

// One confirmation for every destructive action in the app, so nothing is
// ever a single tap away from being gone.
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useScrollLock(open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <button type="button" aria-label="Cancel" className="absolute inset-0" onClick={onCancel} />

      <div
        className="relative w-full max-w-sm rounded-[var(--radius-lg)] p-5"
        style={{ background: "var(--color-surface)" }}
      >
        <h3 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          {title}
        </h3>
        {body && (
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {body}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[var(--radius-sm)] border py-3 text-sm font-semibold"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-[var(--radius-sm)] py-3 text-sm font-semibold"
            style={{ background: "var(--color-danger)", color: "#fff" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
