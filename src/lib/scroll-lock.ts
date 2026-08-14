"use client";

import { useEffect } from "react";

// Modals stack: a confirmation can open on top of the photo viewer, and both
// want the page held still. A count rather than a boolean means the last one
// to close is the one that releases it, not the first.
let locks = 0;
let restore: (() => void) | null = null;

function lock() {
  locks += 1;
  if (locks > 1) return;

  const scrollY = window.scrollY;
  const body = document.body;
  const previous = {
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow,
  };

  // Hiding overflow alone isn't enough on iOS, which happily scrolls the body
  // underneath anyway, so the page is pinned in place instead.
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.width = "100%";
  body.style.overflow = "hidden";
  // Pull-to-refresh reads this so a locked page can't be dragged down.
  document.documentElement.dataset.scrollLocked = "true";

  restore = () => {
    body.style.position = previous.position;
    body.style.top = previous.top;
    body.style.width = previous.width;
    body.style.overflow = previous.overflow;
    delete document.documentElement.dataset.scrollLocked;
    window.scrollTo(0, scrollY);
  };
}

function unlock() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  restore?.();
  restore = null;
}

// Freezes the page behind a modal and puts it back exactly where it was.
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
