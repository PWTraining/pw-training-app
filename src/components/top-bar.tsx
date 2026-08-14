"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MenuButton, MenuDrawer } from "./menu-drawer";
import { Logo } from "./logo";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Home is the one screen you can't have arrived at from somewhere else.
  // Every other screen can be reached by tapping through — including the
  // other tabs, e.g. Today's Session opening Train from Home — so they all
  // keep a way back.
  const showBack = pathname !== "/home";

  function goBack() {
    // A page opened cold (shared link, refresh, home-screen shortcut) has
    // nothing to pop, so send those to Home rather than out of the app.
    if (window.history.length > 1) router.back();
    else router.push("/home");
  }

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
              onClick={goBack}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ color: "var(--color-brand)" }}
            >
              {/* Drawn rather than typed: the chevron glyph is thin and sits
                  off-centre in its own line box at this size. */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 5 8 12l7 7" />
              </svg>
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
