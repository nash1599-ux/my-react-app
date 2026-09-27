export const BLENDED_RATE = 97.5;
export const DAILY_APP_GOAL = 22;
export const DAILY_CX_GOAL = 12;
export const WEEKLY_LINE_GOAL = 74;
export const STORAGE_KEY = "gunit-live-board-2026-09-07";

export const DAYS = [
  { key: "mon", short: "MON", date: "9/7" },
  { key: "tue", short: "TUE", date: "9/8" },
  { key: "wed", short: "WED", date: "9/9", note: "CLOSE" },
  { key: "thu", short: "THU", date: "9/10", note: "LIVE", today: true },
  { key: "fri", short: "FRI", date: "9/11" },
  { key: "sat", short: "SAT", date: "9/12" },
  { key: "sun", short: "SUN", date: "9/13" },
];

export const SEED_ACTIVITY = [
  {
    id: "live-kyron-phone",
    rep: "Kyron Tisdale",
    detail: "+1 phone (Cx1 / Galaxy AT7)",
  },
];

export const SEED_REPS = [
  {
    id: "nate",
    name: "Nate",
    firstWeek: true,
    seedOrder: 0,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 3, 4, 0, 0, 0],
    cx: 4,
  },
  {
    id: "mackenzie",
    name: "Mackenzie Faith",
    firstWeek: true,
    seedOrder: 1,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 4, 0, 0, 0, 0],
    cx: 2,
  },
  {
    id: "matthew",
    name: "Matthew",
    dailyGoalHit: true,
    seedOrder: 2,
    lastWeek: 4,
    prevWeek: 1,
    days: [0, 0, 3, 1, 0, 0, 0],
    cx: 2,
  },
  {
    id: "steve-nash",
    name: "Steve Nash",
    seedOrder: 3,
    lastWeek: 5,
    prevWeek: 9,
    days: [0, 0, 0, 4, 0, 0, 0],
    cx: 2,
  },
  {
    id: "neika",
    name: "Neika",
    firstWeek: true,
    seedOrder: 4,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 0, 4, 0, 0, 0],
    cx: 2,
  },
  {
    id: "matthew-grant",
    name: "Matthew Grant",
    seedOrder: 5,
    lastWeek: 3,
    prevWeek: 8,
    days: [0, 0, 1, 3, 0, 0, 0],
    cx: 2,
  },
  {
    id: "guy",
    name: "Guy Lesperance",
    firstWeek: true,
    seedOrder: 6,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 2, 1, 0, 0, 0],
    cx: 5,
  },
  {
    id: "kyron",
    name: "Kyron Tisdale",
    seedOrder: 7,
    lastWeek: 15,
    prevWeek: 6,
    days: [0, 0, 1, 1, 0, 0, 0],
    cx: 2,
  },
  {
    id: "steveo",
    name: "Steveo Ramos",
    seedOrder: 8,
    lastWeek: 10,
    prevWeek: 3,
    days: [0, 0, 2, 0, 0, 0, 0],
    cx: 1,
  },
  {
    id: "jordan",
    name: "Jordan",
    tag: "#23",
    seedOrder: 9,
    lastWeek: 9,
    prevWeek: 5,
    days: [0, 0, 2, 0, 0, 0, 0],
    cx: 1,
  },
  {
    id: "ismael",
    name: "Ismael Ramos",
    firstWeek: true,
    seedOrder: 10,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 0, 2, 0, 0, 0],
    cx: 1,
  },
  {
    id: "shatreasure",
    name: "Shatreasure Evans",
    firstWeek: true,
    seedOrder: 11,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 0, 2, 0, 0, 0],
    cx: 1,
  },
  {
    id: "ashunte",
    name: "Ashunte Reyes",
    firstWeek: true,
    seedOrder: 12,
    lastWeek: 0,
    prevWeek: 0,
    days: [0, 0, 1, 0, 0, 0, 0],
    cx: 1,
  },
  {
    id: "judah",
    name: "Judah Rodgers",
    seedOrder: 13,
    lastWeek: 1,
    prevWeek: 0,
    days: [0, 0, 0, 0, 0, 0, 0],
    cx: 0,
  },
  {
    id: "shaad",
    name: "Shaad Hyppolite",
    seedOrder: 14,
    lastWeek: 0,
    prevWeek: 2,
    days: [0, 0, 0, 0, 0, 0, 0],
    cx: 0,
  },
];

