"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/habits", label: "Habits", icon: "✓" },
  { href: "/train", label: "Train", icon: "🏋" },
  { href: "/portal", label: "Portal", icon: "▦" },
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
      <div className="mx-auto flex max-w-md items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
              style={{
                color: active ? "var(--color-brand)" : "var(--color-text-muted)",
              }}
            >
              <span className="text-lg leading-none" aria-hidden>
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
