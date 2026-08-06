import { TopBar } from "@/components/top-bar";

export default function ChatPage() {
  return (
    <div>
      <TopBar />
      <div className="flex flex-col items-center gap-2 px-4 pt-16 text-center">
        <span className="text-3xl" aria-hidden>
          💬
        </span>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Chat with Paul is coming soon.
        </p>
      </div>
    </div>
  );
}
