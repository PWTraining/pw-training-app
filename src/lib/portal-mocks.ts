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

export const MOCK_METRICS = [
  { label: "Bench 1RM", value: "100kg" },
  { label: "5km", value: "24:10" },
  { label: "Deadlift 1RM", value: "140kg" },
];

export const MOCK_HEALTH_STATS = [
  { label: "Weight", value: "88.0kg" },
  { label: "Arms", value: "38cm" },
  { label: "Waist", value: "84cm" },
  { label: "Hips", value: "98cm" },
  { label: "Thighs", value: "58cm" },
];

export const MOCK_FOOD_SNAPSHOT = {
  calories: "2800-3000kcal",
  protein: "150-170g",
  carbs: "380-400g",
  fat: "70-90g",
};

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
