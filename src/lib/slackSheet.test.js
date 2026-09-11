import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Thursday sheet includes every excel column and live totals", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 18/12 | 37 NL LEFT | THURSDAY");
  expect(sheet.teamApps).toBe(37);
  expect(sheet.teamCx).toBe(23);
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
    "Mackenzie Faith",
    "Matthew ²",
    "Steve Nash",
    "Neika",
    "Matthew Grant",
    "Steveo Ramos",
    "Guy Lesperance",
    "Jordan #23",
    "Ashunte Reyes",
    "Kyron Tisdale",
    "Judah Rodgers",
    "Shaad Hyppolite",
  ]);
  expect(sheet.rows[0][2]).toBe("7.0");
  expect(sheet.rows[5][1]).toBe("Matthew Grant");
  expect(sheet.rows[5][2]).toBe("4.0");
  expect(sheet.rows[6][1]).toBe("Steveo Ramos");
  expect(sheet.rows[6][2]).toBe("4.0");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});
