import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { DOCUMENTS } from "@/lib/portal-mocks";

export default function DocumentsIndexPage() {
  return (
    <div>
      <TopBar />

      <h1
        className="px-4 pt-4 text-xl font-bold"
        style={{ color: "var(--color-text)" }}
      >
        Documents
      </h1>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {DOCUMENTS.map((doc) => (
          <Link
            key={doc.id}
            href={`/profile/documents/${doc.id}`}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xl leading-none" aria-hidden>
              {doc.emoji}
            </span>
            <span
              className="flex-1 text-sm font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {doc.title}
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
