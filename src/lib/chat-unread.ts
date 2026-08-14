"use client";

import { useCallback, useEffect, useState } from "react";
import { PINNED_CHATS, OTHER_CHATS } from "./chat-mocks";

const READ_KEY = "pw-chat-read";

const ALL_CHATS = [...PINNED_CHATS, ...OTHER_CHATS];

// Which conversations the client has already seen. Real messaging would get
// this from the server; until then it's the same local-first storage the rest
// of the app uses.
function readSeen(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function useChatUnread() {
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSeen(readSeen());
    setHydrated(true);
  }, []);

  const markAllRead = useCallback(() => {
    const next = Object.fromEntries(ALL_CHATS.map((c) => [c.id, true]));
    setSeen(next);
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify(next));
    } catch {
      // Nothing to do — the badge just comes back next visit.
    }
  }, []);

  // Nothing shows until storage has been read, so the badge can't flash on
  // for a moment on a tab the client already cleared.
  const unreadCount = hydrated
    ? ALL_CHATS.reduce((n, c) => n + (c.unread && !seen[c.id] ? c.unread : 0), 0)
    : 0;

  return { hydrated, seen, unreadCount, markAllRead };
}
