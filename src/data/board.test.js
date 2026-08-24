import {
  applyLastWeekFinal,
  DEFAULT_TEAM_WEEKLY_GOAL,
  estimatedEarned,
  formatSignedPercent,
  normalizeName,
  OFFICIAL_SNAPSHOT,
  parseBoardText,
  rankReps,
  setTeamWeeklyGoal,
  summarizeBoard,
  tierBonus,
} from "./board";

describe("salesboard scoring", () => {
  test("maps known nicknames", () => {
    expect(normalizeName("steve nash")).toBe("Nashly Paul");
    expect(normalizeName("Ky. Tisdale")).toBe("Kyron Tisdale");
    expect(normalizeName("jordan")).toBe("Jordan Aguirre");
    expect(normalizeName("Jordan Reeces")).toBe("Jordan Reeces");
  });

  test("applies CX tier bonuses and estimated earnings", () => {
    expect(tierBonus(9)).toBe(100);
    expect(tierBonus(6)).toBe(50);
    expect(tierBonus(4)).toBe(30);
    expect(tierBonus(3)).toBe(0);
    expect(estimatedEarned(17, 6)).toBe(1708);
    expect(estimatedEarned(9, 5)).toBe(928);
  });

  test("rolls last week production into the new week snapshot", () => {
    const board = summarizeBoard(OFFICIAL_SNAPSHOT);
    expect(board.totals.apps).toBe(0);
    expect(board.totals.cx).toBe(0);
    expect(board.lastWeek.totals.apps).toBe(56);
    expect(board.lastWeek.totals.cx).toBe(25);
    expect(board.lastWeek.totals.earned).toBe(5620);
    expect(board.lastWeek.pendingWeekend).toBe(true);
    expect(board.weeklyGoal.goal).toBe(DEFAULT_TEAM_WEEKLY_GOAL);
    expect(board.weeklyGoal.nlLeft).toBe(28);
    expect(board.reps[0].displayName).toBe("Jordan Aguirre");
    expect(board.reps[0].apps).toBe(0);
    expect(board.reps[0].lastWeekApps).toBe(17);
    expect(formatSignedPercent(325)).toBe("+325%");
    expect(formatSignedPercent(null)).toBe("new");
  });

  test("parses a this-week Slack scoreboard paste and keeps last week", () => {
    const board = parseBoardText(`
G-UNIT SALES BOARD
DG: 4/10 | 25 NL LEFT | Monday

1. 🥇 Quay Tyler 12 Apps | 8 CX
2. 🥈 Ky. Tisdale 10 Apps | 7 CX
3. 🥉 Steve Nash 8 Apps | 5 CX
`);
    expect(board.day).toBe("Monday");
    expect(board.totals.apps).toBe(30);
    expect(board.weeklyGoal.nlLeft).toBe(25);
    expect(board.weeklyGoal.goal).toBe(45);
    expect(board.lastWeek.totals.apps).toBe(56);
    expect(board.reps[0].name).toBe("Jaquay Tyler");
    expect(board.reps.find((rep) => rep.name === "Nashly Paul").lastWeekApps).toBe(7);
  });

  test("saves a pasted Saturday/Sunday board as last week final", () => {
    const board = applyLastWeekFinal(
      `
1. Jordan Aguirre 18 Apps | 8 CX
2. Steveo Ramos 11 Apps | 6 CX
`,
      OFFICIAL_SNAPSHOT
    );
    expect(board.totals.apps).toBe(0);
    expect(board.lastWeek.pendingWeekend).toBe(false);
    expect(board.lastWeek.totals.apps).toBe(29);
    expect(board.lastWeek.totals.cx).toBe(14);
    expect(board.reps[0].displayName).toBe("Jordan Aguirre");
    expect(board.reps[0].lastWeekApps).toBe(18);
    expect(board.reps[0].lastWeekCx).toBe(8);
  });

  test("updates the team weekly goal remaining", () => {
    const board = setTeamWeeklyGoal(OFFICIAL_SNAPSHOT, 40);
    expect(board.weeklyGoal.goal).toBe(40);
    expect(board.weeklyGoal.nlLeft).toBe(40);
    expect(board.goals[0].label).toBe("This week team goal");
  });

  test("flags CX greater than apps without rewriting counts", () => {
    const board = parseBoardText("1. Pat Lee 3 Apps | 4 CX");
    expect(board.reps[0].cx).toBe(4);
    expect(board.reps[0].flags.some((flag) => flag.includes("DATA ERROR"))).toBe(
      true
    );
  });

  test("keeps last-week ranking stable when apps tie", () => {
    const ranked = rankReps([
      { displayName: "B", name: "B", apps: 6, cx: 2 },
      { displayName: "A", name: "A", apps: 6, cx: 4 },
    ]);
    expect(ranked[0].displayName).toBe("A");
    expect(ranked[1].displayName).toBe("B");
  });
});
