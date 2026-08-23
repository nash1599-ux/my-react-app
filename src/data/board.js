export const BLENDED_RATE = 97.5;
export const CX_TIERS = [
  [9, 100],
  [7, 75],
  [5, 50],
  [4, 30],
];
export const STORAGE_KEY = "gunit-salesboard-v1";

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
};

const LINE_RE =
  /(\d+)\.?\s*(?:🥇|🥈|🥉)?\s*([A-Za-z.'\-\s]+?)\s+(\d+)\s*App[s]?\s*\|\s*(\d+)\s*CX(.*)/i;
const BANNER_RE = /DG:\s*(\d+)\/(\d+)\s*\|\s*(\d+)\s*NL LEFT\s*\|\s*(.+)/i;

export function normalizeName(rawName) {
  const key = String(rawName || "").trim().toLowerCase();
  return ALIASES[key] || String(rawName || "").trim();
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
  const wow =
    rep.wow === null || rep.wow === undefined
      ? wowFromLastWeek(apps, rep.lastWeekApps)
      : Number(rep.wow);
  return {
    ...rep,
    apps,
    cx,
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
    .sort((a, b) => b.apps - a.apps || b.cx - a.cx || a.name.localeCompare(b.name))
    .map((rep, index) => ({ ...rep, rank: index + 1 }));
}

export function summarizeBoard(board) {
  const reps = rankReps(board.reps || []);
  const apps = reps.reduce((sum, rep) => sum + rep.apps, 0);
  const cx = reps.reduce((sum, rep) => sum + rep.cx, 0);
  const rate = board.blendedRate || BLENDED_RATE;
  const earned = Math.round(
    apps * rate + reps.reduce((sum, rep) => sum + rep.bonus, 0)
  );
  return {
    ...board,
    reps,
    totals: {
      apps,
      cx,
      cxPct: cxPercent(apps, cx),
      earned,
    },
  };
}

export const OFFICIAL_SNAPSHOT = {
  title: "G-UNIT SALES BOARD",
  day: "Sunday",
  sourceLabel: "Thursday full board + Sunday goal update",
  dataAsOf: "Last full export Thursday Aug 20",
  dgNum: 8,
  dgDen: 10,
  blendedRate: BLENDED_RATE,
  goals: [
    { id: "team", label: "Team goal", nlLeft: 3, tone: "hot" },
    { id: "office", label: "Office goal", nlLeft: 9, tone: "warn" },
    { id: "cancun", label: "Cancun bonus", nlLeft: 10, tone: "goal" },
  ],
  dailyTotals: { mon: 10, tue: 10, wed: 7, thu: 8, fri: 12 },
  notes: [
    "Sunday update: 3 NL left for team, 9 for office, 10 for Cancun.",
    "Rep-level apps/CX are from the last full board export (Thursday).",
    "Jemilise Malave removed 8/17. Tiauri Shaff folded into Steve Nash on 8/18.",
    "Est. $ = (Apps × $97.50) + CX tier bonus. Not payroll.",
  ],
  reps: [
    {
      displayName: "Jordan Aguirre",
      name: "Jordan Aguirre",
      apps: 17,
      cx: 6,
      lastWeekApps: 4,
      lastWeekCx: 2,
      rollingAvg: 10.5,
      daily: [2, 4, 3, 2, 0],
    },
    {
      displayName: "Steveo Ramos",
      name: "Ismael Ramos",
      apps: 9,
      cx: 5,
      lastWeekApps: 8,
      lastWeekCx: 7,
      rollingAvg: 8.5,
      daily: [0, 3, 2, 0, 3],
    },
    {
      displayName: "Steve Nash",
      name: "Nashly Paul",
      apps: 7,
      cx: 3,
      lastWeekApps: 14,
      lastWeekCx: 6,
      rollingAvg: 9.7,
      daily: [4, 0, 0, 0, 3],
    },
    {
      displayName: "Matthew Grant",
      name: "Matthew Grant",
      apps: 6,
      cx: 4,
      lastWeekApps: 10,
      lastWeekCx: 3,
      rollingAvg: 7.0,
      daily: [2, 2, 0, 2, 0],
    },
    {
      displayName: "Ky. Tisdale",
      name: "Kyron Tisdale",
      apps: 6,
      cx: 1,
      lastWeekApps: 6,
      lastWeekCx: 3,
      rollingAvg: 5.0,
      daily: [0, 1, 0, 0, 3],
    },
    {
      displayName: "Shaad Hypolite",
      name: "Rashaad Hypolite",
      apps: 6,
      cx: 4,
      lastWeekApps: 7,
      lastWeekCx: 3,
      rollingAvg: 7.3,
      daily: [0, 0, 2, 4, 0],
    },
    {
      displayName: "Gianna Smith",
      name: "Gianna Smith",
      apps: 5,
      cx: 2,
      lastWeekApps: null,
      lastWeekCx: null,
      wow: null,
      rollingAvg: 5.0,
      daily: [2, 0, 0, 0, 3],
    },
    {
      displayName: "Quay Tyler",
      name: "Jaquay Tyler",
      apps: 0,
      cx: 0,
      lastWeekApps: 4,
      lastWeekCx: 1,
      rollingAvg: 2.0,
      daily: [0, 0, 0, 0, 0],
    },
  ],
};

export function parseBoardText(text) {
  const source = String(text || "");
  const bannerMatch = source.match(BANNER_RE);
  const banner = bannerMatch
    ? {
        dgNum: Number(bannerMatch[1]),
        dgDen: Number(bannerMatch[2]),
        nlLeft: Number(bannerMatch[3]),
        day: bannerMatch[4].trim(),
      }
    : {};

  const reps = [];
  for (const rawLine of source.split(/\r?\n/)) {
    const match = rawLine.match(LINE_RE);
    if (!match) continue;
    const displayName = match[2].trim();
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

  const goals = banner.nlLeft === undefined
    ? OFFICIAL_SNAPSHOT.goals
    : OFFICIAL_SNAPSHOT.goals.map((goal) =>
        goal.id === "team" ? { ...goal, nlLeft: banner.nlLeft } : goal
      );

  return summarizeBoard({
    ...OFFICIAL_SNAPSHOT,
    day: banner.day || OFFICIAL_SNAPSHOT.day,
    dgNum: banner.dgNum ?? OFFICIAL_SNAPSHOT.dgNum,
    dgDen: banner.dgDen ?? OFFICIAL_SNAPSHOT.dgDen,
    sourceLabel: "Pasted board update",
    dataAsOf: "Updated from pasted scoreboard text",
    goals,
    dailyTotals: {},
    notes: [
      "Board updated from pasted Slack scoreboard text.",
      ...(banner.nlLeft !== undefined
        ? [`Team NL left set to ${banner.nlLeft} from the pasted banner.`]
        : []),
    ],
    reps,
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
