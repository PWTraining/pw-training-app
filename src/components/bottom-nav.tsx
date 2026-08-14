"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// All five are emoji at one size so they carry the same weight. The old ⌂ was
// a thin text glyph and the barbell was missing its colour selector, which is
// why Home and Train looked lighter than the rest.
const TABS = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/train", label: "Train", icon: "🏋️" },
  // Route stays /progress so existing links keep working; the tab is named
  // for what's actually on it.
  { href: "/progress", label: "Habits", icon: "✓" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur"
      style={{
        borderColor: "var(--color-border)",
        background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
      }}
    >
      {/* Extra padding under the labels so they aren't sitting on the edge of
          the screen, on top of whatever the device reserves for itself. */}
      <div className="mx-auto flex max-w-md items-end pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);

          if (tab.href === "/progress") {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center gap-1 pb-2"
                style={{ color: "var(--color-success)" }}
              >
                <span
                  className="-mt-3 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold shadow-lg"
                  style={{
                    background: "var(--color-success)",
                    color: "#fff",
                    boxShadow: active
                      ? "0 0 0 3px color-mix(in srgb, var(--color-success) 30%, transparent)"
                      : "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                  aria-hidden
                >
                  {tab.icon}
                </span>
                <span className="text-xs font-semibold">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
              style={{
                color: active ? "var(--color-brand)" : "var(--color-text-muted)",
              }}
            >
              {/* No unread marker on the nav: it reads as an alarm sitting
                  on screen all day. The count lives on the chat rows. */}
              <span
                className="flex h-8 w-12 items-center justify-center rounded-full text-[22px] leading-none transition-colors"
                style={{
                  background: active
                    ? "color-mix(in srgb, var(--color-brand) 14%, transparent)"
                    : "transparent",
                }}
                aria-hidden
              >
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
