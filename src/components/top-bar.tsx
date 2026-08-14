"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MenuButton, MenuDrawer } from "./menu-drawer";
import { Logo } from "./logo";

// The tab roots are landing places — there's nothing behind them, so they
// get no back control. Anything deeper was navigated into and does.
const TAB_ROOTS = ["/home", "/train", "/progress", "/chat", "/profile"];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const showBack = !TAB_ROOTS.includes(pathname);

  return (
    <>
      {/* Equal 1fr side columns put the logo at the centre of the bar itself,
          not the centre of whatever space the controls leave over. */}
      <header
        className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center border-b px-2 py-1.5 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        }}
      >
        <div className="justify-self-start">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none"
              style={{ color: "var(--color-brand)" }}
            >
              <span aria-hidden>&#8249;</span>
            </button>
          )}
        </div>

        <div className="justify-self-center">
          <Logo />
        </div>

        <div className="justify-self-end">
          <MenuButton onClick={() => setOpen(true)} />
        </div>
      </header>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
