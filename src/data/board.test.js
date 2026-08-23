import {
  estimatedEarned,
  formatSignedPercent,
  normalizeName,
  parseBoardText,
  rankReps,
  summarizeBoard,
  tierBonus,
  OFFICIAL_SNAPSHOT,
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

  test("ranks the official snapshot with Jordan on top", () => {
    const board = summarizeBoard(OFFICIAL_SNAPSHOT);
    expect(board.reps[0].displayName).toBe("Jordan Aguirre");
    expect(board.reps[0].rank).toBe(1);
    expect(board.reps[1].displayName).toBe("Steveo Ramos");
    expect(board.totals.apps).toBe(56);
    expect(board.totals.cx).toBe(25);
    expect(board.totals.earned).toBe(5620);
    expect(formatSignedPercent(325)).toBe("+325%");
    expect(formatSignedPercent(null)).toBe("new");
  });

  test("parses a short Slack scoreboard paste", () => {
    const board = parseBoardText(`
G-UNIT SALES BOARD
DG: 4/10 | 3 NL LEFT | Sunday

1. 🥇 Quay Tyler 12 Apps | 8 CX
2. 🥈 Ky. Tisdale 10 Apps | 7 CX
3. 🥉 Steve Nash 8 Apps | 5 CX
`);
    expect(board.day).toBe("Sunday");
    expect(board.dgNum).toBe(4);
    expect(board.goals.find((goal) => goal.id === "team").nlLeft).toBe(3);
    expect(board.reps[0].name).toBe("Jaquay Tyler");
    expect(board.reps[2].name).toBe("Nashly Paul");
    expect(board.totals.apps).toBe(30);
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
