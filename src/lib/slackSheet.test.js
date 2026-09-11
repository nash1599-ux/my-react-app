import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

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
    "Guy Lesperance",
    "Kyron Tisdale",
    "Steveo Ramos",
    "Jordan #23",
    "Ismael Ramos",
    "Shatreasure Evans",
    "Ashunte Reyes",
    "Judah Rodgers",
    "Shaad Hyppolite",
  ]);
  expect(sheet.rows[0][2]).toBe("7.0");
  expect(sheet.rows[6][1]).toBe("Guy Lesperance");
  expect(sheet.rows[6][2]).toBe("3.0");
  expect(sheet.rows[7][1]).toBe("Kyron Tisdale");
  expect(sheet.rows[7][2]).toBe("2.0");
  expect(sheet.rows[10][1]).toBe("Ismael Ramos");
  expect(sheet.rows[10][2]).toBe("2.0");
});
