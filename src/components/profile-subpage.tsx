import Link from "next/link";

// Shared chrome for everything one level under Profile, so Roadmap,
// Documents, Metrics, Testing and Nutrition all read as the same place.
export function ProfileSubPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
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
          className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
          style={{ color: "var(--color-brand)" }}
        >
          &lsaquo; Back
        </Link>
        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {intro && (
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {intro}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export function StatRows({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <section
      className="overflow-hidden rounded-[var(--radius-lg)] border"
      style={{ borderColor: "var(--color-border)" }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-border)" }}
        >
          <span className="text-sm" style={{ color: "var(--color-text)" }}>
            {stat.label}
          </span>
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: "var(--color-text)" }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </section>
  );
}
