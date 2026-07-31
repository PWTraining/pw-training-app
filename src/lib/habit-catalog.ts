// Static snapshot of Paul's "30 Day Results Engine" Notion database, taken
// 2026-07-30. Paul adds to that doc over time; this list won't pick up new
// rows automatically, it needs a manual refresh (or a future live Notion
// sync) when he wants the catalogue updated.

export type CatalogCategory =
  | "Sleep"
  | "Digestion"
  | "Body Composition"
  | "Energy Levels & Fatigue"
  | "Stress Tolerance & Anxiety";

export type CatalogStrength = "Strong" | "Moderate" | "Modest" | "Weak" | "Regressive";

export type CatalogEntry = {
  id: string;
  label: string;
  category: CatalogCategory;
  strength: CatalogStrength;
  notes?: string;
};

export const CATEGORY_EMOJI: Record<CatalogCategory, string> = {
  Sleep: "😴",
  Digestion: "🌀",
  "Body Composition": "💪",
  "Energy Levels & Fatigue": "⚡",
  "Stress Tolerance & Anxiety": "🧘",
};

export const STRENGTH_COLOR: Record<CatalogStrength, string> = {
  Strong: "var(--adherence-100)",
  Moderate: "var(--adherence-70)",
  Modest: "var(--adherence-50)",
  Weak: "var(--adherence-30)",
  Regressive: "var(--color-danger)",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const RAW: Array<[string, CatalogCategory, CatalogStrength, string?]> = [
  ["Eliminate gluten trial (4-6 weeks)", "Digestion", "Modest"],
  ["Digestive enzymes with meals", "Digestion", "Modest"],
  ["Cool room temperature (13-16°C)", "Sleep", "Moderate"],
  ["Cold exposure", "Stress Tolerance & Anxiety", "Regressive"],
  [
    "Fermented foods (sauerkraut, kimchi, kefir)",
    "Digestion",
    "Moderate",
    "If suspected dysbiosis, weak",
  ],
  ["Ambient music", "Stress Tolerance & Anxiety", "Modest"],
  ["NSDR meditation", "Stress Tolerance & Anxiety", "Moderate"],
  ["Meal prep", "Body Composition", "Strong"],
  ["Adequate hydration away from meals (2-3L daily)", "Digestion", "Modest"],
  ["Protein distribution across 3-4 meals", "Body Composition", "Modest"],
  ["Protein: 1.6-2.2g/kg bodyweight daily", "Body Composition", "Strong"],
  ["Resistance training 3-5x/week", "Body Composition", "Strong"],
  ["Google Calendar time management", "Stress Tolerance & Anxiety", "Strong"],
  ["Variation when sitting: standing desk, ADHD chair", "Energy Levels & Fatigue", "Modest"],
  [
    "5-30 min morning bright light exposure within 30 min of waking",
    "Sleep",
    "Strong",
  ],
  ["Exercise", "Energy Levels & Fatigue", "Strong"],
  ["No meals 2-3h before bed", "Sleep", "Moderate"],
  ["8-9h sleep", "Energy Levels & Fatigue", "Strong"],
  ["Physiological sigh breathing", "Stress Tolerance & Anxiety", "Moderate"],
  ["Reduce uncertainty and lower expectations", "Stress Tolerance & Anxiety", "Strong"],
  ["Dead quiet environment (earplugs, noise cancelling headphones)", "Sleep", "Moderate"],
  ["Minimize ultra-processed foods", "Body Composition", "Modest"],
  ["Chew food thoroughly (20-30 times per bite)", "Digestion", "Strong"],
  [
    "Reduce overwhelm: task management tools",
    "Stress Tolerance & Anxiety",
    "Strong",
    "Daily MVTs, whiteboard tasks, brain dump",
  ],
  ["Outdoor immersion nature bathing", "Stress Tolerance & Anxiety", "Strong"],
  ["Social connection and community", "Stress Tolerance & Anxiety", "Moderate"],
  ["Caffeine (3-8 mg / kg of BW)", "Energy Levels & Fatigue", "Strong"],
  ["Ashwagandha", "Stress Tolerance & Anxiety", "Modest"],
  ["Fiber: 14g per 1,000 kcal", "Digestion", "Modest", "If suspected dysbiosis, weak"],
  ["Purpose in work and life", "Energy Levels & Fatigue", "Strong"],
  ["Exercise", "Stress Tolerance & Anxiety", "Strong"],
  ["Hydration (0.033 x bodyweight)", "Energy Levels & Fatigue", "Moderate"],
  ["Sauna or hot bath pre-bed", "Sleep", "Moderate"],
  ["10-15 min walk after meals", "Digestion", "Strong"],
  ["Pitch black room (blackout curtains, sleep mask)", "Sleep", "Strong"],
  ["Blood sugar stability: protein + fat with each meal", "Energy Levels & Fatigue", "Strong"],
  ["Eliminate dairy trial (4-6 weeks)", "Digestion", "Modest"],
  ["Eat in calm, parasympathetic state (no stress/screens)", "Digestion", "Strong"],
  ["Reduce decision fatigue: outsource and delegate", "Stress Tolerance & Anxiety", "Strong"],
  ["Red light evening, blue blockers", "Sleep", "Strong"],
  ["Low FODMAP trial (4-6 weeks)", "Digestion", "Moderate"],
  [
    "Play, joy, laughing",
    "Stress Tolerance & Anxiety",
    "Strong",
    "Watching comedies, animations",
  ],
  ["Low stress (cortisol impacts body comp)", "Body Composition", "Moderate"],
  ["Daily journaling expressive writing", "Stress Tolerance & Anxiety", "Modest"],
  ["Strong chamomile tea (3-4 teabags)", "Sleep", "Modest"],
  ["Sleep 7-9h for maximal growth and retention", "Body Composition", "Strong"],
  ["Creatine monohydrate 5g daily", "Body Composition", "Strong"],
  ["5-30 min morning sunset exposure", "Sleep", "Strong"],
  ["Unfollow negative triggers", "Stress Tolerance & Anxiety", "Modest"],
  ["10-15 min of morning light within 30 min of waking", "Energy Levels & Fatigue", "Strong"],
  [
    "Creatine 0.1-0.3g / kg of BW",
    "Energy Levels & Fatigue",
    "Moderate",
    "If sleep deprivation, 20g",
  ],
  ["Hydration: 2-3L water daily + electrolytes", "Energy Levels & Fatigue", "Moderate"],
  ["CBT and cognitive reframing", "Stress Tolerance & Anxiety", "Modest"],
  ["Magnesium supplementation", "Sleep", "Moderate"],
  ["Digestive bitters before meals", "Digestion", "Moderate"],
  ["1h pre-bed wind-down: reading, calm conversation, breathwork", "Sleep", "Moderate"],
  ["Minimize refined carbs and sugar", "Energy Levels & Fatigue", "Moderate"],
  ["Consistent sleep/wake times (+/- 1 hour)", "Sleep", "Strong"],
  [
    "Intimacy: skin on skin connection with loved one for oxytocin release",
    "Sleep",
    "Modest",
    "Weighted blanket if single",
  ],
  ["Avoid eating 3h before bed", "Digestion", "Modest"],
  ["Daily steps: 8,000-12,000 for NEAT", "Body Composition", "Moderate"],
  ["Work outdoors, outdoor movement breaks", "Energy Levels & Fatigue", "Moderate"],
];

// A few interventions (e.g. "Exercise") appear once per category in Paul's
// doc, so the label alone isn't a unique id, category is folded in too.
export const HABIT_CATALOG: CatalogEntry[] = RAW.map(([label, category, strength, notes]) => ({
  id: `${slugify(label)}-${slugify(category)}`,
  label,
  category,
  strength,
  notes,
}));
