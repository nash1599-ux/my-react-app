export const STORAGE_KEY = "gunit-board-v2";
export const BLENDED_RATE = 97.5;
export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function wed(apps) {
  return [0, 0, apps, 0, 0, 0, 0];
}

// Week of Mon Sep 7 – Sun Sep 13, 2026, as of Wednesday.
// Current week numbers from the G-Unit Slack board. Last/prev week kept
// for reps who were on the Sunday sheet; Gianna, Cameron, and Leo dropped.
export const SEED_BOARD = {
  teamName: "G-UNIT",
  tagline: "Results get Rewarded",
  weekStart: "2026-09-07",
  asOfLabel: "as of Wednesday",
  dg: { current: 12, goal: 12 },
  nlLeft: 55,
  liveCall:
    "LIVE: Matthew J (Matthew ²) +3 phones (Cx1 / three Samsung S26 Ultra). Daily goal HIT.",
  notes:
    "Week of Mon 9/7. Wednesday board: DG 12/12, 55 NL left. Last/prev week kept for returning reps from the Sunday sheet.",
  reps: [
    {
      id: "mackenzie-faith",
      name: "Mackenzie Faith",
      shortName: "Mackenzie",
      accent: "gold",
      listOrder: 1,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: wed(4),
      cx: 2,
    },
    {
      id: "nate",
      name: "Nate",
      shortName: "Nate",
      accent: "green",
      listOrder: 2,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: wed(3),
      cx: 3,
    },
    {
      id: "matthew-johnson",
      name: "Matthew ²",
      shortName: "Matt²",
      accent: "blue",
      listOrder: 3,
      lastWeekApps: 1,
      prevWeekApps: 0,
      days: wed(3),
      cx: 1,
      badge: "Daily goal HIT",
    },
    {
      id: "guy-lesperance",
      name: "Guy Lesperance",
      shortName: "Guy",
      accent: "teal",
      listOrder: 4,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: wed(2),
      cx: 4,
    },
    {
      id: "jordan-aguirre",
      name: "Jordan #23",
      shortName: "Jordan",
      accent: "green",
      listOrder: 5,
      lastWeekApps: 5,
      prevWeekApps: 23,
      days: wed(2),
      cx: 1,
    },
    {
      id: "steven-ramos",
      name: "Steveo Ramos",
      shortName: "Steveo",
      accent: "green",
      listOrder: 6,
      lastWeekApps: 7,
      prevWeekApps: 9,
      days: wed(2),
      cx: 1,
    },
    {
      id: "ashunte-reyes",
      name: "Ashunte Reyes",
      shortName: "Ashunte",
      accent: "purple",
      listOrder: 7,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: wed(1),
      cx: 1,
    },
    {
      id: "ky-tisdale",
      name: "Kyron Tisdale",
      shortName: "Kyron",
      accent: "blue",
      listOrder: 8,
      lastWeekApps: 6,
      prevWeekApps: 6,
      days: wed(1),
      cx: 1,
    },
    {
      id: "matthew-grant",
      name: "Matthew Grant",
      shortName: "Grant",
      accent: "gold",
      listOrder: 9,
      lastWeekApps: 6,
      prevWeekApps: 7,
      days: wed(1),
      cx: 1,
    },
    {
      id: "judah-rodgers",
      name: "Judah Rodgers",
      shortName: "Judah",
      accent: "slate",
      listOrder: 10,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: wed(0),
      cx: 0,
    },
    {
      id: "steve-nash",
      name: "Steve Nash",
      shortName: "Nash",
      accent: "slate",
      listOrder: 11,
      lastWeekApps: 1,
      prevWeekApps: 7,
      days: wed(0),
      cx: 0,
    },
    {
      id: "shaad-hypolite",
      name: "Shaad Hyppolite",
      shortName: "Shaad",
      accent: "purple",
      listOrder: 12,
      lastWeekApps: 2,
      prevWeekApps: 6,
      days: wed(0),
      cx: 0,
    },
  ],
};

export function cloneSeed() {
  return JSON.parse(JSON.stringify(SEED_BOARD));
}
