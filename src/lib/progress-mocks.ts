// Front-end mock data for the Progress tab sections that don't have a real
// backend yet (training adherence, weekly reviews, check-in calls). Same
// mock-first approach as the rest of the habits system.

export const MOCK_TRAINING_SESSIONS = {
  completed: 4,
  planned: 5,
};

export type WeeklyReviewStatus = "Done" | "Missed" | "Pending";

export const MOCK_WEEKLY_REVIEWS: Array<{ week: number; status: WeeklyReviewStatus }> = [
  { week: 1, status: "Done" },
  { week: 2, status: "Done" },
  { week: 3, status: "Missed" },
  { week: 4, status: "Pending" },
];

export type CallStatus = "Completed" | "Missed" | "Upcoming";

export const MOCK_CHECKIN_CALLS_TOTAL = 8;

export const MOCK_CHECKIN_CALLS: Array<{ call: number; status: CallStatus; reason?: string }> = [
  { call: 1, status: "Completed" },
  { call: 2, status: "Completed" },
  { call: 3, status: "Missed" },
  { call: 4, status: "Completed" },
  { call: 5, status: "Upcoming" },
  { call: 6, status: "Upcoming" },
  { call: 7, status: "Upcoming" },
  { call: 8, status: "Upcoming" },
];
