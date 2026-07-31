export type Habit = {
  id: string;
  emoji: string;
  label: string;
};

// Starting habits for a new client. Clients can add/remove from here, see
// habits-context.tsx for the live, editable list.
export const DEFAULT_HABITS: Habit[] = [
  { id: "meals", emoji: "🥗", label: "Meals x3" },
  { id: "protein", emoji: "🎯", label: "Protein Target" },
  { id: "hydration", emoji: "💧", label: "Hydration 2L" },
  { id: "light", emoji: "☀️", label: "Morning Light" },
  { id: "phone", emoji: "📱", label: "Phone Boundaries" },
];

// A block runs 4 weeks and resets. TODAY_INDEX is "today" — days after it
// haven't happened yet, so grids fill in day by day as the block progresses.
export const BLOCK_LENGTH = 28;
export const TODAY_INDEX = 10;

// Mock % logged per day (0-100), one entry per elapsed day (indices
// 0..TODAY_INDEX - 1). Today's value comes from live state instead.
export const MOCK_BLOCK: Record<string, number[]> = {
  meals: [100, 100, 50, 100, 100, 100, 0, 100, 50, 100],
  protein: [100, 0, 100, 100, 50, 100, 100, 0, 100, 100],
  hydration: [100, 100, 100, 50, 100, 100, 0, 100, 100, 50],
  light: [0, 100, 100, 100, 50, 0, 100, 100, 0, 100],
  phone: [100, 100, 50, 0, 100, 100, 100, 50, 100, 0],
};

// Mock comments a client has left against specific days of a habit's block —
// e.g. explaining a partial or missed day. Coaches read these at check-in.
export type HabitComment = { day: number; text: string };

export const MOCK_COMMENTS: Record<string, HabitComment[]> = {
  meals: [{ day: 6, text: "Traveling for work, only got 2 meals in." }],
  hydration: [{ day: 6, text: "Left my water bottle at home." }],
  light: [{ day: 5, text: "Rained all morning." }],
};

// Mock % of this week's planned training sessions completed. Feeds into the
// combined Home adherence score alongside habits, until Train has real data.
export const MOCK_TRAINING_PCT = 92;

// Mock training completion for the Monthly/Yearly Program Adherence tabs,
// there's no real longer-range data model yet.
export const MOCK_TRAINING_PCT_MONTHLY = 88;
export const MOCK_TRAINING_PCT_YEARLY = 84;
export const MOCK_HABITS_PCT_YEARLY = 79;

// Placeholder for Paul's daily greeting to the client. Real backend input
// later, front-end just hides the section entirely when it's empty.
export const MOCK_COACH_COMMENT =
  "Great consistency this week, Paul. Keep the protein up on training days and let's talk hydration on Sunday's call.";

// Average of the last 7 elapsed days plus today's live value.
export function weeklyPct(habitId: string, todayVal: number) {
  const days = MOCK_BLOCK[habitId] ?? [];
  const start = Math.max(0, TODAY_INDEX - 6);
  const values = [...days.slice(start, TODAY_INDEX), todayVal];
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Average across every elapsed day in the current 4-week block plus today.
export function monthlyPct(habitId: string, todayVal: number) {
  const days = MOCK_BLOCK[habitId] ?? [];
  const values = [...days.slice(0, TODAY_INDEX), todayVal];
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function adherenceColor(pct: number) {
  const step = Math.min(100, Math.max(0, Math.round(pct / 10) * 10));
  return `var(--adherence-${step})`;
}

// Same scale as adherenceColor, but the top end is swapped for a lighter,
// more vibrant green, used only by the Program Adherence donut.
export function ringColor(pct: number) {
  const step = Math.min(100, Math.max(0, Math.round(pct / 10) * 10));
  if (step === 90) return "var(--ring-green-90)";
  if (step === 100) return "var(--ring-green-100)";
  return `var(--adherence-${step})`;
}

const HABIT_PALETTE_SIZE = 8;

function hashString(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Fixed per-habit identity colour, stable by id regardless of list order or
// logged value, see --habit-color-1..8 in tokens.css.
export function habitColor(id: string) {
  const index = (hashString(id) % HABIT_PALETTE_SIZE) + 1;
  return `var(--habit-color-${index})`;
}
