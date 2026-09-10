import { rankedReps, teamTotals, wowPct, cxPct } from "./stats";

test("wow percent handles a zero last week", () => {
  expect(wowPct(0, 0)).toBe(0);
  expect(wowPct(4, 0)).toBe(100);
  expect(wowPct(1, 7)).toBeCloseTo(-85.71, 1);
});

test("cx percent is zero without apps", () => {
  expect(cxPct(0, 0)).toBe(0);
  expect(cxPct(3, 6)).toBe(50);
});

test("team totals roll up daily apps", () => {
  const totals = teamTotals([
    { lastWeekApps: 7, prevWeekApps: 2, days: [1, 0, 0, 0, 0, 0, 1], cx: 1 },
    { lastWeekApps: 3, prevWeekApps: 1, days: [0, 2, 0, 0, 0, 0, 0], cx: 2 },
  ]);
  expect(totals.apps).toBe(4);
  expect(totals.cx).toBe(3);
  expect(totals.lastWeekApps).toBe(10);
  expect(totals.days[0]).toBe(1);
  expect(totals.days[1]).toBe(2);
  expect(rankedReps([
    { name: "Low", lastWeekApps: 0, prevWeekApps: 0, days: [1, 0, 0, 0, 0, 0, 0], cx: 1 },
    { name: "High", lastWeekApps: 0, prevWeekApps: 0, days: [4, 0, 0, 0, 0, 0, 0], cx: 1 },
  ])[0].name).toBe("High");
});
