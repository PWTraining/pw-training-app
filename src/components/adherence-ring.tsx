import { ringColor } from "@/lib/habits";

export function AdherenceRing({ pct }: { pct: number }) {
  const color = ringColor(pct);
  const trackColor = `color-mix(in srgb, ${color} 14%, var(--color-border))`;
  const sweep = Math.max(pct * 3.6, pct > 0 ? 4 : 0);

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-md"
        style={{ background: color }}
        aria-hidden
      />
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full text-sm font-semibold"
        style={{
          background: `conic-gradient(from -90deg, ${color} ${sweep}deg, ${trackColor} ${sweep}deg)`,
          boxShadow: `0 3px 10px color-mix(in srgb, ${color} 40%, transparent)`,
          color: "var(--color-text)",
        }}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            background: "var(--color-surface)",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          {pct}%
        </div>
      </div>
    </div>
  );
}
