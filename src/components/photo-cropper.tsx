"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/lib/scroll-lock";

const MAX_SCALE = 6;

// Pinch and drag the picture inside the crop window, then keep what's in the
// window. Same gesture model as the photo viewer, so it's one thing to learn.
export function PhotoCropper({
  src,
  square = false,
  onCancel,
  onDone,
}: {
  src: string;
  // Profile pictures crop square; progress photos crop 3:4.
  square?: boolean;
  onCancel: () => void;
  onDone: (croppedSrc: string) => void;
}) {
  useScrollLock(true);

  const outW = square ? 720 : 720;
  const outH = square ? 720 : 960;

  const frame = useRef<HTMLDivElement>(null);
  const frameArea = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef({ dist: 0, scale: 1, mid: { x: 0, y: 0 }, offset: { x: 0, y: 0 } });

  useEffect(() => {
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  // The crop window takes the whole area it's given. It used to sit inside a
  // margin, which made it far smaller than the screen for no good reason.
  const measure = useCallback(() => {
    const area = frameArea.current;
    if (!area) return;
    const box = area.getBoundingClientRect();
    const h = Math.min(box.height, (box.width * outH) / outW);
    setFrameSize({ w: Math.round((h * outW) / outH), h: Math.round(h) });
  }, [outW, outH]);

  useEffect(() => {
    measure();
    const area = frameArea.current;
    if (!area) return;
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, [measure]);

  // The whole picture is visible when the cropper opens. Nothing is cut off
  // until the client chooses to zoom in.
  const baseWidth = (() => {
    if (!natural || !frameSize.w) return 0;
    const fitByWidth = frameSize.w / natural.w;
    const fitByHeight = frameSize.h / natural.h;
    return natural.w * Math.min(fitByWidth, fitByHeight);
  })();

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

  // What's on screen and what's written to the canvas have to agree, so the
  // crop is measured from the rendered boxes rather than recalculated.
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

      const ratio = img.naturalWidth / imageBox.width;
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Anything the picture doesn't cover stays black rather than
      // transparent, so the saved file has no see-through edges.
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(
        img,
        (frameBox.left - imageBox.left) * ratio,
        (frameBox.top - imageBox.top) * ratio,
        frameBox.width * ratio,
        frameBox.height * ratio,
        0,
        0,
        outW,
        outH,
      );
      onDone(canvas.toDataURL("image/jpeg", 0.75));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex flex-col" style={{ background: "#000" }}>
      <div className="flex shrink-0 items-center justify-between px-2 py-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-semibold text-white"
        >
          Cancel
        </button>
        <span className="text-sm font-semibold text-white">Crop</span>
        <button
          type="button"
          onClick={apply}
          disabled={busy || !natural}
          className="px-3 py-2 text-sm font-bold disabled:opacity-50"
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
        {baseWidth > 0 && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            ref={image}
            src={src}
            alt="Photo being cropped"
            draggable={false}
            className="absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: baseWidth,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
          />
        )}

        <div ref={frameArea} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            ref={frame}
            style={{
              width: frameSize.w,
              height: frameSize.h,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
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
