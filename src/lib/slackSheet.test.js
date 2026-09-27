import { SEED_BOARD } from "../data/seed";
import { formatCompactBoard, formatFullSheet } from "./slackSheet";

test("full Sunday sheet includes every excel column and live totals", () => {
  const sheet = formatFullSheet(SEED_BOARD);

  expect(sheet.banner).toBe("DG: 4/13 | 28 NL LEFT | Sundi");
  expect(sheet.teamApps).toBe(47);
  expect(sheet.teamCx).toBe(28);
  expect(sheet.rows.map((row) => row[1])).toEqual([
    "Nate Hilarie",
    "Jordan #23",
    "Guy Lesperance",
    "Coivon Patterson",
    "Jamaal Brown",
    "Neika Bolívar",
    "Matthew Grant",
    "Steveo Ramos",
    "Steve Nash",
    "Shaad Hyppolite",
    "Mackenzie Faith",
    "Kyron Tisdale",
    "Fritzna Salomon",
    "Amaya Montero",
  ]);
  expect(sheet.rows[0][2]).toBe("9.0");
  expect(sheet.rows[1][2]).toBe("7.0");
  expect(sheet.rows[7][1]).toBe("Steveo Ramos");
  expect(sheet.rows[7][2]).toBe("3.0");
  expect(sheet.rows.map((row) => row[1])).not.toContain("Ismael Ramos");
});

test("compact Slack board uses Sunday DG, struck names, and lifelines", () => {
  const text = formatCompactBoard(SEED_BOARD);
  expect(text).toContain("DG:4/13 | 28NL LEFT | Sundi");
  expect(text).toContain(":first_place_medal: Nate Hilarie  9 Apps | 4 CX");
  expect(text).toContain(":second_place_medal: Jordan #23  7 Apps | 5 CX");
  expect(text).toContain(":third_place_medal: Guy Lesperance  4 Apps | 3 CX");
  expect(text).toContain("~Shaad Hyppolite~");
  expect(text).toContain("~Mackenzie Faith~");
  expect(text).toContain("~Kyron Tisdale~");
  expect(text).toContain("Fritzna Salomon  :ring_buoy: Apps | :ring_buoy: CX");
  expect(text).not.toContain("Ismael Ramos");
});
