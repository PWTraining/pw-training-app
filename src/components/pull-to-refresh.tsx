"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TRIGGER = 72;
const MAX_PULL = 110;

// Drag down from the top of any screen to reload it, with the spinner that
// grows as you pull and spins while it's working.
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const active = useRef(false);

  useEffect(() => {
    function onStart(e: TouchEvent) {
      // Only a drag that begins at the very top is a refresh. Anywhere else
      // is ordinary scrolling and must be left alone.
      // A modal pins the body at scroll zero, which would otherwise look
      // exactly like being at the top of the page.
      if (document.documentElement.dataset.scrollLocked) return;
      if (window.scrollY > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    }

    function onMove(e: TouchEvent) {
      if (!active.current || startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;

      if (delta <= 0 || window.scrollY > 0) {
        active.current = false;
        setPull(0);
        return;
      }

      // Resistance, so it feels like it's pulling against something.
      setPull(Math.min(MAX_PULL, delta * 0.5));
      if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
      if (!active.current) return;
      active.current = false;
      startY.current = null;

      setPull((current) => {
        if (current >= TRIGGER) {
          setRefreshing(true);
          // Long enough to read as a refresh rather than a flicker.
          window.setTimeout(() => {
            router.refresh();
            setRefreshing(false);
            setPull(0);
          }, 650);
          return TRIGGER;
        }
        return 0;
      });
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);

    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [router, refreshing]);

  const offset = refreshing ? TRIGGER : pull;
  const progress = Math.min(1, offset / TRIGGER);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
        style={{
          height: offset,
          opacity: progress,
          transition: active.current ? "none" : "height 220ms ease, opacity 220ms ease",
        }}
      >
        <span
          className="mt-3 flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background: "var(--color-surface)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            transform: `scale(${0.6 + progress * 0.4}) rotate(${refreshing ? 0 : progress * 270}deg)`,
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="2.6"
            strokeLinecap="round"
            className={refreshing ? "animate-spin" : undefined}
          >
            <path d="M21 12a9 9 0 1 1-3.2-6.9" />
            <path d="M21 4v5h-5" />
          </svg>
        </span>
      </div>

      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: active.current ? "none" : "transform 220ms ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
