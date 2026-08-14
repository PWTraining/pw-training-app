import Link from "next/link";
import { TopBar } from "@/components/top-bar";
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
      <TopBar />

      <h1
        className="px-4 pt-4 text-xl font-bold"
        style={{ color: "var(--color-text)" }}
      >
        {doc.title}
      </h1>

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
