export type Timeframe = "Daily" | "Weekly" | "Monthly" | "Yearly";

export type Habit = {
  id: string;
  emoji: string;
  label: string;
  // Client's personal reason for tracking this habit, shown on its detail
  // page. Optional since older/imported habits may not have one yet.
  why?: string;
  // Soft-removed habits stay in history/stats but drop out of the active
  // list and grids. Clients archive rather than delete, see ARCHIVE section
  // on Progress.
  archived?: boolean;
};

// Cap on active (non-archived) habits a client can track at once.
export const MAX_ACTIVE_HABITS = 10;

// Starting habits for a new client. Clients can add/remove from here, see
// habits-context.tsx for the live, editable list.
export const DEFAULT_HABITS: Habit[] = [
  {
    id: "meals",
    emoji: "🥗",
    label: "Meals x3",
    why: "Spreading intake across three meals makes it far easier to hit your total calorie and protein targets than trying to cram it into two sittings, and it keeps energy steadier through work and training.",
  },
  {
    id: "protein",
    emoji: "🎯",
    label: "Protein Target",
    why: "A protein source at every meal makes the daily target achievable without counting grams, and it supports recovery from your current training load.",
  },
  {
    id: "hydration",
    emoji: "💧",
    label: "Hydration 2L",
    why: "Your training volume and time on your feet push hydration needs above average. Staying on top of it is one of the lowest-effort wins for recovery and digestion.",
  },
  {
    id: "light",
    emoji: "☀️",
    label: "Morning Light",
    why: "Getting light exposure early in the day helps anchor your circadian rhythm, which supports sleep quality and steadier energy for the rest of the day.",
  },
  {
    id: "phone",
    emoji: "📱",
    label: "Phone Boundaries",
    why: "Cutting phone use before bed reduces blue light and mental stimulation late in the day, so winding down and falling asleep comes easier.",
  },
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
  physical: [70, 80, 60, 90, 70, 50, 80, 70, 60, 90],
  mind: [60, 70, 50, 80, 60, 40, 70, 60, 50, 80],
  spirit: [80, 70, 90, 60, 80, 70, 50, 90, 80, 70],
};

// Calendar date for a day index in the current block, used only for
// labelling the day view — nothing in the adherence maths is date-aware.
export function dateForDay(dayIndex: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (TODAY_INDEX - dayIndex));
  return date;
}

export function formatDay(dayIndex: number) {
  if (dayIndex === TODAY_INDEX) return "Today";
  if (dayIndex === TODAY_INDEX - 1) return "Yesterday";
  return dateForDay(dayIndex).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

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

// Mock training completion for the Progress tab's Monthly/Yearly views,
// there's no real longer-range data model yet.
export const MOCK_TRAINING_PCT_MONTHLY = 88;
export const MOCK_TRAINING_PCT_YEARLY = 84;

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

const MOCK_VALUE_BUCKETS = [100, 100, 50, 100, 0, 100, 50, 100, 100, 100];

// Deterministic pseudo-random adherence value (0-100) for any day of a
// habit's history beyond the hand-authored MOCK_BLOCK, so Weekly/Yearly
// grids have data without hand-writing hundreds of mock numbers. Same
// habit + day index always returns the same value.
export function mockDayValue(habitId: string, dayIndex: number) {
  const known = MOCK_BLOCK[habitId]?.[dayIndex];
  if (known !== undefined) return known;
  const seed = hashString(`${habitId}:${dayIndex}`);
  return MOCK_VALUE_BUCKETS[seed % MOCK_VALUE_BUCKETS.length];
}

// Total days a Yearly average blends over — a data-averaging constant only,
// not tied to how the grid renders (see PERIOD_DAYS/PERIOD_COLUMNS below).
export const HEATMAP_CELLS = 364;

// Each timeframe gets its own grid shape sized to its own day count — a full
// 7-cell row for Weekly, the classic 7x4 block for Monthly, a dense 52x7
// heatmap for Yearly. Daily isn't grid-shaped at all, see habit-grid.tsx.
// The callout *card* stays visually consistent because they all share the
// same border/padding chrome, not because the grids are forced to the same
// cell count.
export const PERIOD_DAYS: Record<Timeframe, number> = {
  Daily: 1,
  Weekly: 7,
  Monthly: BLOCK_LENGTH,
  Yearly: HEATMAP_CELLS,
};

export const PERIOD_COLUMNS: Record<Timeframe, number> = {
  Daily: 1,
  Weekly: 7,
  Monthly: 7,
  Yearly: 52,
};

// Average adherence for a habit over the selected Program Adherence
// timeframe, blending its live today value with mock history.
export function periodPct(habitId: string, period: Timeframe, todayVal: number) {
  if (period === "Daily") return todayVal;
  if (period === "Weekly") return weeklyPct(habitId, todayVal);
  if (period === "Monthly") return monthlyPct(habitId, todayVal);

  let sum = todayVal;
  const days = HEATMAP_CELLS - 1;
  for (let i = 0; i < days; i++) sum += mockDayValue(habitId, i);
  return sum / HEATMAP_CELLS;
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

const ADHERENCE_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// CSS background for the check-in sliders: a continuous gradient through the
// adherence colour ramp up to `value`, with a hairline notch baked into the
// track at every 10% step so the increments read without separate dots.
export function sliderFill(value: number) {
  const activeStops = ADHERENCE_STEPS.filter((step) => step <= value).map(
    (step) => `var(--adherence-${step}) ${step}%`,
  );
  const fill = [...activeStops, `var(--color-border) ${value}%`, `var(--color-border) 100%`].join(
    ", ",
  );
  const notches =
    "repeating-linear-gradient(to right, rgba(0,0,0,0.16) 0, rgba(0,0,0,0.16) 1.5px, transparent 1.5px, transparent 10%)";
  return `${notches}, linear-gradient(to right, ${fill})`;
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
