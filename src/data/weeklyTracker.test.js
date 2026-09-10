import {
  boardToWeekRows,
  parseCsv,
  seedTracker,
  snapshotWeekFromBoard,
  toCsv,
  WEEKLY_HEADERS,
} from "./weeklyTracker";
import { OFFICIAL_SNAPSHOT } from "./board";

test("seeds the week of Sep 8 from the live Wednesday board", () => {
  const tracker = seedTracker(OFFICIAL_SNAPSHOT);
  expect(tracker.weeklyRows[0].Rep).toBe("Mackenzie Faith");
  expect(Number(tracker.weeklyRows[0].Apps)).toBe(4);
  expect(tracker.dailyRows).toHaveLength(2);
  expect(tracker.dailyRows[1].Day).toBe("Wednesday");
});

test("round-trips weekly CSV", () => {
  const rows = boardToWeekRows(OFFICIAL_SNAPSHOT, {
    weekStart: "2026-09-07",
    weekLabel: "Week of Sep 8",
  });
  const csv = toCsv(WEEKLY_HEADERS, rows);
  const parsed = parseCsv(csv);
  expect(parsed[0].Rep).toBe("Mackenzie Faith");
  expect(parsed[1].Rep).toBe("Nate");
  expect(csv).toMatch(/Week Start,Week Label,Rank,Rep/);
});

test("snapshots a board into an existing tracker without dropping old weeks", () => {
  const tracker = seedTracker(OFFICIAL_SNAPSHOT);
  const next = snapshotWeekFromBoard(tracker, OFFICIAL_SNAPSHOT, {
    weekStart: "2026-09-14",
    weekLabel: "Week of Sep 14",
    Date: "2026-09-14",
    Day: "Monday",
  });
  const weeks = new Set(next.weeklyRows.map((row) => row["Week Start"]));
  expect(weeks.has("2026-09-07")).toBe(true);
  expect(weeks.has("2026-09-14")).toBe(true);
});
