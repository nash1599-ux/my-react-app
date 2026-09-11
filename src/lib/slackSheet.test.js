import { SEED_BOARD } from "../data/seed";
import { formatCompactBoard, formatFullSheet } from "./slackSheet";

test("full Friday sheet includes every excel column and live totals", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 1/12 | 32 NL LEFT | FRIDAY");
  expect(sheet.teamApps).toBe(42);
  expect(sheet.teamCx).toBe(27);
  expect(sheet.header).toEqual([
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
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SUN",
  ]);
  expect(sheet.rows.map((row) => row[1])).toEqual([
    "Nate",
    "Neika",
    "Mackenzie Faith",
    "Matthew ²",
    "Steve Nash",
    "Matthew Grant",
    "Steveo Ramos",
    "Guy Lesperance",
    "Kyron Tisdale",
    "Jordan #23",
    "Shatreasure Evans",
    "Ashunte Reyes",
    "Judah Rodgers",
    "Shaad Hyppolite",
  ]);
  expect(sheet.rows[0][2]).toBe("7.0");
  expect(sheet.rows[1][1]).toBe("Neika");
  expect(sheet.rows[1][2]).toBe("5.0");
  expect(sheet.rows[6][1]).toBe("Steveo Ramos");
  expect(sheet.rows[6][2]).toBe("4.0");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});

test("compact Slack board uses Friday DG and medals", () => {
  const text = formatCompactBoard(SEED_BOARD);
  expect(text).toContain("DG:1/12 |32 NL LEFT | FRIDAY");
  expect(text).toContain(":first_place_medal: Nate  7 Apps | 4 CX");
  expect(text).toContain(":second_place_medal: Neika  5 Apps | 3 CX");
  expect(text).toContain("Steveo Ramos  4 Apps | 2 CX");
  expect(text).not.toContain("Ismael Ramos");
});
