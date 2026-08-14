"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/lib/scroll-lock";

const OUT_W = 720;
const OUT_H = 960; // 3:4, the shape the photo tiles are cut to
const MAX_SCALE = 4;

// Pinch and drag the picture inside a fixed 3:4 window, then keep what's in
// the window. Same gesture model as the viewer, so it's one thing to learn.
export function PhotoCropper({
  src,
  onCancel,
  onDone,
}: {
  src: string;
  onCancel: () => void;
  onDone: (croppedSrc: string) => void;
}) {
  useScrollLock(true);

  const frame = useRef<HTMLDivElement>(null);
  const frameArea = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });

  // The largest 3:4 box that fits the space available, recalculated if the
  // window turns or resizes.
  useEffect(() => {
    const area = frameArea.current;
    if (!area) return;

    const measure = () => {
      const { width, height } = area.getBoundingClientRect();
      const h = Math.min(height, (width * OUT_H) / OUT_W);
      setFrameSize({ w: Math.round((h * OUT_W) / OUT_H), h: Math.round(h) });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef({ dist: 0, scale: 1, mid: { x: 0, y: 0 }, offset: { x: 0, y: 0 } });

  useEffect(() => {
    const img = new Image();
    img.onload = () => setReady(true);
    img.src = src;
  }, [src]);

  function centreAndSpread() {
    const points = [...pointers.current.values()];
    const mid = points.reduce(
      (acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length }),
      { x: 0, y: 0 },
    );
    const dist =
      points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
    return { mid, dist };
  }

  function begin() {
    const { mid, dist } = centreAndSpread();
    start.current = { dist, scale, mid, offset };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    begin();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { mid, dist } = centreAndSpread();

    if (pointers.current.size > 1 && start.current.dist > 0) {
      setScale(Math.min(MAX_SCALE, Math.max(1, start.current.scale * (dist / start.current.dist))));
    }
    setOffset({
      x: start.current.offset.x + (mid.x - start.current.mid.x),
      y: start.current.offset.y + (mid.y - start.current.mid.y),
    });
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) begin();
  }

  // What's drawn on screen and what's written to the canvas have to agree, so
  // the crop is worked out from the rendered boxes rather than guessed at.
  async function apply() {
    const frameBox = frame.current?.getBoundingClientRect();
    const imageBox = image.current?.getBoundingClientRect();
    if (!frameBox || !imageBox) return;

    setBusy(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("load failed"));
        img.src = src;
      });

      // Natural pixels per rendered pixel, then the frame's position within
      // the rendered image, converted back to natural pixels.
      const ratio = img.naturalWidth / imageBox.width;
      const sx = (frameBox.left - imageBox.left) * ratio;
      const sy = (frameBox.top - imageBox.top) * ratio;
      const sw = frameBox.width * ratio;
      const sh = frameBox.height * ratio;

      const canvas = document.createElement("canvas");
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);
      onDone(canvas.toDataURL("image/jpeg", 0.72));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex flex-col" style={{ background: "#000" }}>
      <div className="flex shrink-0 items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-2 text-sm font-semibold text-white"
        >
          Cancel
        </button>
        <span className="text-sm font-semibold text-white">Crop</span>
        <button
          type="button"
          onClick={apply}
          disabled={busy || !ready}
          className="px-2 py-2 text-sm font-bold disabled:opacity-50"
          style={{ color: "var(--color-brand-lime)" }}
        >
          {busy ? "Saving…" : "Done"}
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={image}
          src={src}
          alt="Photo being cropped"
          draggable={false}
          className="absolute left-1/2 top-1/2 max-h-full max-w-full select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        />

        {/* The window itself: everything outside it is dimmed by the ring
            shadow, so what you keep is obvious without masking the image. */}
        {/* Measured rather than left to CSS: aspect-ratio plus a max in one
            direction keeps the other dimension, so the box comes out the
            wrong shape. These two numbers are always exactly 3:4. */}
        <div
          ref={frameArea}
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-6"
        >
          <div
            ref={frame}
            style={{
              width: frameSize.w,
              height: frameSize.h,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              outline: "2px solid rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>

      <p className="shrink-0 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-center text-xs text-white/70">
        Pinch to zoom, drag to move.
      </p>
    </div>
  );
}
