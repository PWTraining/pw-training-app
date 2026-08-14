"use client";

import { useEffect, useRef, useState } from "react";
import { downscale, photoId } from "@/lib/image";

const STORAGE_KEY = "pw-progress-photos";

type ProgressPhoto = { id: string; src: string; takenOn: string; note: string };

export function ProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState<ProgressPhoto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setPhotos(JSON.parse(stored) as ProgressPhoto[]);
    } catch {
      // Corrupt or unavailable storage just starts empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch {
      setError("Storage is full. Remove an older photo to add more.");
    }
  }, [photos, hydrated]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy(true);

    try {
      const added = await Promise.all(
        [...files].map(async (file) => ({
          id: photoId(),
          src: await downscale(file),
          takenOn: new Date().toISOString().slice(0, 10),
          note: "",
        })),
      );
      // Newest first, so the latest shot is the one you see.
      setPhotos((prev) => [...added, ...prev]);
    } catch {
      setError("That photo wouldn't load. Try another one.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function update(id: string, patch: Partial<ProgressPhoto>) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpen(photo)}
              className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-sm)]"
              style={{ background: "var(--color-bg)" }}
            >
              {/* Data URLs, so the Image component's optimiser has nothing
                  to do here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.note || `Progress photo from ${photo.takenOn}`}
                className="h-full w-full object-cover"
              />
              <span
                className="absolute inset-x-0 bottom-0 px-1.5 py-1 text-left text-[10px] tabular-nums"
                style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
              >
                {photo.takenOn}
              </span>
            </button>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <p className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>
          No progress photos yet. Same pose, same light, same time of day makes them worth
          comparing.
        </p>
      )}

      {error && (
        <p className="text-xs" style={{ color: "var(--color-danger)" }}>
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
        disabled={busy}
        className="rounded-[var(--radius-md)] border py-2.5 text-sm font-medium disabled:opacity-50"
        style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
      >
        {busy ? "Adding…" : "+ Add photos"}
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
              alt={open.note || `Progress photo from ${open.takenOn}`}
              className="max-h-[60vh] w-full rounded-[var(--radius-sm)] object-contain"
            />

            <input
              type="date"
              value={open.takenOn}
              onChange={(e) => {
                update(open.id, { takenOn: e.target.value });
                setOpen({ ...open, takenOn: e.target.value });
              }}
              aria-label="Date taken"
              className="mt-3 w-full rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
              }}
            />

            <input
              type="text"
              value={open.note}
              onChange={(e) => {
                update(open.id, { note: e.target.value });
                setOpen({ ...open, note: e.target.value });
              }}
              placeholder="Add a note"
              className="mt-2 w-full rounded-[var(--radius-sm)] border px-3 py-2 text-sm outline-none"
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
                  setPhotos((prev) => prev.filter((p) => p.id !== open.id));
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
    </>
  );
}
