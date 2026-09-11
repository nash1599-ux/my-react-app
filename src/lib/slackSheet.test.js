import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Thursday sheet includes every excel column and live totals", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 21/12 | 34 NL LEFT | THURSDAY");
  expect(sheet.teamApps).toBe(40);
  expect(sheet.teamCx).toBe(25);
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
    "Guy Lesperance",
    "Steveo Ramos",
    "Jordan #23",
    "Ismael Ramos",
    "Shatreasure Evans",
    "Ashunte Reyes",
    "Kyron Tisdale",
    "Judah Rodgers",
    "Shaad Hyppolite",
  ]);
  expect(sheet.rows[0][2]).toBe("7.0");
  expect(sheet.rows[6][1]).toBe("Guy Lesperance");
  expect(sheet.rows[6][2]).toBe("3.0");
  expect(sheet.rows[7][1]).toBe("Steveo Ramos");
  expect(sheet.rows[7][2]).toBe("2.0");
  expect(sheet.rows[9][1]).toBe("Ismael Ramos");
  expect(sheet.rows[9][2]).toBe("2.0");
});
