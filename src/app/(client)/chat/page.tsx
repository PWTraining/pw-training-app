"use client";

import { useEffect, useRef } from "react";
import { TopBar } from "@/components/top-bar";
import { useChatUnread } from "@/lib/chat-unread";
import { PINNED_CHATS, OTHER_CHATS, type ChatPreview } from "@/lib/chat-mocks";

function ChatRow({
  chat,
  pinned,
  unread,
}: {
  chat: ChatPreview;
  pinned?: boolean;
  unread?: number;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3"
      style={{
        borderColor: pinned ? "var(--color-brand)" : "var(--color-border)",
        background: pinned
          ? "color-mix(in srgb, var(--color-brand) 6%, var(--color-surface))"
          : "var(--color-surface)",
      }}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {chat.avatar}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            {chat.name}
          </span>
          <span className="shrink-0 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            {chat.timestamp}
          </span>
        </div>
        <p className="truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
          {chat.lastMessage}
        </p>
      </div>
      {!!unread && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
          style={{ background: "var(--color-brand-red)", color: "#fff" }}
        >
          {unread}
        </span>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { hydrated, seen, markAllRead } = useChatUnread();

  // Opening the tab counts as reading, so the nav dot clears. The badges on
  // the rows keep the state they had on arrival, so this visit still shows
  // which conversations were waiting.
  const onArrival = useRef<Record<string, boolean> | null>(null);
  if (hydrated && onArrival.current === null) onArrival.current = seen;

  useEffect(() => {
    if (hydrated) markAllRead();
  }, [hydrated, markAllRead]);

  const unreadFor = (chat: ChatPreview) =>
    onArrival.current?.[chat.id] ? 0 : (chat.unread ?? 0);

  return (
    <div>
      <TopBar />
      <div className="flex flex-col gap-2 px-4 pt-4 pb-6">
        {PINNED_CHATS.map((chat) => (
          <ChatRow key={chat.id} chat={chat} pinned unread={unreadFor(chat)} />
        ))}

        <div
          className="mt-3 mb-1 text-xs font-semibold"
          style={{ color: "var(--color-text-muted)" }}
        >
          Chats
        </div>
        {OTHER_CHATS.map((chat) => (
          <ChatRow key={chat.id} chat={chat} unread={unreadFor(chat)} />
        ))}
      </div>
    </div>
  );
}
