import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { MOCK_PROFILE, ageFrom, formatBirthday } from "@/lib/portal-mocks";

// Everything reachable from the profile. Each one is its own rabbit hole —
// same plain callout treatment as the Documents list.
const SECTIONS = [
  { href: "/profile/roadmap", emoji: "🗺️", title: "Roadmap", blurb: "Your phases and non-negotiables" },
  { href: "/profile/documents", emoji: "📋", title: "Documents", blurb: "Protocols written for you" },
  { href: "/profile/metrics", emoji: "📏", title: "Metrics", blurb: "Measurements over time" },
  { href: "/profile/photos", emoji: "📷", title: "Progress Photos", blurb: "See the change the scale misses" },
  { href: "/profile/testing", emoji: "🧪", title: "Testing", blurb: "Strength and fitness benchmarks" },
  { href: "/profile/nutrition", emoji: "🥗", title: "Nutrition", blurb: "Targets and food guidance" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function ProfilePage() {
  return (
    <div>
      <TopBar />

      <div className="flex flex-col gap-5 px-4 pt-6 pb-6">
        <section className="flex flex-col items-center gap-3 text-center">
          {/* Initials stand in until a real photo exists — swap the inner
              span for an <Image> and the green ring stays exactly as it is. */}
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold"
            style={{
              background: "color-mix(in srgb, var(--color-brand) 10%, var(--color-surface))",
              color: "var(--color-brand)",
              boxShadow: "0 0 0 3px var(--color-surface), 0 0 0 6px #45d268",
            }}
            aria-hidden
          >
            {initials(MOCK_PROFILE.name)}
          </div>

          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              {MOCK_PROFILE.name}
            </h1>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {MOCK_PROFILE.tagline} &middot; since {MOCK_PROFILE.startDate}
            </p>
            {/* Age ticks over on a date the server can't know in the viewer's
                timezone, so let the client's number win. */}
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--color-text-muted)" }}
              suppressHydrationWarning
            >
              🎂 {formatBirthday(MOCK_PROFILE.birthday)} &middot;{" "}
              {ageFrom(MOCK_PROFILE.birthday)} years old
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border p-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-xl leading-none" aria-hidden>
                {section.emoji}
              </span>
              <span className="flex-1">
                <span
                  className="block text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {section.title}
                </span>
                <span className="block text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {section.blurb}
                </span>
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }} aria-hidden>
                &rsaquo;
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
