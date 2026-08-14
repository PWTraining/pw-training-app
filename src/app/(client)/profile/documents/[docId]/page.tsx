import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCUMENTS } from "@/lib/portal-mocks";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  const doc = DOCUMENTS.find((d) => d.id === docId);

  if (!doc) notFound();

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
          href="/profile/documents"
          aria-label="Back to documents"
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl"
          style={{ color: "var(--color-text)" }}
        >
          &lsaquo;
        </Link>
        <span className="text-xl leading-none" aria-hidden>
          {doc.emoji}
        </span>
        <h1 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
          {doc.title}
        </h1>
      </header>

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <section
          className="rounded-[var(--radius-lg)] border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {doc.body}
          </p>
        </section>
      </div>
    </div>
  );
}
