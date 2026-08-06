// Mock training program schedule for the Train tab's week view. No real
// program/session backend yet, so sessions are derived deterministically
// from the day of the week, and completion status from a stable hash of
// the date — same approach as the habits mocks (mockDayValue).

export type DaySessionInfo = { title: string; exerciseCount: number } | null;

// index 0 = Sunday .. 6 = Saturday
export const WEEKLY_SESSION_PLAN: DaySessionInfo[] = [
  null,
  { title: "Upper / Lower, Week 4", exerciseCount: 6 },
  { title: "Lower Body Strength", exerciseCount: 5 },
  null,
  { title: "Upper Body Push/Pull", exerciseCount: 6 },
  { title: "Full Body Conditioning", exerciseCount: 8 },
  null,
];

export function todaysSession(): string | null {
  return WEEKLY_SESSION_PLAN[new Date().getDay()]?.title ?? null;
}

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function hashDate(date: Date): number {
  const s = date.toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export type DayStatus = "completed" | "missed" | "today" | "upcoming" | "rest";

export function statusForDate(date: Date): DayStatus {
  const today = new Date();
  const info = WEEKLY_SESSION_PLAN[date.getDay()];
  if (isSameDay(date, today)) return "today";
  if (!info) return "rest";
  if (date.getTime() > today.getTime()) return "upcoming";
  return hashDate(date) % 5 === 0 ? "missed" : "completed";
}

export type ProgramDay = {
  date: Date;
  key: string;
  weekdayLabel: string;
  dateNum: number;
  session: DaySessionInfo;
  status: DayStatus;
};

export function getWeekDays(weekOffset: number): ProgramDay[] {
  const monday = startOfWeek(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      key: d.toDateString(),
      weekdayLabel: WEEKDAY_LABELS[d.getDay()],
      dateNum: d.getDate(),
      session: WEEKLY_SESSION_PLAN[d.getDay()],
      status: statusForDate(d),
    };
  });
}

// Mock program start — how far back "history" goes. Real data would read
// the client's actual program start date instead of a fixed offset.
const PROGRAM_START_WEEK = (() => {
  const d = startOfWeek(new Date());
  d.setDate(d.getDate() - 10 * 7);
  return d;
})();

export const MAX_WEEK_OFFSET = 1;

export function minWeekOffset(): number {
  const thisWeek = startOfWeek(new Date());
  return Math.round((PROGRAM_START_WEEK.getTime() - thisWeek.getTime()) / WEEK_MS);
}

export function weekRangeLabel(days: ProgramDay[]): string {
  const start = days[0].date;
  const end = days[6].date;
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export { DAY_MS };
