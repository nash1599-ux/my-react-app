import { BLENDED_RATE, WEEK_DAYS } from "../data/seed";

export function sumDays(days = []) {
  return days.reduce((total, value) => total + (Number(value) || 0), 0);
}

export function weekApps(rep) {
  return sumDays(rep.days);
}

export function cxPct(cx, apps) {
  if (!apps) return 0;
  return (cx / apps) * 100;
}

export function formatPct(value) {
  return `${Math.round(value)}%`;
}

export function wowPct(current, last) {
  if (!last) {
    if (!current) return 0;
    return 100;
  }
  return ((current - last) / last) * 100;
}

export function formatWow(value, last) {
  if (!last && !value) return "—";
  if (!last && value) return "NEW";
  const rounded = Math.round(value);
  if (rounded === 0) return "▶ 0%";
  return rounded > 0 ? `▲ ${rounded}%` : `▼ ${Math.abs(rounded)}%`;
}

export function earned(apps, rate = BLENDED_RATE) {
  return Math.round(apps * rate);
}

export function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US")}`;
}

export function rollingAvg(current, last, prev) {
  return (current + last + prev) / 3;
}

export function formatAvg(value) {
  return value.toFixed(1);
}

export function mondayDate(weekStart) {
  const [year, month, day] = weekStart.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatWeekRange(weekStart) {
  const start = mondayDate(weekStart);
  const end = addDays(start, 6);
  const fmt = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function todayIndex(weekStart, now = new Date()) {
  const start = mondayDate(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, 7);
  const current = new Date(now);
  current.setHours(0, 0, 0, 0);
  if (current < start || current >= end) return -1;
  return Math.round((current - start) / 86400000);
}

export function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function decorateRep(rep) {
  const apps = weekApps(rep);
  const cx = Number(rep.cx) || 0;
  return {
    ...rep,
    apps,
    cx,
    cxPct: cxPct(cx, apps),
    wow: wowPct(apps, rep.lastWeekApps),
    earned: earned(apps),
    rolling: rollingAvg(apps, rep.lastWeekApps, rep.prevWeekApps),
  };
}

export function rankedReps(reps) {
  return [...reps]
    .map(decorateRep)
    .sort((a, b) => {
      if (b.apps !== a.apps) return b.apps - a.apps;
      if (b.cx !== a.cx) return b.cx - a.cx;
      if (b.earned !== a.earned) return b.earned - a.earned;
      return a.name.localeCompare(b.name);
    })
    .map((rep, index) => ({ ...rep, rank: index + 1 }));
}

export function teamTotals(reps) {
  const rows = reps.map(decorateRep);
  const apps = rows.reduce((sum, row) => sum + row.apps, 0);
  const cx = rows.reduce((sum, row) => sum + row.cx, 0);
  const lastWeekApps = rows.reduce((sum, row) => sum + row.lastWeekApps, 0);
  const prevWeekApps = rows.reduce((sum, row) => sum + row.prevWeekApps, 0);
  const days = WEEK_DAYS.map((_, dayIndex) =>
    rows.reduce((sum, row) => sum + (Number(row.days[dayIndex]) || 0), 0)
  );
  return {
    apps,
    cx,
    cxPct: cxPct(cx, apps),
    wow: wowPct(apps, lastWeekApps),
    earned: earned(apps),
    lastWeekApps,
    prevWeekApps,
    rolling: rows.length
      ? rows.reduce((sum, row) => sum + row.rolling, 0) / rows.length
      : 0,
    days,
  };
}

export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function bump(value, delta) {
  return Math.max(0, (Number(value) || 0) + delta);
}
