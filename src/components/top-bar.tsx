"use client";

import { useState } from "react";
import { MenuButton, MenuDrawer } from "./menu-drawer";

export function TopBar({ title, right }: { title: string; right?: React.ReactNode }) {
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
        <div className="flex items-center gap-1">
          {right}
          <MenuButton onClick={() => setOpen(true)} />
        </div>
      </header>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
