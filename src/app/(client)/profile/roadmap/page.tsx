import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { PHASES } from "@/lib/portal-mocks";

export default function RoadmapIndexPage() {
  return (
    <div>
      <TopBar />

      <h1
        className="px-4 pt-4 text-xl font-bold"
        style={{ color: "var(--color-text)" }}
      >
        Roadmap
      </h1>

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
