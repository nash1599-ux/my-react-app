export const BLENDED_RATE = 97.5;
export const CX_TIERS = [
  [9, 100],
  [7, 75],
  [5, 50],
  [4, 30],
];
export const STORAGE_KEY = "gunit-salesboard-v3";
export const DEFAULT_TEAM_WEEKLY_GOAL = 28;

export const ALIASES = {
  quay: "Jaquay Tyler",
  "quay tyler": "Jaquay Tyler",
  ky: "Kyron Tisdale",
  "ky. tisdale": "Kyron Tisdale",
  "ky tisdale": "Kyron Tisdale",
  "steve nash": "Nashly Paul",
  "steveo ramos": "Ismael Ramos",
  "steve ramos": "Ismael Ramos",
  "shaad hypolite": "Rashaad Hypolite",
  jayden: "Jayden Dale",
  jordan: "Jordan Aguirre",
  "jordan #23": "Jordan Aguirre",
  "jordan 23": "Jordan Aguirre",
  gigi: "Gianna Smith",
  "gigi smith": "Gianna Smith",
};

const LINE_RE =
  /(?:(\d+)\.?\s*)?(?:🥇|🥈|🥉)?\s*([A-Za-z][A-Za-z0-9.#'\-\s]*?)\s+(\d+)\s*App[s]?\s*\|\s*(\d+)\s*CX(.*)/i;
const BANNER_RE = /DG:\s*(\d+)\/(\d+)\s*\|\s*(\d+)\s*NL LEFT\s*\|\s*(.+)/i;
const SLACK_MEDAL_REPLACEMENTS = [
  [/:first_place_medal:/gi, "1. 🥇 "],
  [/:second_place_medal:/gi, "2. 🥈 "],
  [/:third_place_medal:/gi, "3. 🥉 "],
];
const DAY_ALIASES = {
  mondi: "Monday",
  mon: "Monday",
  tue: "Tuesday",
  tues: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  thur: "Thursday",
  thurs: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export function preprocessSlackBoard(text) {
  let out = String(text || "");
  for (const [token, replacement] of SLACK_MEDAL_REPLACEMENTS) {
    out = out.replace(token, replacement);
  }
  return out.replace(/:[a-z0-9_+-]+:/gi, "");
}

export function normalizeDay(rawDay) {
  const cleaned = String(rawDay || "")
    .replace(/[║╔╗╚╝═━]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[|\s]+|[|\s]+$/g, "");
  return DAY_ALIASES[cleaned.toLowerCase()] || cleaned;
}

export function normalizeName(rawName) {
  const cleaned = String(rawName || "").trim().replace(/\s+/g, " ");
  return ALIASES[cleaned.toLowerCase()] || cleaned;
}

export function tierBonus(cx) {
  const count = Number(cx) || 0;
  for (const [threshold, bonus] of CX_TIERS) {
    if (count >= threshold) return bonus;
  }
  return 0;
}

export function estimatedEarned(apps, cx, rate = BLENDED_RATE) {
  return Math.round(Number(apps || 0) * rate + tierBonus(cx));
}

export function cxPercent(apps, cx) {
  if (!apps) return 0;
  return Math.round((Number(cx || 0) / Number(apps)) * 100);
}

export function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

export function formatSignedPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "new";
  }
  const n = Number(value);
  if (n === 0) return "0%";
  const sign = n > 0 ? "+" : "";
  return `${sign}${Math.round(n)}%`;
}

function wowFromLastWeek(apps, lastWeekApps) {
  if (lastWeekApps === null || lastWeekApps === undefined) return null;
  if (!lastWeekApps) return apps ? 100 : 0;
  return ((apps - lastWeekApps) / lastWeekApps) * 100;
}

export function hydrateRep(rep) {
  const apps = Number(rep.apps) || 0;
  const cx = Number(rep.cx) || 0;
  const lastWeekApps =
    rep.lastWeekApps === null || rep.lastWeekApps === undefined
      ? null
      : Number(rep.lastWeekApps) || 0;
  const lastWeekCx =
    rep.lastWeekCx === null || rep.lastWeekCx === undefined
      ? null
      : Number(rep.lastWeekCx) || 0;
  const wow =
    rep.wow === null || rep.wow === undefined
      ? wowFromLastWeek(apps, lastWeekApps)
      : Number(rep.wow);
  return {
    ...rep,
    apps,
    cx,
    lastWeekApps,
    lastWeekCx,
    displayName: rep.displayName || rep.name,
    name: normalizeName(rep.name || rep.displayName),
    cxPct: cxPercent(apps, cx),
    wow,
    earned: estimatedEarned(apps, cx),
    bonus: tierBonus(cx),
    flags: [...(rep.flags || [])],
  };
}

export function rankReps(reps) {
  return [...reps]
    .map(hydrateRep)
    .sort(
      (a, b) =>
        b.apps - a.apps ||
        b.cx - a.cx ||
        (b.lastWeekApps || 0) - (a.lastWeekApps || 0) ||
        a.name.localeCompare(b.name)
    )
    .map((rep, index) => ({ ...rep, rank: index + 1 }));
}

function emptyDaily() {
  return { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
}

export function summarizeTotals(reps, rate = BLENDED_RATE) {
  const apps = reps.reduce((sum, rep) => sum + (Number(rep.apps) || 0), 0);
  const cx = reps.reduce((sum, rep) => sum + (Number(rep.cx) || 0), 0);
  const bonus = reps.reduce((sum, rep) => sum + tierBonus(rep.cx), 0);
  return {
    apps,
    cx,
    cxPct: cxPercent(apps, cx),
    earned: Math.round(apps * rate + bonus),
  };
}

export function withWeeklyGoal(board, totals) {
  const goal = Number(board.teamWeeklyGoal || DEFAULT_TEAM_WEEKLY_GOAL);
  const produced = totals.cx;
  const nlLeft = Math.max(0, goal - produced);
  const pct = goal ? Math.min(100, Math.round((produced / goal) * 100)) : 0;
  return {
    teamWeeklyGoal: goal,
    weeklyGoal: {
      goal,
      produced,
      nlLeft,
      pct,
      hit: produced >= goal,
    },
    goals: [
      {
        id: "team",
        label: "This week team goal",
        goal,
        produced,
        nlLeft,
        tone: nlLeft <= 3 ? "hot" : nlLeft <= 10 ? "warn" : "goal",
      },
    ],
  };
}

export function summarizeBoard(board) {
  const reps = rankReps(board.reps || []);
  const rate = board.blendedRate || BLENDED_RATE;
  const totals = summarizeTotals(reps, rate);
  const lastWeekReps = rankReps(
    (board.lastWeek?.reps || []).map((rep) => ({
      ...rep,
      lastWeekApps: rep.prevWeekApps,
      lastWeekCx: rep.prevWeekCx,
    }))
  );
  const lastWeekTotals =
    board.lastWeek?.totals || summarizeTotals(lastWeekReps, rate);
  return {
    ...board,
    reps,
    totals,
    lastWeek: board.lastWeek
      ? {
          ...board.lastWeek,
          reps: lastWeekReps.length ? lastWeekReps : board.lastWeek.reps,
          totals: lastWeekTotals,
        }
      : null,
    ...withWeeklyGoal(board, totals),
  };
}

const LAST_WEEK_REPS = [
  {
    displayName: "Jordan Aguirre",
    name: "Jordan Aguirre",
    apps: 17,
    cx: 6,
    prevWeekApps: 4,
    prevWeekCx: 2,
    rollingAvg: 10.5,
    daily: [2, 4, 3, 2, 0],
  },
  {
    displayName: "Steveo Ramos",
    name: "Ismael Ramos",
    apps: 9,
    cx: 5,
    prevWeekApps: 8,
    prevWeekCx: 7,
    rollingAvg: 8.5,
    daily: [0, 3, 2, 0, 3],
  },
  {
    displayName: "Steve Nash",
    name: "Nashly Paul",
    apps: 7,
    cx: 3,
    prevWeekApps: 14,
    prevWeekCx: 6,
    rollingAvg: 9.7,
    daily: [4, 0, 0, 0, 3],
  },
  {
    displayName: "Matthew Grant",
    name: "Matthew Grant",
    apps: 6,
    cx: 4,
    prevWeekApps: 10,
    prevWeekCx: 3,
    rollingAvg: 7.0,
    daily: [2, 2, 0, 2, 0],
  },
  {
    displayName: "Ky. Tisdale",
    name: "Kyron Tisdale",
    apps: 6,
    cx: 1,
    prevWeekApps: 6,
    prevWeekCx: 3,
    rollingAvg: 5.0,
    daily: [0, 1, 0, 0, 3],
  },
  {
    displayName: "Shaad Hypolite",
    name: "Rashaad Hypolite",
    apps: 6,
    cx: 4,
    prevWeekApps: 7,
    prevWeekCx: 3,
    rollingAvg: 7.3,
    daily: [0, 0, 2, 4, 0],
  },
  {
    displayName: "Gianna Smith",
    name: "Gianna Smith",
    apps: 5,
    cx: 2,
    prevWeekApps: null,
    prevWeekCx: null,
    rollingAvg: 5.0,
    daily: [2, 0, 0, 0, 3],
  },
  {
    displayName: "Quay Tyler",
    name: "Jaquay Tyler",
    apps: 0,
    cx: 0,
    prevWeekApps: 4,
    prevWeekCx: 1,
    rollingAvg: 2.0,
    daily: [0, 0, 0, 0, 0],
  },
];

export const LAST_WEEK_CLOSED = {
  label: "Last week · Aug 17–23",
  day: "Sunday close",
  sourceLabel: "Thursday full export + Sunday remaining",
  pendingWeekend: true,
  sundayRemaining: { team: 3, office: 9, cancun: 10 },
  dailyTotals: { mon: 10, tue: 10, wed: 7, thu: 8, fri: 12, sat: null, sun: null },
  notes: [
    "Closed with Thursday per-rep numbers. Saturday and Sunday from Google Docs are still pending.",
    "Sunday remaining: 3 NL team, 9 office, 10 Cancun.",
  ],
  reps: LAST_WEEK_REPS,
  totals: summarizeTotals(LAST_WEEK_REPS.map(hydrateRep)),
};

export function rolloverIntoNewWeek(lastWeek = LAST_WEEK_CLOSED, teamWeeklyGoal = DEFAULT_TEAM_WEEKLY_GOAL) {
  const closed = {
    ...lastWeek,
    reps: rankReps(lastWeek.reps || []),
    totals: lastWeek.totals || summarizeTotals((lastWeek.reps || []).map(hydrateRep)),
  };
  const reps = closed.reps.map((rep) => ({
    displayName: rep.displayName,
    name: rep.name,
    apps: 0,
    cx: 0,
    lastWeekApps: rep.apps,
    lastWeekCx: rep.cx,
    rollingAvg: rep.rollingAvg ?? null,
    daily: [0, 0, 0, 0, 0, 0, 0],
    flags: [],
  }));

  return summarizeBoard({
    title: "G-UNIT SALES BOARD",
    day: "Monday",
    weekLabel: "Week of Aug 24",
    sourceLabel: "New week · last week production archived",
    dataAsOf: "This week started Monday Aug 24",
    dgNum: 0,
    dgDen: 10,
    blendedRate: BLENDED_RATE,
    teamWeeklyGoal,
    lastWeek: closed,
    dailyTotals: emptyDaily(),
    notes: [
      "Last week is archived so G-Unit can track this week's team goal against last week's production.",
      closed.pendingWeekend
        ? "Saturday/Sunday last-week counts are still pending from the Google Doc."
        : "Last week includes the latest pasted weekend close.",
      `This week's team goal is ${teamWeeklyGoal} NL (from last week's 25 CX + 3 remaining Sunday). Paste a new target if the Google Doc differs.`,
      "Est. $ = (Apps × $97.50) + CX tier bonus. Not payroll.",
    ],
    reps,
  });
}

export const WEEK_OPENING = rolloverIntoNewWeek(LAST_WEEK_CLOSED, DEFAULT_TEAM_WEEKLY_GOAL);

export const MONDAY_BOARD_TEXT = `
╔══════════════════════════════════════╗
║    :military_helmet: G-UNIT SALES BOARD :saluting_face::moneybag:      ║
║  :bar_chart: DG:9/12 |50 NL LEFT |  MONDI ║
╚══════════════════════════════════════╝
:trophy: LEADERBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
:first_place_medal:    Gigi Smith            6 Apps | 2 CX
:second_place_medal: Matthew Grant        1 App  | 1 CX
:third_place_medal:Steveo Ramos     0 App | 1 CX
4. Jordan #23             0 App|  1 CX
5. Ky.  Tisdale             0 App  | 1 CX
6 Cam Winfield                 2 App | 1 CX
7.Shaad Hypolite         0 App | 0 CX
8. Steve Nash             0 App  | 0 CX
`;

function parseRows(source) {
  const text = preprocessSlackBoard(source);
  const bannerMatch = text.match(BANNER_RE);
  const banner = bannerMatch
    ? {
        dgNum: Number(bannerMatch[1]),
        dgDen: Number(bannerMatch[2]),
        nlLeft: Number(bannerMatch[3]),
        day: normalizeDay(bannerMatch[4]),
      }
    : {};

  const reps = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const match = rawLine.match(LINE_RE);
    if (!match) continue;
    const displayName = match[2].trim().replace(/\s+/g, " ");
    const apps = Number(match[3]);
    const cx = Number(match[4]);
    const tail = (match[5] || "").trim();
    const flags = [];
    if (cx > apps) flags.push("DATA ERROR: CX exceeds Apps");
    reps.push({
      displayName,
      name: normalizeName(displayName),
      apps,
      cx,
      lastWeekApps: null,
      lastWeekCx: null,
      wow: null,
      rollingAvg: null,
      daily: [],
      flags,
      tail,
    });
  }

  if (!reps.length) {
    throw new Error("No ranked rows found. Use lines like: 1. Jordan Aguirre 17 Apps | 6 CX");
  }

  return { banner, reps };
}

export function parseBoardText(text, previous = OFFICIAL_SNAPSHOT) {
  const { banner, reps } = parseRows(String(text || ""));
  const lastWeekByName = Object.fromEntries(
    (previous.lastWeek?.reps || []).map((rep) => [rep.name, rep])
  );

  const merged = reps.map((rep) => {
    const prior = lastWeekByName[rep.name];
    return {
      ...rep,
      lastWeekApps: prior ? prior.apps : null,
      lastWeekCx: prior ? prior.cx : null,
    };
  });

  const teamWeeklyGoal =
    banner.nlLeft !== undefined
      ? (previous.teamWeeklyGoal || DEFAULT_TEAM_WEEKLY_GOAL)
      : previous.teamWeeklyGoal || DEFAULT_TEAM_WEEKLY_GOAL;

  const next = summarizeBoard({
    ...previous,
    day: banner.day || previous.day,
    dgNum: banner.dgNum ?? previous.dgNum,
    dgDen: banner.dgDen ?? previous.dgDen,
    sourceLabel: "Pasted this-week scoreboard",
    dataAsOf: "Updated from pasted scoreboard text",
    teamWeeklyGoal,
    notes: [
      "This week updated from pasted Slack scoreboard text.",
      "Last week production is still archived on the board.",
    ],
    reps: merged,
  });

  if (banner.nlLeft !== undefined) {
    next.teamWeeklyGoal = next.totals.cx + banner.nlLeft;
    return summarizeBoard(next);
  }
  return next;
}

export const OFFICIAL_SNAPSHOT = parseBoardText(MONDAY_BOARD_TEXT, WEEK_OPENING);

export function applyLastWeekFinal(text, previous = OFFICIAL_SNAPSHOT) {
  const { banner, reps } = parseRows(String(text || ""));
  const closedReps = reps.map((rep) => ({
    ...rep,
    prevWeekApps: null,
    prevWeekCx: null,
  }));
  const closed = {
    label: "Last week · Aug 17–23",
    day: banner.day || "Sunday close",
    sourceLabel: "Pasted Saturday/Sunday final",
    pendingWeekend: false,
    sundayRemaining: {
      team: banner.nlLeft ?? previous.lastWeek?.sundayRemaining?.team ?? 0,
      office: previous.lastWeek?.sundayRemaining?.office ?? 0,
      cancun: previous.lastWeek?.sundayRemaining?.cancun ?? 0,
    },
    dailyTotals: previous.lastWeek?.dailyTotals || emptyDaily(),
    notes: ["Last week final applied from pasted Saturday/Sunday board."],
    reps: closedReps,
    totals: summarizeTotals(closedReps.map(hydrateRep)),
  };

  const byName = Object.fromEntries(closedReps.map((rep) => [rep.name, rep]));
  const current = (previous.reps || []).map((rep) => {
    const closedRep = byName[rep.name];
    return {
      ...rep,
      lastWeekApps: closedRep ? closedRep.apps : rep.lastWeekApps,
      lastWeekCx: closedRep ? closedRep.cx : rep.lastWeekCx,
      wow: undefined,
    };
  });

  const missing = closedReps.filter(
    (rep) => !current.some((row) => row.name === rep.name)
  );
  const extras = missing.map((rep) => ({
    displayName: rep.displayName,
    name: rep.name,
    apps: 0,
    cx: 0,
    lastWeekApps: rep.apps,
    lastWeekCx: rep.cx,
    daily: [0, 0, 0, 0, 0, 0, 0],
    flags: [],
  }));

  return summarizeBoard({
    ...previous,
    sourceLabel: "New week · last week weekend close applied",
    dataAsOf: "Last week updated from pasted weekend board",
    lastWeek: closed,
    notes: [
      "Last week now includes the pasted Saturday/Sunday final.",
      "This week's counts are unchanged.",
      `Team weekly goal remains ${previous.teamWeeklyGoal || DEFAULT_TEAM_WEEKLY_GOAL} NL.`,
    ],
    reps: [...current, ...extras],
  });
}

export function setTeamWeeklyGoal(board, goal) {
  const nextGoal = Math.max(0, Number(goal) || 0);
  return summarizeBoard({
    ...board,
    teamWeeklyGoal: nextGoal,
    notes: [
      ...(board.notes || []).filter((note) => !note.includes("This week's team goal is")),
      `This week's team goal is ${nextGoal} NL.`,
    ],
  });
}

export function loadStoredBoard() {
  if (typeof window === "undefined" || !window.localStorage) {
    return summarizeBoard(OFFICIAL_SNAPSHOT);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return summarizeBoard(OFFICIAL_SNAPSHOT);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reps)) {
      return summarizeBoard(OFFICIAL_SNAPSHOT);
    }
    return summarizeBoard(parsed);
  } catch {
    return summarizeBoard(OFFICIAL_SNAPSHOT);
  }
}

export function saveBoard(board) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function resetBoard() {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return summarizeBoard(OFFICIAL_SNAPSHOT);
}
