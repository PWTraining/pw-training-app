import Link from "next/link";
import { notFound } from "next/navigation";
import { PHASES } from "@/lib/portal-mocks";

export default async function PhaseDetailPage({
  params,
}: {
  params: Promise<{ phaseId: string }>;
}) {
  const { phaseId } = await params;
  const phase = PHASES.find((p) => p.id === phaseId);

  if (!phase) notFound();

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
          href="/portal/phases"
          aria-label="Back to phases"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
          style={{ color: "var(--color-text)" }}
        >
          &lsaquo;
        </Link>
        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {phase.name}
        </h1>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {phase.summary}
          </p>
          <div className="flex flex-col gap-2">
            {phase.nonNegotiables.map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className="text-lg leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                    {item.title}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
