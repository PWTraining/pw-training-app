// Front-end mock data for the Chat tab list — no real messaging backend
// yet, same mock-first approach as the rest of the app.

export type ChatPreview = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
};

export const PINNED_CHATS: ChatPreview[] = [
  {
    id: "coach",
    name: "Coach",
    avatar: "🧑‍🏫",
    lastMessage: "Great consistency this week, Paul. Keep the protein up on training days.",
    timestamp: "2h",
    unread: 1,
  },
  {
    id: "community",
    name: "Community",
    avatar: "🌐",
    lastMessage: "Sarah: anyone hitting new PRs this week?",
    timestamp: "5h",
  },
];

export const OTHER_CHATS: ChatPreview[] = [
  {
    id: "sarah",
    name: "Sarah T.",
    avatar: "🙋‍♀️",
    lastMessage: "Nice squat session today!",
    timestamp: "1d",
  },
  {
    id: "mike",
    name: "Mike R.",
    avatar: "🙋‍♂️",
    lastMessage: "Keen for a session together Friday?",
    timestamp: "2d",
  },
];
