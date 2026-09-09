import { normalizeName, summarizeBoard } from "./board";

export const GUNIT_HASHTAG_RE = /#g[-_]?unit\b/i;
export const SOURCE_CHANNEL = "precisionmanagement-att-sales";
export const SOURCE_CHANNEL_ID = "C0A7871FAUV";
export const DEST_CHANNEL = "g-unit-saleschannel";
export const DEST_CHANNEL_ID = "C0BS4E8LH42";
export const SALES_LOG_LIMIT = 100;

const PHONE_RE = /\b(\d+)\s*(?:phones?|phns?|handsets?)\b/i;
const APP_RE = /\b(\d+)\s*(?:apps?|lines?|nls?)\b/i;
const CX_RE = /\b(\d+)\s*cx\b/i;
const SOLD_RE = /\b(?:sold|closed|got|did)\s+(\d+)\b/i;
const HASH_NUM_RE = /#g[-_]?unit\b[^\d]{0,12}(\d+)/i;
const NUM_HASH_RE = /\b(\d+)\s*#g[-_]?unit\b/i;
const BOARD_ROW_RE = /\d+\s*App[s]?\s*\|\s*\d+\s*CX/i;
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const KNOWN_NAMES = [
  "jaquay tyler",
  "kyron tisdale",
  "nashly paul",
  "ismael ramos",
  "rashaad hypolite",
  "jayden dale",
  "jordan aguirre",
  "gianna smith",
  "cam winfield",
  "matthew grant",
  "matthew 2",
  "leo chowdury",
  "gigi smith",
  "steve nash",
  "steveo ramos",
  "steveo",
  "shaad hypolite",
  "jordan #23",
  "quay tyler",
  "quay",
  "gigi",
  "cam",
  "ky",
];

export function hasGUnitHashtag(text) {
  return GUNIT_HASHTAG_RE.test(String(text || ""));
}

export function looksLikeFullBoard(text) {
  const hits = String(text || "")
    .split(/\n/)
    .filter((line) => BOARD_ROW_RE.test(line));
  return hits.length >= 2;
}

function firstNumber(regex, text) {
  const match = String(text || "").match(regex);
  return match ? Number(match[1]) : null;
}

export function extractPhoneCount(text) {
  const raw = String(text || "");
  const phones = firstNumber(PHONE_RE, raw);
  if (phones != null) return phones;
  const apps = firstNumber(APP_RE, raw);
  if (apps != null) return apps;
  const sold = firstNumber(SOLD_RE, raw);
  if (sold != null) return sold;
  const afterHash = firstNumber(HASH_NUM_RE, raw);
  if (afterHash != null) return afterHash;
  const beforeHash = firstNumber(NUM_HASH_RE, raw);
  if (beforeHash != null) return beforeHash;

  const cx = firstNumber(CX_RE, raw);
  const numbers = [...raw.matchAll(/\b(\d+)\b/g)]
    .map((match) => Number(match[1]))
    .filter((value) => value >= 1 && value <= 20 && value !== cx);
  if (numbers.length === 1) return numbers[0];
  return 1;
}

function findMentionedName(text, fallback) {
  const haystack = String(text || "").toLowerCase();
  const ranked = [...KNOWN_NAMES].sort((a, b) => b.length - a.length);
  for (const name of ranked) {
    const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(haystack)) return normalizeName(name);
  }
  return normalizeName(fallback || "Unknown rep");
}

export function parseHashtagSale(text, meta = {}) {
  const raw = String(text || "").trim();
  if (!hasGUnitHashtag(raw)) {
    return { matched: false, reason: "No #g-unit hashtag." };
  }
  if (looksLikeFullBoard(raw)) {
    return {
      matched: true,
      ignored: true,
      reason: "Looks like a full scoreboard paste, not a single sale.",
    };
  }

  const phones = extractPhoneCount(raw);
  const cx = firstNumber(CX_RE, raw) || 0;
  const author = String(meta.author || "").trim();
  const name = findMentionedName(raw, author);

  return {
    matched: true,
    ignored: false,
    id: meta.id || meta.ts || `${Date.now()}`,
    ts: meta.ts || new Date().toISOString(),
    sourceChannel: meta.sourceChannel || SOURCE_CHANNEL,
    author: author || name,
    name,
    displayName: name,
    phones,
    apps: phones,
    cx,
    text: raw,
  };
}

