import { BottomNav } from "@/components/bottom-nav";
import { HabitsProvider } from "@/lib/habits-context";

// Login gate is on ice per Paul's request (2026-07-31), visual/functional
// build comes first. Re-enable by restoring the createClient()/getUser()/
// redirect("/login") check this replaced before shipping real accounts.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <HabitsProvider>
      <div
        className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="flex-1 pb-24">{children}</div>
        <BottomNav />
      </div>
    </HabitsProvider>
  );
}
