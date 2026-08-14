// Mock training program schedule for the Train tab's week view. No real
// program/session backend yet, so sessions are derived deterministically
// from the day of the week, and completion status from a stable hash of
// the date — same approach as the habits mocks (mockDayValue).

export type DaySessionInfo = {
  title: string;
  exerciseCount: number;
  // Short note on the session, written per day on the coaching side.
  note?: string;
} | null;

// index 0 = Sunday .. 6 = Saturday. 3 full-body sessions a week — Mon/Wed/Fri
// — with rest days in between.
export const WEEKLY_SESSION_PLAN: DaySessionInfo[] = [
  null,
  {
    title: "Full Body",
    exerciseCount: 3,
    note: "Leave two reps in the tank on the squats. Control the way down on everything.",
  },
  null,
  {
    title: "Full Body",
    exerciseCount: 3,
    note: "Leave two reps in the tank on the squats. Control the way down on everything.",
  },
  null,
  {
    title: "Full Body",
    exerciseCount: 3,
    note: "Leave two reps in the tank on the squats. Control the way down on everything.",
  },
  null,
];

export function todaysSession(): string | null {
  return WEEKLY_SESSION_PLAN[new Date().getDay()]?.title ?? null;
}

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

// Local calendar date, not toISOString — that shifts to the previous day for
// anyone east of UTC, which is everyone using this app.
export function dateKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function dateFromKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export type ProgramDay = {
  date: Date;
  key: string;
  weekdayLabel: string;
  dateNum: number;
  session: DaySessionInfo;
  status: DayStatus;
};

export function programDayFor(date: Date): ProgramDay {
  return {
    date,
    key: dateKey(date),
    weekdayLabel: WEEKDAY_LABELS[date.getDay()],
    dateNum: date.getDate(),
    session: WEEKLY_SESSION_PLAN[date.getDay()],
    status: statusForDate(date),
  };
}

export function longDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getWeekDays(weekOffset: number): ProgramDay[] {
  const monday = startOfWeek(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return programDayFor(d);
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
