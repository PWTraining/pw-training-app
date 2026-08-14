import { TopBar } from "@/components/top-bar";
import { TrainingAdherenceCard } from "@/components/progress-sections";

export default function TrainingAdherencePage() {
  return (
    <div>
      <TopBar />

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
          Training
        </h1>
        <p className="-mt-1 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          One combined number across gym, stretching, cardio and anything else on the plan.
        </p>

        <TrainingAdherenceCard />
      </div>
    </div>
  );
}