export function formatApps(n) {
  return Number(n).toFixed(1);
}

export function formatAvg(n) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function formatMoney(n) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatPct(n) {
  return `${Math.round(n)}%`;
}

export function wow(week, lastWeek) {
  if (lastWeek === 0 && week > 0) return { kind: "new", label: "NEW" };
  if (lastWeek === 0) return { kind: "na", label: "—" };
  const pct = Math.round(((week - lastWeek) / lastWeek) * 100);
  if (pct > 0) return { kind: "up", label: `↑ ${pct}%` };
  if (pct < 0) return { kind: "down", label: `↓ ${Math.abs(pct)}%` };
  return { kind: "flat", label: "0%" };
}

export function deriveBoard(reps, options = {}) {
  const blendedRate = options.blendedRate === undefined ? BLENDED_RATE : options.blendedRate;
  const weeklyLineGoal = options.weeklyLineGoal === undefined ? WEEKLY_LINE_GOAL : options.weeklyLineGoal;
  const rows = reps.map((rep) => {
    const week = rep.days.reduce((sum, n) => sum + n, 0);
    const avg = rep.firstWeek ? week : (week + rep.lastWeek + rep.prevWeek) / 3;
    return {
      ...rep,
      week,
      avg,
      cxPct: week <= 0 ? 0 : (rep.cx / week) * 100,
      wow: wow(week, rep.lastWeek),
      est: blendedRate == null ? null : Math.round(week * blendedRate),
    };
  });

  const ranked = rows.slice().sort((a, b) => {
    if (b.week !== a.week) return b.week - a.week;
    if (b.cx !== a.cx) return b.cx - a.cx;
    return a.seedOrder - b.seedOrder;
  });

  const totals = ranked.reduce(
    (acc, rep) => {
      acc.week += rep.week;
      acc.lastWeek += rep.lastWeek;
      acc.prevWeek += rep.prevWeek;
      acc.cx += rep.cx;
      acc.avgSum += rep.avg;
      rep.days.forEach((n, index) => {
        acc.days[index] += n;
      });
      return acc;
    },
    {
      week: 0,
      lastWeek: 0,
      prevWeek: 0,
      cx: 0,
      avgSum: 0,
      days: [0, 0, 0, 0, 0, 0, 0],
    }
  );

  totals.avg = ranked.length ? totals.avgSum / ranked.length : 0;
  totals.cxPct = totals.week <= 0 ? 0 : (totals.cx / totals.week) * 100;
  totals.wow = wow(totals.week, totals.lastWeek);
  totals.est = blendedRate == null ? null : Math.round(totals.week * blendedRate);
  totals.nlLeft = weeklyLineGoal == null ? null : Math.max(0, weeklyLineGoal - totals.week);
  totals.blended = blendedRate;

  return { ranked, totals };
}

export function cloneBoard(profile) {
  const reps = profile?.reps || SEED_REPS;
  const activity = profile?.activity || SEED_ACTIVITY;
  return {
    reps: reps.map((rep) => ({ ...rep, days: [...rep.days] })),
    activity: activity.map((item) => ({ ...item })),
  };
}

