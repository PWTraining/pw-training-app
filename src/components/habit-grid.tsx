import { BLOCK_LENGTH, TODAY_INDEX, MOCK_BLOCK, adherenceColor } from "@/lib/habits";

export function HabitGrid({ habitId, todayValue }: { habitId: string; todayValue?: number }) {
  const loggedDays = MOCK_BLOCK[habitId] ?? [];

  return (
    <div className="grid w-fit grid-cols-7 gap-1">
      {Array.from({ length: BLOCK_LENGTH }, (_, i) => {
        const isFuture = i > TODAY_INDEX;
        const isToday = i === TODAY_INDEX;
        const value = isToday ? (todayValue ?? 0) : (loggedDays[i] ?? 0);

        return (
          <div
            key={i}
            className="h-5 w-5 rounded-[3px] border"
            style={{
              borderColor: isToday ? "var(--color-brand)" : "var(--color-border)",
              borderStyle: isFuture ? "dashed" : "solid",
              opacity: isFuture ? 0.35 : 1,
              background: !isFuture && value > 0 ? adherenceColor(value) : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}
