"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MenuButton, MenuDrawer } from "./menu-drawer";
import { Logo } from "./logo";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Each tab is its own starting point. The five tab roots have nothing above
  // them, so they carry no back button; anything deeper goes back to the tab
  // it belongs to rather than retracing however you got there.
  const tabRoot = `/${pathname.split("/")[1] ?? ""}`;
  const showBack = pathname !== tabRoot;

  function goBack() {
    router.push(tabRoot);
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
