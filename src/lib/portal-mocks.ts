// Mock data for the Portal tab. Client name is a stand-in until real
// accounts exist, see AGENTS.md / DECISIONS.md for the login-gate status.

export type Phase = {
  id: string;
  name: string;
  summary: string;
  nonNegotiables: { emoji: string; title: string; detail: string }[];
};

export const PHASES: Phase[] = [
  {
    id: "phase-1",
    name: "Phase 1: Win the First 30 Days",
    summary:
      "Total food intake and consistent hydration are the two big levers, matched to your current training and output at work. Training is full body strength, 3x a week, to maximise muscle growth.",
    nonNegotiables: [
      { emoji: "🥗", title: "Meal Consistency", detail: "Eat breakfast, lunch, and dinner" },
      { emoji: "🎯", title: "Protein Target", detail: "One source of protein in every meal" },
      {
        emoji: "💧",
        title: "Daily Hydration",
        detail: "2.5L of water plus 1L of coconut water on running days",
      },
      { emoji: "🏋", title: "Strength Training", detail: "Full body x 3 days a week" },
      {
        emoji: "☮️",
        title: "Down Regulate Before Eating",
        detail: "Three deep breaths, smell your food, look at it",
      },
    ],
  },
];

// Headline profile details — the "who am I and where am I up to" block at
// the top of the Profile tab. Placeholder until real accounts exist.
export const MOCK_PROFILE = {
  name: "Paul Wintle",
  tagline: "1:1 Coaching",
  startDate: "5 August 2026",
  // ISO so age can be derived rather than stored and going stale.
  birthday: "1990-03-14",
};

export function ageFrom(isoBirthday: string) {
  const born = new Date(isoBirthday);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) age -= 1;
  return age;
}

export function formatBirthday(isoBirthday: string) {
  return new Date(isoBirthday).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Seeds for the editable Profile sub-pages. Once edited, the client's own
// values live in localStorage and these are only the starting point.
export const DEFAULT_METRICS = [
  { id: "height", label: "Height", value: "183cm" },
  { id: "weight", label: "Weight", value: "88.0kg" },
  { id: "goal", label: "Goal", value: "Lean 84kg" },
  { id: "bodyfat", label: "Body fat", value: "18%" },
  { id: "arms", label: "Arms", value: "38cm" },
  { id: "waist", label: "Waist", value: "84cm" },
  { id: "hips", label: "Hips", value: "98cm" },
  { id: "thighs", label: "Thighs", value: "58cm" },
];

export const DEFAULT_TESTING = [
  { id: "bench", label: "Bench 1RM", value: "100kg" },
  { id: "deadlift", label: "Deadlift 1RM", value: "140kg" },
  { id: "squat", label: "Squat 1RM", value: "120kg" },
  { id: "run5k", label: "5km", value: "24:10" },
];

export const DEFAULT_NUTRITION = [
  { id: "calories", label: "Calories", value: "2800-3000kcal" },
  { id: "protein", label: "Protein", value: "150-170g" },
  { id: "carbs", label: "Carbs", value: "380-400g" },
  { id: "fat", label: "Fat", value: "70-90g" },
];

export const DEFAULT_HYDRATION = [
  { id: "daily", label: "Daily target", value: "3.0-3.5L" },
  { id: "training", label: "Training days", value: "+750ml per hour" },
  { id: "waking", label: "On waking", value: "500ml" },
  { id: "electrolytes", label: "Electrolytes", value: "1 serve, morning" },
  { id: "caffeine", label: "Caffeine cutoff", value: "2pm" },
];

export type PortalDocument = {
  id: string;
  emoji: string;
  title: string;
  body: string;
};

// Placeholder document library, mirroring how Paul's Notion is laid out as
// individual pages. Real content gets filled in per client; these are
// stand-ins so the section has somewhere to live.
export const DOCUMENTS: PortalDocument[] = [
  {
    id: "intake-form",
    emoji: "📋",
    title: "Intake Form",
    body: "Your original intake answers go here once that's wired up to a real source.",
  },
  {
    id: "training-program",
    emoji: "🏋",
    title: "Training Program Overview",
    body: "A plain-language walkthrough of the current program: split, progression scheme, and how deloads work.",
  },
  {
    id: "nutrition-guidelines",
    emoji: "🥗",
    title: "Nutrition Guidelines",
    body: "The reasoning behind your calorie and macro targets, and how to adjust them if things change.",
  },
];
