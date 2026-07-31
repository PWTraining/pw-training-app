"use client";

import { TopBar } from "@/components/top-bar";

const NON_NEGOTIABLES = [
  { emoji: "🥗", title: "Meal Consistency", detail: "Eat breakfast, lunch, and dinner" },
  { emoji: "🎯", title: "Protein Target", detail: "One source of protein in every meal" },
  { emoji: "💧", title: "Daily Hydration", detail: "2.5L of water plus 1L of coconut water on running days" },
  { emoji: "🏋", title: "Strength Training", detail: "Full body x 3 days a week" },
  { emoji: "☮️", title: "Down Regulate Before Eating", detail: "Three deep breaths, smell your food, look at it" },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-[var(--radius-lg)] border p-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PortalPage() {
  return (
    <div>
      <TopBar title="Portal" />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <Card title="Win the first 30 days: Alexander Simmonds">
          <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Total food intake and consistent hydration are the two big levers, matched to your
            current training and output at work. Training is full body strength, 3x a week, to
            maximise muscle growth.
          </p>
          <div className="flex flex-col gap-2">
            {NON_NEGOTIABLES.map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className="text-lg leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <div>
                  <div className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>
                    {item.title}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Health & metrics snapshot">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Weight", value: "88.0kg" },
              { label: "Bench 1RM", value: "100kg" },
              { label: "5km", value: "24:10" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--radius-sm)] border py-2"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  {stat.value}
                </div>
                <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-md border py-2 text-xs font-medium"
            style={{ borderColor: "var(--color-border)", color: "var(--color-brand)" }}
          >
            + Log a new metric
          </button>
        </Card>

        <Card title="Food: current snapshot">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Protein", value: "150–170g" },
              { label: "Carbs", value: "380–400g" },
              { label: "Fat", value: "70–90g" },
            ].map((macro) => (
              <div
                key={macro.label}
                className="rounded-[var(--radius-sm)] border py-2"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  {macro.value}
                </div>
                <div className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                  {macro.label}
                </div>
              </div>
            ))}
          </div>
          <a
            href="#"
            className="mt-3 block text-center text-xs font-medium"
            style={{ color: "var(--color-brand)" }}
          >
            View micronutrient audit ▸
          </a>
        </Card>

        <Card title="Roadmap">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Nothing logged yet. Your visual roadmap (calls, 4-week marks, testing days) shows up
            here once Paul builds your plan.
          </p>
        </Card>

        <Card title="Overall adherence">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--adherence-70)", color: "#1a1a1a" }}
            >
              72%
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Pulled from habits, training, mood and check-ins. Missing data is redistributed
              across what&rsquo;s tracked. It&rsquo;s never read as failure.
            </p>
          </div>
        </Card>

        <button
          type="button"
          className="rounded-[var(--radius-md)] border py-3 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          ✎ Quick capture
        </button>
      </div>
    </div>
  );
}
