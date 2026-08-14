"use client";

import { useEffect } from "react";

// Freezes the page behind a modal. Hiding overflow alone isn't enough on iOS,
// which happily scrolls the body underneath anyway, so the page is pinned in
// place and put back exactly where it was on close.
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    // Pull-to-refresh reads this so a locked page can't be dragged down.
    document.documentElement.dataset.scrollLocked = "true";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      delete document.documentElement.dataset.scrollLocked;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
