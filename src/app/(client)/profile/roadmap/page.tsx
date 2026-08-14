import Link from "next/link";
import { PHASES } from "@/lib/portal-mocks";

export default function RoadmapIndexPage() {
  return (
    <div>
      <header
        className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-3 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          background: "color-mix(in srgb, var(--color-surface) 92%, transparent)",
        }}
      >
        <Link
          href="/profile"
          aria-label="Back to profile"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
          style={{ color: "var(--color-text)" }}
        >
          &lsaquo;
        </Link>
        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          Roadmap
        </h1>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {PHASES.map((phase) => (
          <Link
            key={phase.id}
            href={`/profile/roadmap/${phase.id}`}
            className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {phase.name}
            </span>
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }} aria-hidden>
              &rsaquo;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
