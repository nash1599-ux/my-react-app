import { BLENDED_RATE, WEEK_DAYS } from "../data/seed";
import {
  formatAvg,
  formatMoney,
  formatPct,
  formatWow,
  formatWeekRange,
  rankedReps,
  teamTotals,
} from "./stats";

function dash(value) {
  return Number(value) ? Number(value).toFixed(1) : "—";
}

export function formatFullSheet(board) {
  const rows = rankedReps(board.reps);
  const totals = teamTotals(board.reps);
  const weekLabel = formatWeekRange(board.weekStart);
  const header = [
    "Rk",
    "Name",
    "Apps",
    "CX",
    "CX%",
    "WoW",
    "Est $",
    "Last",
    "Prev",
    "3wk",
    ...WEEK_DAYS,
  ];
  const body = rows.map((rep) => [
    String(rep.rank),
    rep.name,
    rep.apps.toFixed(1),
    String(rep.cx),
    formatPct(rep.cxPct),
    formatWow(rep.wow, rep.lastWeekApps, rep.firstWeek),
    formatMoney(rep.earned),
    dash(rep.lastWeekApps),
    dash(rep.prevWeekApps),
    formatAvg(rep.rolling),
    ...rep.days.map((value) => dash(value)),
  ]);
  const footer = [
    "",
    "TOTALS",
    totals.apps.toFixed(1),
    String(totals.cx),
    formatPct(totals.cxPct),
    formatWow(totals.wow, totals.lastWeekApps),
    formatMoney(totals.earned),
    dash(totals.lastWeekApps),
    dash(totals.prevWeekApps),
    formatAvg(totals.rolling),
    ...totals.days.map((value) => dash(value)),
  ];

  return {
    title: `${board.teamName} SALES BOARD`,
    weekLabel,
    asOfLabel: board.asOfLabel,
    banner: `DG: ${board.dg.current}/${board.dg.goal} | ${board.nlLeft} NL LEFT | THURSDAY`,
    liveCall: board.liveCall,
    rate: BLENDED_RATE,
    header,
    rows: body,
    totals: footer,
    notes: board.notes,
    teamApps: totals.apps,
    teamCx: totals.cx,
  };
}

export function sheetAsTsv(sheet) {
  const lines = [sheet.header, ...sheet.rows, sheet.totals].map((row) =>
    row.join("\t")
  );
  return lines.join("\n");
}
