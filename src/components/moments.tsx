"use client";

import { useRef, useState } from "react";
import { TODAY_INDEX } from "@/lib/habits";
import { useHabits, MAX_PHOTOS_PER_DAY, type DayPhoto } from "@/lib/habits-context";
import { downscale, photoId } from "@/lib/image";

export function Moments({ day = TODAY_INDEX }: { day?: number }) {
  const { photosFor, addPhotos, removePhoto, setPhotoCaption } = useHabits();
  const photos = photosFor(day);

  const fileInput = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<DayPhoto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const remaining = MAX_PHOTOS_PER_DAY - photos.length;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy(true);

    try {
      const chosen = [...files].slice(0, remaining);
      const next = await Promise.all(
        chosen.map(async (file) => ({
          id: photoId(),
          src: await downscale(file),
          caption: "",
        })),
      );
      addPhotos(day, next);
    } catch {
      setError("That photo wouldn't load. Try another one.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          <span className="text-base leading-none" aria-hidden>
            📷
          </span>
          Photos From Today
        </h2>
        <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          {photos.length} of {MAX_PHOTOS_PER_DAY}
        </span>
      </div>
      <p className="mb-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
        Add anything that captures your day.
      </p>

      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpen(photo)}
              className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)]"
              style={{ background: "var(--color-bg)" }}
            >
              {/* Data URLs, so the Image component's optimiser has nothing
                  to do here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.caption || "A moment from this day"}
                className="h-full w-full object-cover"
              />
              {photo.caption && (
                <span
                  className="absolute inset-x-0 bottom-0 truncate px-1.5 py-1 text-left text-[10px]"
                  style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
                >
                  {photo.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mb-2 text-xs" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={remaining <= 0 || busy}
        className="w-full rounded-[var(--radius-md)] border py-2.5 text-sm font-medium disabled:opacity-50"
        style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
      >
        {busy
          ? "Adding…"
          : remaining <= 0
            ? `That's all ${MAX_PHOTOS_PER_DAY} for today`
            : "📷  Add photos"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <button
            type="button"
            aria-label="Close photo"
            className="absolute inset-0"
            onClick={() => setOpen(null)}
          />

          <div
            className="relative w-full max-w-sm rounded-[var(--radius-lg)] p-3"
            style={{ background: "var(--color-surface)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open.src}
              alt={open.caption || "A moment from this day"}
              className="max-h-[60vh] w-full rounded-[var(--radius-sm)] object-contain"
            />

            <input
              type="text"
              value={open.caption}
              onChange={(e) => {
                setPhotoCaption(day, open.id, e.target.value);
                setOpen({ ...open, caption: e.target.value });
              }}
              placeholder="Add a line about this moment"
              className="mt-3 w-full rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="flex-1 rounded-[var(--radius-sm)] py-2 text-sm font-semibold"
                style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  removePhoto(day, open.id);
                  setOpen(null);
                }}
                className="rounded-[var(--radius-sm)] border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-danger)" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
