import { BottomNav } from "@/components/bottom-nav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-md flex-1 flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="flex-1 pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
