export const STORAGE_KEY = "gunit-board-v19";
export const BLENDED_RATE = 97.5;
export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function days({ wed = 0, thu = 0, fri = 0, sat = 0 } = {}) {
  return [0, 0, wed, thu, fri, sat, 0];
}

// Week of Mon Sep 21 – Sun Sep 27, 2026, as of Friday.
// This week live #G-UNIT: Grant Wed +2 Fri +1 / +2 CX. Ismael two Wed + one Thu + one Fri close on Steveo (+6 / +4 CX). Kyron Thu +1 / +1 CX. Nate Thu +2 plus Fri +6 / +4 CX. Guy Fri +2 / +1 CX.
// Last week (Mon 9/14): Ismael Friday closes sit on Steveo (4 apps / 3 CX).
// Prev week (Mon 9/7): Thursday live board plus Shaad Sat late post (+2 / +1 CX).
// Ismael is Steveo Ramos. Shaad CC #3 was not counted.
export const SEED_BOARD = {
  teamName: "G-UNIT",
  tagline: "Results get Rewarded",
  weekStart: "2026-09-21",
  asOfLabel: "as of Friday",
  dg: { current: 20, goal: 12 },
  nlLeft: 37,
  liveCall:
    "LIVE: Grant Fri Cx1 / NL1. Ismael Fri on Steveo. Nate Fri +6 / +4 CX. Guy Fri +2 / +1 CX. Kyron +1 / +1 CX. DG 20/12.",
  notes:
    "Week of Mon 9/21. Only tagged #G-UNIT closes are on this sheet. Grant Wed +2 / +1 CX plus Fri Cx1 / NL1 (+3 / +2 CX). Ismael two Wed closes plus one Thu Cx1 / iPhone 18 Pro Prem plus one Fri Cx1 / iPhone 18 Pro Prem (+6 / +4 CX) count on Steveo Ramos. Kyron Thu +1 / +1 CX. Nate Thu +2 / +1 CX plus Fri Cx2 / three Samsungs and Fri Cx1 / two 18 Pros + 17e (+8 / +4 CX). Guy Fri +2 / +1 CX. Last week Steveo 4 is Ismael's Friday closes. Prev week includes Shaad Sat late post. NL left not refreshed for the new week. Shaad CC #3 was not counted. Jordan's untagged Thu 18 Pro Max and Friday #precisionmanagement 18 PM were not counted. Coivon's tagged Friday 17e was not counted. Jamaal Brown is not on the roster.",
  reps: [
    {
      id: "mackenzie-faith",
      name: "Mackenzie Faith",
      shortName: "Mackenzie",
      accent: "gold",
      listOrder: 1,
      lastWeekApps: 0,
      prevWeekApps: 4,
      days: days(),
      cx: 0,
    },
    {
      id: "matthew-johnson",
      name: "Matthew ²",
      shortName: "Matt²",
      accent: "blue",
      listOrder: 2,
      lastWeekApps: 0,
      prevWeekApps: 4,
      days: days(),
      cx: 0,
    },
    {
      id: "steve-nash",
      name: "Steve Nash",
      shortName: "Nash",
      accent: "slate",
      listOrder: 3,
      lastWeekApps: 0,
      prevWeekApps: 4,
      days: days(),
      cx: 0,
    },
    {
      id: "neika",
      name: "Neika",
      shortName: "Neika",
      accent: "teal",
      listOrder: 4,
      lastWeekApps: 0,
      prevWeekApps: 4,
      days: days(),
      cx: 0,
    },
    {
      id: "nate",
      name: "Nate",
      shortName: "Nate",
      accent: "green",
      listOrder: 0,
      lastWeekApps: 0,
      prevWeekApps: 7,
      days: days({ thu: 2, fri: 6 }),
      cx: 4,
    },
    {
      id: "guy-lesperance",
      name: "Guy Lesperance",
      shortName: "Guy",
      accent: "teal",
      listOrder: 6,
      lastWeekApps: 0,
      prevWeekApps: 2,
      days: days({ fri: 2 }),
      cx: 1,
    },
    {
      id: "steven-ramos",
      name: "Steveo Ramos",
      shortName: "Steveo",
      accent: "green",
      listOrder: 7,
      lastWeekApps: 4,
      prevWeekApps: 4,
      days: days({ wed: 4, thu: 1, fri: 1 }),
      cx: 4,
    },
    {
      id: "jordan-aguirre",
      name: "Jordan #23",
      shortName: "Jordan",
      accent: "green",
      listOrder: 8,
      lastWeekApps: 0,
      prevWeekApps: 2,
      days: days(),
      cx: 0,
    },
    {
      id: "ashunte-reyes",
      name: "Ashunte Reyes",
      shortName: "Ashunte",
      accent: "purple",
      listOrder: 10,
      lastWeekApps: 0,
      prevWeekApps: 1,
      days: days(),
      cx: 0,
    },
    {
      id: "ky-tisdale",
      name: "Kyron Tisdale",
      shortName: "Kyron",
      accent: "blue",
      listOrder: 11,
      lastWeekApps: 0,
      prevWeekApps: 1,
      days: days({ thu: 1 }),
      cx: 1,
    },
    {
      id: "matthew-grant",
      name: "Matthew Grant",
      shortName: "Grant",
      accent: "gold",
      listOrder: 5,
      lastWeekApps: 0,
      prevWeekApps: 4,
      days: days({ wed: 2, fri: 1 }),
      cx: 2,
    },
    {
      id: "judah-rodgers",
      name: "Judah Rodgers",
      shortName: "Judah",
      accent: "slate",
      listOrder: 13,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: days(),
      cx: 0,
    },
    {
      id: "shaad-hypolite",
      name: "Shaad Hyppolite",
      shortName: "Shaad",
      accent: "purple",
      listOrder: 14,
      lastWeekApps: 0,
      prevWeekApps: 2,
      days: days(),
      cx: 0,
    },
  ],
};

export function cloneSeed() {
  return JSON.parse(JSON.stringify(SEED_BOARD));
}
