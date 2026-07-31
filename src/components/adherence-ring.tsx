import { ringColor } from "@/lib/habits";

export function AdherenceRing({ pct }: { pct: number }) {
  const color = ringColor(pct);
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        background: `conic-gradient(${color} ${pct * 3.6}deg, var(--color-border) 0deg)`,
        color: "var(--color-text)",
      }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: "var(--color-surface)" }}
      >
        {pct}%
      </div>
    </div>
  );
}
