"use client";

import { useEffect, useRef, useState } from "react";
import { PhotoCropper } from "./photo-cropper";
import { ConfirmDialog } from "./confirm-dialog";
import { downscale } from "@/lib/image";

const AVATAR_KEY = "pw-profile-avatar";

// Instagram's close friends ring: a solid vivid green band with a gap of the
// page colour between it and the picture. No gradient, no glow.
const RING_GREEN = "#4CD964";

export function ProfileAvatar({ initials }: { initials: string }) {
  const [src, setSrc] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [cropping, setCropping] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setSrc(window.localStorage.getItem(AVATAR_KEY) ?? "");
    } catch {
      // Storage unavailable; the initials stand in.
    }
    setHydrated(true);
  }, []);

  function save(next: string) {
    setSrc(next);
    try {
      if (next) window.localStorage.setItem(AVATAR_KEY, next);
      else window.localStorage.removeItem(AVATAR_KEY);
    } catch {
      // Photo still shows for this visit.
    }
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    try {
      setCropping(await downscale(file));
    } catch {
      // Unreadable file. Nothing changes.
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label={src ? "Change your photo" : "Add your photo"}
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold"
        style={{
          background: "color-mix(in srgb, var(--color-brand) 10%, var(--color-surface))",
          color: "var(--color-brand)",
          boxShadow: `0 0 0 3px var(--color-bg), 0 0 0 6px ${RING_GREEN}`,
        }}
      >
        {hydrated && src ? (
          /* Data URL, so the Image component's optimiser has nothing to do. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {/* Named image types rather than image/*, so the phone leads with the
          photo library. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <button
            type="button"
            aria-label="Cancel"
            className="absolute inset-0"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-[var(--radius-lg)]"
            style={{ background: "var(--color-surface)" }}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                fileInput.current?.click();
              }}
              className="w-full py-4 text-sm font-semibold"
              style={{ color: "var(--color-brand)" }}
            >
              {src ? "Choose a new photo" : "Choose a photo"}
            </button>
            {src && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmRemove(true);
                }}
                className="w-full border-t py-4 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-danger)" }}
              >
                Remove photo
              </button>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="w-full border-t py-4 text-sm font-semibold"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {cropping && (
        <PhotoCropper
          src={cropping}
          square
          onCancel={() => setCropping("")}
          onDone={(next) => {
            save(next);
            setCropping("");
          }}
        />
      )}

      <ConfirmDialog
        open={confirmRemove}
        title="Remove your photo?"
        body="Your initials will show instead."
        confirmLabel="Remove"
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          save("");
          setConfirmRemove(false);
        }}
      />
    </>
  );
}
