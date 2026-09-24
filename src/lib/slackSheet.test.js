import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Wednesday sheet logs Grant's G-Unit close and keeps Ismael off the roster", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 4/12 | 37 NL LEFT | WEDNESDAY");
  expect(sheet.teamApps).toBe(4);
  expect(sheet.teamCx).toBe(2);
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
  expect(sheet.rows.map((row) => row[1]).slice(0, 2)).toEqual([
    "Matthew Grant",
    "Steveo Ramos",
  ]);
  expect(sheet.rows[0][2]).toBe("2.0");
  expect(sheet.rows[1][2]).toBe("2.0");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});
