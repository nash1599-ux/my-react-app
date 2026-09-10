import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Thursday sheet includes every excel column and live totals", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 11/12 | 44 NL LEFT | THURSDAY");
  expect(sheet.teamApps).toBe(30);
  expect(sheet.teamCx).toBe(21);
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
    "Mackenzie Faith",
    "Matthew ²",
    "Steve Nash",
    "Neika",
    "Nate",
    "Guy Lesperance",
    "Steveo Ramos",
    "Jordan #23",
    "Ismael Ramos",
    "Ashunte Reyes",
    "Kyron Tisdale",
    "Matthew Grant",
    "Judah Rodgers",
    "Shaad Hyppolite",
  ]);
  expect(sheet.rows[2][2]).toBe("4.0");
  expect(sheet.rows[2][13]).toBe("4.0");
  expect(sheet.rows[6][1]).toBe("Steveo Ramos");
  expect(sheet.rows[6][2]).toBe("2.0");
  expect(sheet.rows[8][1]).toBe("Ismael Ramos");
  expect(sheet.rows[8][2]).toBe("2.0");
});
