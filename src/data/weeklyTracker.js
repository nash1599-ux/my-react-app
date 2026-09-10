import { OFFICIAL_SNAPSHOT } from "./board";

export const TRACKER_STORAGE_KEY = "gunit-weekly-tracker-v1";

export const WEEKLY_HEADERS = [
  "Week Start",
  "Week Label",
  "Rank",
  "Rep",
  "Apps",
  "CX",
  "Est $",
  "Last Week Apps",
  "Last Week CX",
  "Notes",
];

export const DAILY_HEADERS = [
  "Date",
  "Day",
  "Team Apps",
  "Team CX",
  "DG",
  "DG Goal",
  "NL Left",
  "Weekly Goal",
  "Weather",
  "Top Rep",
  "Notes",
];

export function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export function parseCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

export function boardToWeekRows(board, { weekStart, weekLabel, notes } = {}) {
  return (board.reps || []).map((rep) => ({
    "Week Start": weekStart || "",
    "Week Label": weekLabel || board.weekLabel || "",
    Rank: rep.rank,
    Rep: rep.displayName || rep.name,
    Apps: rep.apps,
    CX: rep.cx,
    "Est $": rep.earned,
    "Last Week Apps": rep.lastWeekApps ?? "",
    "Last Week CX": rep.lastWeekCx ?? "",
    Notes: notes || "",
  }));
}

export function boardToDailyRow(board, extras = {}) {
  return {
    Date: extras.Date || extras.date || "",
    Day: extras.Day || board.day || "",
    "Team Apps": extras["Team Apps"] ?? board.totals?.apps ?? "",
    "Team CX": extras["Team CX"] ?? board.totals?.cx ?? "",
    DG: extras.DG ?? board.dgNum ?? "",
    "DG Goal": extras["DG Goal"] ?? board.dgDen ?? "",
    "NL Left": extras["NL Left"] ?? board.weeklyGoal?.nlLeft ?? "",
    "Weekly Goal": extras["Weekly Goal"] ?? board.weeklyGoal?.goal ?? "",
    Weather: extras.Weather || "",
    "Top Rep": extras["Top Rep"] || board.reps?.[0]?.displayName || "",
    Notes: extras.Notes || extras.notes || board.dataAsOf || "",
  };
}

export function seedTracker(board = OFFICIAL_SNAPSHOT) {
  return {
    weekStart: "2026-09-07",
    weekLabel: board.weekLabel || "Week of Sep 8",
    weeklyRows: boardToWeekRows(board, {
      weekStart: "2026-09-07",
      weekLabel: board.weekLabel || "Week of Sep 8",
      notes: "Live through Wednesday · phones count as apps",
    }),
    dailyRows: [
      boardToDailyRow(board, {
        Date: "2026-09-08",
        Day: "Tuesday",
        DG: 6,
        "DG Goal": 12,
        "NL Left": 67,
        "Weekly Goal": 70,
        Weather: "",
        "Top Rep": "Guy Lesperance",
        Notes: "Tue board DG 6/12 · 67 NL left",
      }),
      boardToDailyRow(board, {
        Date: "2026-09-09",
        Day: "Wednesday",
        Weather: "Field day",
        Notes: "DG 12/12 hit · Mackenzie 4 · Nate 3 · Matthew ² 3",
      }),
    ],
  };
}

export function loadStoredTracker() {
  try {
    const raw = window.localStorage.getItem(TRACKER_STORAGE_KEY);
    if (!raw) return seedTracker();
    const parsed = JSON.parse(raw);
    if (!parsed?.weeklyRows || !parsed?.dailyRows) return seedTracker();
    return parsed;
  } catch {
    return seedTracker();
  }
}

export function saveTracker(tracker) {
  window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(tracker));
  return tracker;
}

export function snapshotWeekFromBoard(tracker, board, extras = {}) {
  const weekStart = extras.weekStart || tracker.weekStart;
  const weekLabel = extras.weekLabel || tracker.weekLabel || board.weekLabel;
  const weeklyRows = [
    ...tracker.weeklyRows.filter((row) => row["Week Start"] !== weekStart),
    ...boardToWeekRows(board, {
      weekStart,
      weekLabel,
      notes: extras.notes || "Snapshot from live board",
    }),
  ].sort((a, b) => {
    const week = String(a["Week Start"]).localeCompare(String(b["Week Start"]));
    if (week) return week;
    return Number(a.Rank) - Number(b.Rank);
  });
  const dailyRows = [
    ...tracker.dailyRows,
    boardToDailyRow(board, extras),
  ];
  return { ...tracker, weekStart, weekLabel, weeklyRows, dailyRows };
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
