import { TopBar } from "./top-bar";

// Shared chrome for everything one level under Profile, so Roadmap,
// Documents, Metrics, Testing, Photos and Nutrition all read as the same
// place — and carry the same top bar as the rest of the app.
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
      <TopBar />

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        {intro && (
          <p className="-mt-1 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {intro}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
