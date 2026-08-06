"use client";

import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { PHASES, MOCK_METRICS, MOCK_HEALTH_STATS, MOCK_FOOD_SNAPSHOT } from "@/lib/portal-mocks";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[var(--radius-sm)] border py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            {stat.value}
          </div>
          <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PortalPage() {
  const currentPhase = PHASES[PHASES.length - 1];

  return (
    <div>
      <TopBar />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <Link
          href="/portal/phases"
          className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Current phase
            </div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {currentPhase.name}
            </div>
          </div>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }} aria-hidden>
            &rsaquo;
          </span>
        </Link>

        <Link
          href="/portal/documents"
          className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            📋 Documents
          </span>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }} aria-hidden>
            &rsaquo;
          </span>
        </Link>

        <Card title="Metrics & Testing">
          <StatGrid stats={MOCK_METRICS} />
          <button
            type="button"
            className="mt-3 w-full rounded-md border py-2 text-xs font-medium"
            style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
          >
            + Log a new metric
          </button>
        </Card>

        <Card title="Health">
          <StatGrid stats={MOCK_HEALTH_STATS} />
        </Card>

        <Card title="Food">
          <StatGrid
            stats={[
              { label: "Calories", value: MOCK_FOOD_SNAPSHOT.calories },
              { label: "Protein", value: MOCK_FOOD_SNAPSHOT.protein },
              { label: "Carbs", value: MOCK_FOOD_SNAPSHOT.carbs },
              { label: "Fat", value: MOCK_FOOD_SNAPSHOT.fat },
            ]}
          />
          <a
            href="#"
            className="mt-3 block text-center text-xs font-medium"
            style={{ color: "var(--color-brand)" }}
          >
            View micronutrient audit ▸
          </a>
        </Card>

        <Card title="Overall adherence">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--adherence-70)", color: "#1a1a1a" }}
            >
              72%
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Pulled from habits, training, mood and check-ins. Missing data is redistributed
              across what&rsquo;s tracked. It&rsquo;s never read as failure.
            </p>
          </div>
        </Card>

        <button
          type="button"
          className="rounded-[var(--radius-md)] border py-3 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          ✎ Quick capture
        </button>
      </div>
    </div>
  );
}