function dayKeyFromDate(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "mon";
  return DAY_KEYS[date.getDay()];
}

function bumpDaily(totals, dayKey, amount) {
  const next = {
    mon: 0,
    tue: 0,
    wed: 0,
    thu: 0,
    fri: 0,
    sat: 0,
    sun: 0,
    ...(totals || {}),
  };
  next[dayKey] = (Number(next[dayKey]) || 0) + Number(amount || 0);
  return next;
}

function medalFor(rank) {
  return { 1: "🥇", 2: "🥈", 3: "🥉" }[rank] || `${rank}.`;
}

export function applyHashtagSale(board, rawEvent, now = new Date()) {
  const parsed = parseHashtagSale(rawEvent?.text, rawEvent);
  if (!parsed.matched) {
    throw new Error(parsed.reason || "No #g-unit hashtag.");
  }
  if (parsed.ignored) {
    throw new Error(parsed.reason);
  }

  const log = Array.isArray(board.salesLog) ? board.salesLog : [];
  if (parsed.id && log.some((entry) => entry.id === parsed.id)) {
    return {
      board,
      event: parsed,
      duplicate: true,
      slackMessage: null,
    };
  }

  const reps = [...(board.reps || [])];
  const index = reps.findIndex((rep) => rep.name === parsed.name);
  if (index >= 0) {
    reps[index] = {
      ...reps[index],
      apps: (Number(reps[index].apps) || 0) + parsed.phones,
      cx: (Number(reps[index].cx) || 0) + parsed.cx,
      displayName: reps[index].displayName || parsed.displayName,
    };
  } else {
    reps.push({
      displayName: parsed.displayName,
      name: parsed.name,
      apps: parsed.phones,
      cx: parsed.cx,
      lastWeekApps: null,
      lastWeekCx: null,
      daily: [0, 0, 0, 0, 0, 0, 0],
      flags: ["Added from a #g-unit sale post"],
    });
  }

  const event = { ...parsed, dayKey: dayKeyFromDate(now) };
  const next = summarizeBoard({
    ...board,
    sourceLabel: "Live #g-unit posts",
    dataAsOf: `Last sale ${event.displayName} +${event.phones} phone${event.phones === 1 ? "" : "s"}`,
    dailyTotals: bumpDaily(board.dailyTotals, event.dayKey, event.phones),
    salesLog: [event, ...log].slice(0, SALES_LOG_LIMIT),
    notes: [
      `Live #g-unit feed from #${SOURCE_CHANNEL}. Phones count as apps on the board.`,
      ...(board.notes || []).filter((note) => !String(note).startsWith("Live #g-unit feed")),
    ],
    reps,
  });

  return {
    board: next,
    event,
    duplicate: false,
    slackMessage: formatGUnitChannelUpdate(next, event),
  };
}

export function formatGUnitChannelUpdate(board, event) {
  const seller = (board.reps || []).find((rep) => rep.name === event.name);
  const lines = [
    `🪖 *G-UNIT LIVE SALE*`,
    `*${event.displayName}* +${event.phones} phone${event.phones === 1 ? "" : "s"}${
      event.cx ? ` · +${event.cx} CX` : ""
    }`,
    seller
      ? `_Now ${seller.apps} App${seller.apps === 1 ? "" : "s"} | ${seller.cx} CX_`
      : "",
    "",
    `This week: *${board.totals.apps} apps / ${board.totals.cx} CX* · ${board.weeklyGoal.nlLeft} NL left`,
    "",
    "*Leaderboard*",
    ...(board.reps || [])
      .slice(0, 8)
      .map(
        (rep) =>
          `${medalFor(rep.rank)} ${rep.displayName}  ${rep.apps} App${
            rep.apps === 1 ? "" : "s"
          } | ${rep.cx} CX`
      ),
  ].filter((line) => line !== "");
  return lines.join("\n");
}

export function phonesToday(board, now = new Date()) {
  const key = dayKeyFromDate(now);
  return Number(board?.dailyTotals?.[key]) || 0;
}
