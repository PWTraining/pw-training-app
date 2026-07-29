import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
