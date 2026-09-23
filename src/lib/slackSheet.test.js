import { SEED_BOARD } from "../data/seed";
import { formatFullSheet } from "./slackSheet";

test("full Wednesday sheet logs Grant's G-Unit close and keeps Ismael off the roster", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 2/12 | 37 NL LEFT | WEDNESDAY");
  expect(sheet.teamApps).toBe(2);
  expect(sheet.teamCx).toBe(1);
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
  expect(sheet.rows.map((row) => row[1])[0]).toBe("Matthew Grant");
  expect(sheet.rows[0][2]).toBe("2.0");
  expect(sheet.rows[0][3]).toBe("1");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});
