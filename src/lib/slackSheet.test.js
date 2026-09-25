import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Friday sheet logs Ismael's close on Steveo and keeps Ismael off the roster", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 19/12 | 37 NL LEFT | FRIDAY");
  expect(sheet.teamApps).toBe(19);
  expect(sheet.teamCx).toBe(11);
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
  expect(sheet.rows.map((row) => row[1]).slice(0, 5)).toEqual([
    "Nate",
    "Steveo Ramos",
    "Matthew Grant",
    "Guy Lesperance",
    "Kyron Tisdale",
  ]);
  expect(sheet.rows[0][2]).toBe("8.0");
  expect(sheet.rows[1][2]).toBe("6.0");
  expect(sheet.rows[2][2]).toBe("2.0");
  expect(sheet.rows[3][2]).toBe("2.0");
  expect(sheet.rows[4][2]).toBe("1.0");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});
