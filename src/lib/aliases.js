import { WEEK_DAYS } from "../data/seed";

export const NAME_ALIASES = {
  ismael: "steven-ramos",
  ish: "steven-ramos",
  "ismael ramos": "steven-ramos",
  steveo: "steven-ramos",
  "steveo ramos": "steven-ramos",
  "steve ramos": "steven-ramos",
  "steven ramos": "steven-ramos",
};

export const CANONICAL_REPS = {
  "steven-ramos": {
    id: "steven-ramos",
    name: "Steveo Ramos",
    shortName: "Steveo",
  },
};

export function aliasKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[²]/g, "2")
    .replace(/#.*$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function canonicalRepId(name, id) {
  const fromName = NAME_ALIASES[aliasKey(name)];
  if (fromName) return fromName;
  if (id) {
    const fromId = NAME_ALIASES[aliasKey(String(id).replace(/-/g, " "))];
    if (fromId) return fromId;
  }
  return id || null;
}

function emptyDays() {
  return WEEK_DAYS.map(() => 0);
}

function foldRep(keep, extra) {
  const canon = CANONICAL_REPS[keep.id];
  const days = emptyDays().map(
    (_, index) =>
      (Number(keep.days?.[index]) || 0) + (Number(extra.days?.[index]) || 0)
  );
  const lastWeekApps = Math.max(
    Number(keep.lastWeekApps) || 0,
    Number(extra.lastWeekApps) || 0
  );
  const prevWeekApps = Math.max(
    Number(keep.prevWeekApps) || 0,
    Number(extra.prevWeekApps) || 0
  );
  const firstWeek =
    Boolean(keep.firstWeek) &&
    Boolean(extra.firstWeek) &&
    lastWeekApps === 0 &&
    prevWeekApps === 0;
  const keepBadge = keep.badge === "1st week" ? undefined : keep.badge;
  const extraBadge = extra.badge === "1st week" ? undefined : extra.badge;

  return {
    ...keep,
    ...canon,
    name: canon?.name || keep.name,
    shortName: canon?.shortName || keep.shortName,
    days,
    cx: (Number(keep.cx) || 0) + (Number(extra.cx) || 0),
    lastWeekApps,
    prevWeekApps,
    firstWeek,
    badge: firstWeek ? keep.badge || extra.badge : keepBadge || extraBadge,
  };
}

export function mergeAliasedReps(reps = []) {
  const merged = [];
  const indexById = new Map();

  for (const rep of reps) {
    const canonicalId = canonicalRepId(rep.name, rep.id) || rep.id;
    const canon = CANONICAL_REPS[canonicalId];
    const existingIndex = indexById.get(canonicalId);
    const next = {
      ...rep,
      id: canonicalId,
      name: canon?.name || rep.name,
      shortName: canon?.shortName || rep.shortName,
      days: [...(rep.days || emptyDays())],
    };

    if (existingIndex == null) {
      indexById.set(canonicalId, merged.length);
      merged.push(next);
      continue;
    }

    merged[existingIndex] = foldRep(merged[existingIndex], next);
  }

  return merged;
}