function nonNeg(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export function slugify(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || "rep";
}

function sanitizeRep(seed, saved) {
  if (!saved || !Array.isArray(saved.days) || saved.days.length !== DAYS.length) {
    return { ...seed, days: [...seed.days] };
  }
  return {
    ...seed,
    days: saved.days.map(nonNeg),
    cx: nonNeg(saved.cx),
  };
}

function sanitizeAddedRep(raw, index) {
  if (!raw || typeof raw.name !== "string" || !raw.name.trim()) return null;
  if (!Array.isArray(raw.days) || raw.days.length !== 7) return null;
  const name = raw.name.trim().replace(/\s+/g, " ");
  return {
    id: String(raw.id || slugify(name)),
    name,
    firstWeek: raw.firstWeek !== false,
    dailyGoalHit: Boolean(raw.dailyGoalHit),
    tag: typeof raw.tag === "string" ? raw.tag : undefined,
    seedOrder: Number.isFinite(Number(raw.seedOrder)) ? Number(raw.seedOrder) : index,
    lastWeek: nonNeg(raw.lastWeek),
    prevWeek: nonNeg(raw.prevWeek),
    days: raw.days.map(nonNeg),
    cx: nonNeg(raw.cx),
  };
}

function readActivity(parsed, fallback) {
  const activity = Array.isArray(parsed.activity)
    ? parsed.activity.filter((item) => item && item.id && item.rep && item.detail).slice(0, 8)
    : [];
  return activity.length ? activity : fallback.map((item) => ({ ...item }));
}

export function loadBoardState(profile) {
  const fresh = cloneBoard(profile);
  const storageKey = profile?.storageKey || STORAGE_KEY;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reps)) return fresh;
    if (profile?.allowAddedReps) {
      return {
        reps: parsed.reps.map(sanitizeAddedRep).filter(Boolean),
        activity: readActivity(parsed, profile.activity),
      };
    }
    const seeds = profile?.reps || SEED_REPS;
    const saved = new Map(parsed.reps.map((rep) => [rep.id, rep]));
    return {
      reps: seeds.map((seed) => sanitizeRep(seed, saved.get(seed.id))),
      activity: readActivity(parsed, profile?.activity || SEED_ACTIVITY),
    };
  } catch {
    return fresh;
  }
}

export function addRep(board, name, entryId) {
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) return { board, error: "Enter a name." };
  if (board.reps.some((rep) => rep.name.toLowerCase() === cleaned.toLowerCase())) {
    return { board, error: "That rep is already on the board." };
  }
  let id = slugify(cleaned);
  if (board.reps.some((rep) => rep.id === id)) id = `${id}-${board.reps.length + 1}`;
  return {
    board: {
      reps: [
        ...board.reps,
        {
          id,
          name: cleaned,
          firstWeek: true,
          seedOrder: board.reps.length,
          lastWeek: 0,
          prevWeek: 0,
          days: [0, 0, 0, 0, 0, 0, 0],
          cx: 0,
        },
      ],
      activity: [{ id: entryId, rep: cleaned, detail: "added to the board" }, ...board.activity].slice(0, 8),
    },
    error: "",
  };
}

export function removeRep(board, repId, entryId) {
  const rep = board.reps.find((item) => item.id === repId);
  if (!rep) return board;
  return {
    reps: board.reps.filter((item) => item.id !== repId),
    activity: [{ id: entryId, rep: rep.name, detail: "removed from the board" }, ...board.activity].slice(0, 8),
  };
}

export function applyCount(board, { repId, dayIndex, field, delta, entryId, days = DAYS }) {
  const rep = board.reps.find((item) => item.id === repId);
  if (!rep) return board;

  if (field === "cx") {
    const nextCx = Math.max(0, rep.cx + delta);
    if (nextCx === rep.cx) return board;
    return {
      reps: board.reps.map((item) => (item.id === repId ? { ...item, cx: nextCx } : item)),
      activity: [
        {
          id: entryId,
          rep: rep.name,
          detail: `${delta > 0 ? "+1" : "−1"} close`,
        },
        ...board.activity,
      ].slice(0, 8),
    };
  }

  const current = rep.days[dayIndex] || 0;
  const nextValue = Math.max(0, current + delta);
  if (nextValue === current) return board;
  const day = days[dayIndex];
  return {
    reps: board.reps.map((item) => {
      if (item.id !== repId) return item;
      const days = item.days.slice();
      days[dayIndex] = nextValue;
      return { ...item, days };
    }),
    activity: [
      {
        id: entryId,
        rep: rep.name,
        detail: `${delta > 0 ? "+1" : "−1"} app · ${day.short}`,
      },
      ...board.activity,
    ].slice(0, 8),
  };
}

