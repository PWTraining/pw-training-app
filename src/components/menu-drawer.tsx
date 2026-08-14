"use client";

import { useState } from "react";
import { HabitHistorySheet } from "./habit-history-sheet";

const MENU_ITEMS = [
  "Community chat",
  "Resources",
  "Other ways to work with Paul",
  "Progress photos",
  "Habit history",
  "My to-do list",
  "Food resources",
  "Settings",
];

export function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
      style={{ color: "var(--color-text)" }}
    >
      {/* Drawn rather than the ☰ character, which is thin and small for its
          point size. This matches the weight of the back chevron. */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!open) return null;

  function handleItem(item: string) {
    if (item === "Habit history") {
      setHistoryOpen(true);
      return;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close menu" className="flex-1 bg-black/40" onClick={onClose} />
      <div
        className="flex h-full w-72 flex-col gap-1 p-4"
        style={{ background: "var(--color-surface-raised)" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-xl"
            style={{ color: "var(--color-text)" }}
          >
            ×
          </button>
        </div>
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleItem(item)}
            className="rounded-lg px-3 py-2.5 text-left text-sm"
            style={{ color: "var(--color-text)" }}
          >
            {item}
          </button>
        ))}
      </div>

      <HabitHistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}
