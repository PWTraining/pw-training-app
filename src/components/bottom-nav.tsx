"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/train", label: "Train", icon: "🏋" },
  { href: "/progress", label: "Progress", icon: "✓" },
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
      <div className="mx-auto flex max-w-md items-end pb-[env(safe-area-inset-bottom)]">
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
                  className="-mt-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold shadow-lg"
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
              <span
                className="flex h-7 w-11 items-center justify-center rounded-full text-lg leading-none transition-colors"
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
