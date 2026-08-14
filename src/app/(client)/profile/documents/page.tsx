import Link from "next/link";
import { DOCUMENTS } from "@/lib/portal-mocks";

export default function DocumentsIndexPage() {
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
          Documents
        </h1>
      </header>

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
