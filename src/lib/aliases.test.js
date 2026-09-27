import { canonicalRepId, mergeAliasedReps } from "./aliases";

test("maps Ismael, Ish, and Steveo names to Steveo Ramos", () => {
  expect(canonicalRepId("Ismael")).toBe("steven-ramos");
  expect(canonicalRepId("Ish")).toBe("steven-ramos");
  expect(canonicalRepId("Ismael Ramos")).toBe("steven-ramos");
  expect(canonicalRepId("Steveo Ramos")).toBe("steven-ramos");
  expect(canonicalRepId("Someone Else", "ismael-ramos")).toBe("steven-ramos");
});

test("folds a split Ismael row into Steveo Ramos", () => {
  const merged = mergeAliasedReps([
    {
      id: "steven-ramos",
      name: "Steveo Ramos",
      shortName: "Steveo",
      lastWeekApps: 10,
      prevWeekApps: 3,
      days: [0, 0, 2, 0, 0, 0, 0],
      cx: 1,
    },
    {
      id: "ismael-ramos",
      name: "Ismael Ramos",
      shortName: "Ismael",
      firstWeek: true,
      lastWeekApps: 0,
      prevWeekApps: 0,
      days: [0, 0, 0, 2, 0, 0, 0],
      cx: 1,
      badge: "1st week",
    },
  ]);

  expect(merged).toHaveLength(1);
  expect(merged[0]).toMatchObject({
    id: "steven-ramos",
    name: "Steveo Ramos",
    shortName: "Steveo",
    lastWeekApps: 10,
    prevWeekApps: 3,
    cx: 2,
    firstWeek: false,
  });
  expect(merged[0].days).toEqual([0, 0, 2, 2, 0, 0, 0]);
  expect(merged[0].badge).toBeUndefined();
});