const GUNIT_NOTES = [
  "Week of Monday 9/7. Wednesday is the close. Thursday is the G-Unit live log. This board is as of Thursday 9/10.",
  "Last week is the Sunday G-Unit close. Previous week is the PM board: Grant 8, Kyron 6, Jordan 5, Shaad 2, Matthew 1.",
  "Steve Nash's previous week of 9 includes Granna 7, Leo 1, and his own 1.",
  "Steveo Ramos's previous week of 3 is Cameron's lines. Ismael Ramos is not Steveo Ramos.",
  "First week on this board: Nate, Mackenzie Faith, Neika, Guy Lesperance, Ismael Ramos, Shatreasure Evans, and Ashunte Reyes.",
];

export const TEAM7_DAYS = [
  { key: "mon", short: "MON", date: "9/21" },
  { key: "tue", short: "TUE", date: "9/22" },
  { key: "wed", short: "WED", date: "9/23" },
  { key: "thu", short: "THU", date: "9/24" },
  { key: "fri", short: "FRI", date: "9/25" },
  { key: "sat", short: "SAT", date: "9/26" },
  { key: "sun", short: "SUN", date: "9/27", note: "LIVE", today: true },
];

export const BOARDS = {
  gunit: {
    id: "gunit",
    storageKey: STORAGE_KEY,
    brand: "G-UNIT",
    eyebrow: "Sales channel",
    tagline: "Results get rewarded",
    channel: "#G-UNIT",
    weekLabel: "Sep 7 – Sep 13",
    asOf: "As of Thursday · Sep 10",
    caption: "G-Unit running week totals, week of Sep 7 through Sep 13, as of Thursday.",
    days: DAYS,
    reps: SEED_REPS,
    activity: SEED_ACTIVITY,
    notes: GUNIT_NOTES,
    resetLabel: "Reset to Thursday snapshot",
    resetConfirm: "Reset the board to the Thursday snapshot?",
    blendedRate: BLENDED_RATE,
    dailyAppGoal: DAILY_APP_GOAL,
    dailyCxGoal: DAILY_CX_GOAL,
    weeklyLineGoal: WEEKLY_LINE_GOAL,
    liveDayIndex: 3,
    liveDayName: "Thursday",
    pushLine: "Keep pushing.",
    allowAddedReps: false,
    switchLabel: "G-Unit",
  },
  team7: {
    id: "team7",
    storageKey: "team7-production-board-2026-09-21",
    brand: "TEAM 7",
    eyebrow: "Production",
    tagline: "Live floor",
    channel: "#TEAM-7",
    weekLabel: "Sep 21 – Sep 27",
    asOf: "As of Sunday · Sep 27",
    caption: "Team 7 production board, week of Sep 21 through Sep 27, as of Sunday.",
    days: TEAM7_DAYS,
    reps: [],
    activity: [
      {
        id: "team7-live",
        rep: "Team 7",
        detail: "production board is live",
      },
    ],
    notes: [
      "Week of Monday 9/21 through Sunday 9/27. Sunday is the live production day.",
      "Add each rep, then click a day to log an app and CX to log a close. Shift-click subtracts.",
      "This board starts at zero. It does not copy the G-Unit roster, pay rate, or Thursday snapshot.",
    ],
    resetLabel: "Clear the production board",
    resetConfirm: "Clear Team 7 and start the week over?",
    blendedRate: null,
    dailyAppGoal: null,
    dailyCxGoal: null,
    weeklyLineGoal: null,
    liveDayIndex: 6,
    liveDayName: "Sunday",
    pushLine: "Log the floor.",
    allowAddedReps: true,
    switchLabel: "Team 7",
  },
};
