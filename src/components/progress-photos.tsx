"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { downscale, photoId } from "@/lib/image";
import { useScrollLock } from "@/lib/scroll-lock";

const STORAGE_KEY = "pw-progress-photos";

const POSES = ["front", "back", "side"] as const;
type Pose = (typeof POSES)[number];

const POSE_LABEL: Record<Pose, string> = {
  front: "Front",
  back: "Back",
  side: "Side",
};

type ProgressPhoto = { id: string; src: string; takenOn: string; note: string; pose: Pose };

function today() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Photos saved before poses existed have no angle recorded. They were all
// shot the same way in practice, so they land in Front rather than vanishing.
function withPose(photo: Partial<ProgressPhoto>): ProgressPhoto {
  return {
    id: photo.id ?? photoId(),
    src: photo.src ?? "",
    takenOn: photo.takenOn ?? today(),
    note: photo.note ?? "",
    pose: POSES.includes(photo.pose as Pose) ? (photo.pose as Pose) : "front",
  };
}

export function ProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<"library" | "compare">("library");
  const [viewing, setViewing] = useState<ProgressPhoto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<{ takenOn: string; pose: Pose } | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setPhotos((JSON.parse(stored) as ProgressPhoto[]).map(withPose));
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

  // One row per shoot, newest first, with today's row always present so
  // there's somewhere obvious to add to.
  const dates = useMemo(() => {
    const set = new Set(photos.map((p) => p.takenOn));
    set.add(today());
    return [...set].sort().reverse();
  }, [photos]);

  const at = (takenOn: string, pose: Pose) =>
    photos.find((p) => p.takenOn === takenOn && p.pose === pose) ?? null;

  function pick(takenOn: string, pose: Pose) {
    pendingSlot.current = { takenOn, pose };
    fileInput.current?.click();
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    const slot = pendingSlot.current;
    if (!file || !slot) return;

    setError("");
    setBusy(true);
    try {
      const src = await downscale(file);
      setPhotos((prev) => [
        // One photo per angle per day: adding again replaces that slot.
        ...prev.filter((p) => !(p.takenOn === slot.takenOn && p.pose === slot.pose)),
        { id: photoId(), src, takenOn: slot.takenOn, note: "", pose: slot.pose },
      ]);
    } catch {
      setError("That photo wouldn't load. Try another one.");
    } finally {
      setBusy(false);
      pendingSlot.current = null;
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <>
      <div
        className="flex gap-1 rounded-full p-1"
        style={{ background: "var(--color-surface-raised)" }}
      >
        {(["library", "compare"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="flex-1 rounded-full py-2 text-sm font-semibold capitalize"
            style={{
              background: mode === m ? "var(--color-brand)" : "transparent",
              color: mode === m ? "var(--color-brand-contrast)" : "var(--color-text-muted)",
            }}
          >
            {m === "library" ? "All photos" : "Compare"}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      {/* Named image types rather than image/*: on a phone that opens the
          photo library instead of leading with the camera. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      {mode === "library" ? (
        <div className="flex flex-col gap-4">
          {dates.map((date) => (
            <section key={date} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                  {prettyDate(date)}
                </h3>
                {date === today() && (
                  <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    Today
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {POSES.map((pose) => {
                  const photo = at(date, pose);
                  return (
                    <div key={pose} className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => (photo ? setViewing(photo) : pick(date, pose))}
                        className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-sm)] border-2 disabled:opacity-50"
                        style={{
                          borderColor: photo ? "transparent" : "var(--color-border)",
                          borderStyle: photo ? "solid" : "dashed",
                          background: "var(--color-bg)",
                        }}
                      >
                        {photo ? (
                          /* Data URLs, so the Image component's optimiser has
                             nothing to do here. */
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={photo.src}
                            alt={`${POSE_LABEL[pose]} on ${date}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-full w-full items-center justify-center text-2xl"
                            style={{ color: "var(--color-text-muted)" }}
                            aria-hidden
                          >
                            +
                          </span>
                        )}
                      </button>
                      <span
                        className="text-center text-[11px] font-semibold"
                        style={{
                          color: photo ? "var(--color-text)" : "var(--color-text-muted)",
                        }}
                      >
                        {POSE_LABEL[pose]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <p className="text-xs italic" style={{ color: "var(--color-text-muted)" }}>
            Tap an empty box to add that angle.
          </p>
        </div>
      ) : (
        <CompareView photos={photos} onZoom={setViewing} />
      )}

      {viewing && (
        <PhotoViewer
          photo={viewing}
          onClose={() => setViewing(null)}
          onRemove={() => {
            setPhotos((prev) => prev.filter((p) => p.id !== viewing.id));
            setViewing(null);
          }}
        />
      )}
    </>
  );
}

// Two shots of the same angle, side by side. The angle and both dates are one
// tap each, and either image opens full screen.
function CompareView({
  photos,
  onZoom,
}: {
  photos: ProgressPhoto[];
  onZoom: (photo: ProgressPhoto) => void;
}) {
  const [pose, setPose] = useState<Pose>("front");

  const forPose = useMemo(
    () => photos.filter((p) => p.pose === pose).sort((a, b) => a.takenOn.localeCompare(b.takenOn)),
    [photos, pose],
  );

  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);

  // Oldest against newest is the comparison people want by default, and it
  // has to reset whenever the angle changes.
  useEffect(() => {
    setLeftId(forPose[0]?.id ?? null);
    setRightId(forPose[forPose.length - 1]?.id ?? null);
  }, [forPose]);

  const left = forPose.find((p) => p.id === leftId) ?? null;
  const right = forPose.find((p) => p.id === rightId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1 rounded-full p-1"
        style={{ background: "var(--color-surface-raised)" }}
      >
        {POSES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPose(p)}
            className="flex-1 rounded-full py-2 text-sm font-semibold"
            style={{
              background: pose === p ? "var(--color-text)" : "transparent",
              color: pose === p ? "var(--color-surface)" : "var(--color-text-muted)",
            }}
          >
            {POSE_LABEL[p]}
          </button>
        ))}
      </div>

      {forPose.length < 2 ? (
        <p className="py-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Add at least two {POSE_LABEL[pose].toLowerCase()} photos and they&rsquo;ll line up here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <ComparePane
              heading="Before"
              photo={left}
              options={forPose}
              onSelect={setLeftId}
              onZoom={onZoom}
            />
            <ComparePane
              heading="After"
              photo={right}
              options={forPose}
              onSelect={setRightId}
              onZoom={onZoom}
            />
          </div>
          <p className="text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
            Tap either photo to open it full screen and zoom.
          </p>
        </>
      )}
    </div>
  );
}

function ComparePane({
  heading,
  photo,
  options,
  onSelect,
  onZoom,
}: {
  heading: string;
  photo: ProgressPhoto | null;
  options: ProgressPhoto[];
  onSelect: (id: string) => void;
  onZoom: (photo: ProgressPhoto) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span
        className="text-center text-[11px] font-bold uppercase tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        {heading}
      </span>

      <button
        type="button"
        onClick={() => photo && onZoom(photo)}
        className="aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-sm)]"
        style={{ background: "var(--color-bg)" }}
      >
        {photo && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo.src}
            alt={`${heading}, ${photo.takenOn}`}
            className="h-full w-full object-cover"
          />
        )}
      </button>

      <select
        value={photo?.id ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        aria-label={`${heading} date`}
        className="w-full rounded-[var(--radius-sm)] border px-2 py-2 text-xs font-semibold outline-none"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      >
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {prettyDate(p.takenOn)}
          </option>
        ))}
      </select>
    </div>
  );
}

const MAX_ZOOM = 5;

// Full screen, pinch to zoom and drag to move, the way the phone's own photo
// viewer works. Double tap toggles between fit and 2.5x.
function PhotoViewer({
  photo,
  onClose,
  onRemove,
}: {
  photo: ProgressPhoto;
  onClose: () => void;
  onRemove: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [confirmRemove, setConfirmRemove] = useState(false);

  useScrollLock(true);

  // Live pointers, plus what the gesture started from. Refs rather than state
  // because these change on every move and must not trigger a render.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef({ dist: 0, scale: 1, mid: { x: 0, y: 0 }, offset: { x: 0, y: 0 } });
  const lastTap = useRef(0);

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

  function beginGesture() {
    const { mid, dist } = centreAndSpread();
    start.current = { dist, scale, mid, offset };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    beginGesture();

    // Double tap, measured the same way a phone does it.
    if (pointers.current.size === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setScale((s) => (s > 1 ? 1 : 2.5));
        setOffset({ x: 0, y: 0 });
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const { mid, dist } = centreAndSpread();

    if (pointers.current.size > 1 && start.current.dist > 0) {
      const next = Math.min(MAX_ZOOM, Math.max(1, start.current.scale * (dist / start.current.dist)));
      setScale(next);
      // Follow the fingers so the picture doesn't slide away from the pinch.
      setOffset({
        x: start.current.offset.x + (mid.x - start.current.mid.x),
        y: start.current.offset.y + (mid.y - start.current.mid.y),
      });
    } else if (scale > 1) {
      setOffset({
        x: start.current.offset.x + (mid.x - start.current.mid.x),
        y: start.current.offset.y + (mid.y - start.current.mid.y),
      });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      beginGesture();
      return;
    }
    // Back to fit means back to centred, so it can't be left off screen.
    if (scale <= 1.02) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }

  return (
    /* Fully opaque: at anything less, the page underneath shows through. */
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000" }}>
      <div className="flex shrink-0 items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-white">
          {POSE_LABEL[photo.pose]} &middot; {prettyDate(photo.takenOn)}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="px-2 py-1 text-sm font-semibold"
            style={{ color: "#ff6b6b" }}
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="flex h-11 w-11 items-center justify-center text-2xl text-white"
          >
            &times;
          </button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={`${POSE_LABEL[photo.pose]} on ${photo.takenOn}`}
          draggable={false}
          className="h-full w-full select-none object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="Delete this photo?"
        body="It won't be recoverable."
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          setConfirmRemove(false);
          onRemove();
        }}
      />
    </div>
  );
}
