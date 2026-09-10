export const STORAGE_KEY = "gunit-board-v1";
export const BLENDED_RATE = 97.5;
export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Week of Mon Sep 1 – Sun Sep 7, 2026, as of Sunday close.
// Source: G-Unit Google Sheet snapshot (Thu Sep 10).
export const SEED_BOARD = {
  teamName: "G-UNIT",
  tagline: "Results get Rewarded",
  weekStart: "2026-09-01",
  asOfLabel: "as of Sunday",
  dg: { current: 1, goal: 10 },
  nlLeft: 25,
  notes:
    "Week started Monday 9/1. Blended $line estimate $97.50. LAST WEEK / PREV WEEK rolled from the G-Unit sheet.",
  reps: [
    {
      id: "steve-nash",
      name: "Steve Nash",
      accent: "slate",
      lastWeekApps: 7,
      prevWeekApps: 14,
      days: [0, 0, 0, 0, 0, 0, 1],
      cx: 1,
    },
    {
      id: "matthew-grant",
      name: "Matthew Grant",
      accent: "gold",
      lastWeekApps: 7,
      prevWeekApps: 10,
      days: [1, 2, 1, 0, 2, 0, 0],
      cx: 3,
    },
    {
      id: "steven-ramos",
      name: "Steven Ramos",
      accent: "green",
      lastWeekApps: 9,
      prevWeekApps: 6,
      days: [0, 2, 1, 3, 0, 1, 0],
      cx: 4,
    },
    {
      id: "ky-tisdale",
      name: "Ky. Tisdale",
      accent: "blue",
      lastWeekApps: 6,
      prevWeekApps: 6,
      days: [0, 2, 2, 0, 0, 2, 0],
      cx: 3,
    },
    {
      id: "shaad-hypolite",
      name: "Shaad Hypolite",
      accent: "purple",
      lastWeekApps: 6,
      prevWeekApps: 7,
      days: [0, 0, 0, 2, 0, 0, 0],
      cx: 2,
    },
    {
      id: "jordan-aguirre",
      name: "Jordan Aguirre",
      accent: "green",
      lastWeekApps: 23,
      prevWeekApps: 5,
      days: [0, 2, 0, 2, 0, 0, 1],
      cx: 3,
    },
    {
      id: "gianna-smith",
      name: "Gianna Smith",
      accent: "gold",
      lastWeekApps: 7,
      prevWeekApps: 0,
      days: [0, 2, 0, 2, 2, 1, 0],
      cx: 2,
    },
    {
      id: "cameron-winfield",
      name: "Cameron Winfield",
      accent: "teal",
      lastWeekApps: 0,
      prevWeekApps: 1,
      days: [2, 0, 0, 0, 0, 0, 0],
      cx: 2,
    },
    {
      id: "matthew-johnson",
      name: "Matthew Johnson",
      accent: "blue",
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: [0, 0, 1, 0, 0, 0, 0],
      cx: 1,
    },
    {
      id: "leo-chowdhury",
      name: "Leo Chowdhury",
      accent: "purple",
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: [0, 0, 0, 0, 1, 0, 0],
      cx: 1,
    },
  ],
};

export function cloneSeed() {
  return JSON.parse(JSON.stringify(SEED_BOARD));
}
