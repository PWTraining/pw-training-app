"use client";

import { useState } from "react";
import { MenuButton, MenuDrawer } from "./menu-drawer";
import { Wordmark } from "./wordmark";

export function TopBar() {
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
        <MenuButton onClick={() => setOpen(true)} />
        <Wordmark />
      </header>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
