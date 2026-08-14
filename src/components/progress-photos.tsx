"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { downscale, photoId } from "@/lib/image";

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

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
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
            Tap an empty box to add that angle. Same pose, same light, same time of day makes them
            worth comparing.
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
          onReplace={() => {
            pick(viewing.takenOn, viewing.pose);
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

const ZOOM_STEPS = [1, 2, 3];

// Full screen with tap-to-zoom. Scaling the image past the viewport and
// letting the container scroll is what makes panning work on a phone.
function PhotoViewer({
  photo,
  onClose,
  onRemove,
  onReplace,
}: {
  photo: ProgressPhoto;
  onClose: () => void;
  onRemove: () => void;
  onReplace: () => void;
}) {
  const [step, setStep] = useState(0);
  const zoom = ZOOM_STEPS[step];

  return (
    /* Fully opaque: at anything less, the page underneath shows through the
       bars top and bottom. */
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000" }}>
      <div className="flex shrink-0 items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-white">
          {POSE_LABEL[photo.pose]} &middot; {prettyDate(photo.takenOn)}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="flex h-11 w-11 items-center justify-center text-2xl text-white"
        >
          &times;
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <button
          type="button"
          onClick={() => setStep((s) => (s + 1) % ZOOM_STEPS.length)}
          aria-label={`Zoom, currently ${zoom} times`}
          className="block"
          style={{ width: `${zoom * 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={`${POSE_LABEL[photo.pose]} on ${photo.takenOn}`}
            className="w-full"
          />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setStep((s) => (s + 1) % ZOOM_STEPS.length)}
          className="flex-1 rounded-[var(--radius-sm)] border py-2.5 text-sm font-semibold text-white"
          style={{ borderColor: "rgba(255,255,255,0.4)" }}
        >
          Zoom {zoom}x
        </button>
        <button
          type="button"
          onClick={onReplace}
          className="flex-1 rounded-[var(--radius-sm)] border py-2.5 text-sm font-semibold text-white"
          style={{ borderColor: "rgba(255,255,255,0.4)" }}
        >
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-semibold"
          style={{ background: "var(--color-danger)", color: "#fff" }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
