"use client";

import { useHabits } from "@/lib/habits-context";
import {
  BLOCK_LENGTH,
  TODAY_INDEX,
  PERIOD_DAYS,
  PERIOD_COLUMNS,
  mockDayValue,
  adherenceColor,
  type HabitComment,
  type Timeframe,
} from "@/lib/habits";

// Every timeframe's card is the same fixed height, so switching Today/Week
// /Block/Year never resizes the callout — only the circles inside change
// size and count. Row height shrinks as a period needs more rows (Year's
// dense heatmap vs Week's single row); each circle is then capped to
// whichever is smaller, its row height or its column width, so it never
// overflows or distorts, using CSS `min(100%, Npx)` + aspect-ratio.
const CONTAINER_HEIGHT = 96; // px

function cellMetrics(rows: number) {
  const gap = rows <= 1 ? 0 : rows <= 4 ? 4 : 2;
  const cell = (CONTAINER_HEIGHT - Math.max(0, rows - 1) * gap) / rows;
  return { cell, gap };
}

function Cell({
  cellPx,
  isToday,
  isLive,
  value,
  hasComment,
  onClick,
  ariaLabel,
}: {
  cellPx: number;
  isToday: boolean;
  isLive: boolean;
  value: number;
  hasComment?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const circle = (
    <div
      className="relative rounded-full"
      style={{
        width: `min(100%, ${cellPx}px)`,
        aspectRatio: "1",
        border: `${isToday ? 2 : 1}px ${isLive ? "solid" : "dashed"} ${
          isToday ? "var(--color-brand)" : "var(--color-border)"
        }`,
        opacity: isLive ? 1 : 0.35,
        background: isLive && value > 0 ? adherenceColor(value) : "transparent",
      }}
    >
      {hasComment && (
        <span
          className="absolute -right-[1px] -top-[1px] h-1.5 w-1.5 rounded-full border"
          style={{ background: "var(--color-brand)", borderColor: "var(--color-surface)" }}
          aria-hidden
        />
      )}
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={ariaLabel} className="flex items-center justify-center">
        {circle}
      </button>
    );
  }
  return <div className="flex items-center justify-center">{circle}</div>;
}

function GridFrame({
  columns,
  cellPx,
  gap,
  children,
}: {
  columns: number;
  cellPx: number;
  gap: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: `${cellPx}px`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

export function HabitGrid({
  habitId,
  todayValue,
  comments,
  onSelectDay,
  period = "Monthly",
}: {
  habitId: string;
  todayValue?: number;
  comments?: HabitComment[];
  onSelectDay?: (day: number) => void;
  period?: Timeframe;
}) {
  const { dayValue } = useHabits();
  const commentDays = new Set((comments ?? []).map((c) => c.day));

  // Monthly is a forward-looking "day 11 of 28" block view (with future
  // days padded out), not a trailing history window like the rest. Its cell
  // indices map 1:1 to block day indices, so it reads through dayValue and
  // picks up any past day the client has since filled in.
  if (period === "Monthly") {
    const rows = Math.ceil(BLOCK_LENGTH / 7);
    const { cell, gap } = cellMetrics(rows);

    return (
      <GridFrame columns={7} cellPx={cell} gap={gap}>
        {Array.from({ length: BLOCK_LENGTH }, (_, i) => {
          const isFuture = i > TODAY_INDEX;
          const isToday = i === TODAY_INDEX;
          const value = isToday ? (todayValue ?? 0) : dayValue(habitId, i);
          const hasComment = commentDays.has(i);

          return (
            <Cell
              key={i}
              cellPx={cell}
              isToday={isToday}
              isLive={!isFuture}
              value={value}
              hasComment={hasComment}
              onClick={hasComment && onSelectDay ? () => onSelectDay(i) : undefined}
              ariaLabel={hasComment ? `Day ${i + 1}, has a note` : undefined}
            />
          );
        })}
      </GridFrame>
    );
  }

  // Daily/Weekly/Yearly: a trailing window ending today (last cell).
  const totalCells = PERIOD_DAYS[period];
  const columns = PERIOD_COLUMNS[period];
  const rows = Math.ceil(totalCells / columns);
  const { cell, gap } = cellMetrics(rows);

  return (
    <GridFrame columns={columns} cellPx={cell} gap={gap}>
      {Array.from({ length: totalCells }, (_, i) => {
        const isToday = i === totalCells - 1;
        const value = isToday ? (todayValue ?? 0) : mockDayValue(habitId, i);
        return <Cell key={i} cellPx={cell} isToday={isToday} isLive value={value} />;
      })}
    </GridFrame>
  );
}
