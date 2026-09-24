import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Thursday sheet logs Nate's G-Unit close and keeps Ismael off the roster", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 9/12 | 37 NL LEFT | THURSDAY");
  expect(sheet.teamApps).toBe(9);
  expect(sheet.teamCx).toBe(5);
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
  expect(sheet.rows.map((row) => row[1]).slice(0, 4)).toEqual([
    "Steveo Ramos",
    "Nate",
    "Matthew Grant",
    "Kyron Tisdale",
  ]);
  expect(sheet.rows[0][2]).toBe("4.0");
  expect(sheet.rows[1][2]).toBe("2.0");
  expect(sheet.rows[2][2]).toBe("2.0");
  expect(sheet.rows[3][2]).toBe("1.0");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});
