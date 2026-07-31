"use client";

const MENU_ITEMS = [
  "Community chat",
  "Resources",
  "Other ways to work with Paul",
  "Progress photos",
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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl"
      style={{ color: "var(--color-text)" }}
    >
      ☰
    </button>
  );
}

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

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
            className="rounded-lg px-3 py-2.5 text-left text-sm"
            style={{ color: "var(--color-text)" }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
