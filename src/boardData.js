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

export function deriveBoard(reps) {
  const rows = reps.map((rep) => {
    const week = rep.days.reduce((sum, n) => sum + n, 0);
    const avg = rep.firstWeek ? week : (week + rep.lastWeek + rep.prevWeek) / 3;
    return {
      ...rep,
      week,
      avg,
      cxPct: week <= 0 ? 0 : (rep.cx / week) * 100,
      wow: wow(week, rep.lastWeek),
      est: Math.round(week * BLENDED_RATE),
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
  totals.est = Math.round(totals.week * BLENDED_RATE);
  totals.nlLeft = Math.max(0, WEEKLY_LINE_GOAL - totals.week);
  totals.blended = BLENDED_RATE;

  return { ranked, totals };
}

export function cloneBoard() {
  return {
    reps: SEED_REPS.map((rep) => ({ ...rep, days: [...rep.days] })),
    activity: SEED_ACTIVITY.map((item) => ({ ...item })),
  };
}

function sanitizeRep(seed, saved) {
  if (!saved || !Array.isArray(saved.days) || saved.days.length !== DAYS.length) {
    return { ...seed, days: [...seed.days] };
  }
  return {
    ...seed,
    days: saved.days.map((n) => {
      const value = Number(n);
      return Number.isFinite(value) ? Math.max(0, value) : 0;
    }),
    cx: Number.isFinite(Number(saved.cx)) ? Math.max(0, Number(saved.cx)) : 0,
  };
}

export function loadBoardState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneBoard();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.reps)) return cloneBoard();
    const saved = new Map(parsed.reps.map((rep) => [rep.id, rep]));
    const reps = SEED_REPS.map((seed) => sanitizeRep(seed, saved.get(seed.id)));
    const activity = Array.isArray(parsed.activity)
      ? parsed.activity
          .filter((item) => item && item.id && item.rep && item.detail)
          .slice(0, 8)
      : [];
    return {
      reps,
      activity: activity.length ? activity : SEED_ACTIVITY.map((item) => ({ ...item })),
    };
  } catch {
    return cloneBoard();
  }
}

export function applyCount(board, { repId, dayIndex, field, delta, entryId }) {
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
  const day = DAYS[dayIndex];
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
