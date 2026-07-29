"use client";

import { useState } from "react";

const MENU_ITEMS = [
  "Community chat",
  "Resources",
  "Other ways to work with Paul",
  "Progress photos",
  "My to-do list",
  "Food resources",
  "Settings",
];

export function TopBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        }}
      >
        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
          style={{ color: "var(--color-text)" }}
        >
          ☰
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close menu"
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          />
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
                onClick={() => setOpen(false)}
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
                className="rounded-lg px-3 py-2.5 text-left text-sm"
                style={{ color: "var(--color-text)" }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
