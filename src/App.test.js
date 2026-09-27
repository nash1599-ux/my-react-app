import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import { SEED_REPS, deriveBoard, formatAvg } from "./boardData";

const EXPECTED = [
  ["Nate", 7, 0, 0, "7.0", [0, 0, 3, 4, 0, 0, 0], 4, "57%", "NEW", 683],
  ["Mackenzie Faith", 4, 0, 0, "4.0", [0, 0, 4, 0, 0, 0, 0], 2, "50%", "NEW", 390],
  ["Matthew", 4, 4, 1, "3.0", [0, 0, 3, 1, 0, 0, 0], 2, "50%", "0%", 390],
  ["Steve Nash", 4, 5, 9, "6.0", [0, 0, 0, 4, 0, 0, 0], 2, "50%", "↓ 20%", 390],
  ["Neika", 4, 0, 0, "4.0", [0, 0, 0, 4, 0, 0, 0], 2, "50%", "NEW", 390],
  ["Matthew Grant", 4, 3, 8, "5.0", [0, 0, 1, 3, 0, 0, 0], 2, "50%", "↑ 33%", 390],
  ["Guy Lesperance", 3, 0, 0, "3.0", [0, 0, 2, 1, 0, 0, 0], 5, "167%", "NEW", 293],
  ["Kyron Tisdale", 2, 15, 6, "7.7", [0, 0, 1, 1, 0, 0, 0], 2, "100%", "↓ 87%", 195],
  ["Steveo Ramos", 2, 10, 3, "5.0", [0, 0, 2, 0, 0, 0, 0], 1, "50%", "↓ 80%", 195],
  ["Jordan", 2, 9, 5, "5.3", [0, 0, 2, 0, 0, 0, 0], 1, "50%", "↓ 78%", 195],
  ["Ismael Ramos", 2, 0, 0, "2.0", [0, 0, 0, 2, 0, 0, 0], 1, "50%", "NEW", 195],
  ["Shatreasure Evans", 2, 0, 0, "2.0", [0, 0, 0, 2, 0, 0, 0], 1, "50%", "NEW", 195],
  ["Ashunte Reyes", 1, 0, 0, "1.0", [0, 0, 1, 0, 0, 0, 0], 1, "100%", "NEW", 98],
  ["Judah Rodgers", 0, 1, 0, "0.3", [0, 0, 0, 0, 0, 0, 0], 0, "0%", "↓ 100%", 0],
  ["Shaad Hyppolite", 0, 0, 2, "0.7", [0, 0, 0, 0, 0, 0, 0], 0, "0%", "—", 0],
];

beforeEach(() => {
  localStorage.clear();
});

test("seeds the Thursday G-Unit snapshot", () => {
  const { ranked, totals } = deriveBoard(SEED_REPS);

  expect(totals.week).toBe(41);
  expect(totals.cx).toBe(26);
  expect(Math.round(totals.cxPct)).toBe(63);
  expect(totals.est).toBe(3998);
  expect(totals.nlLeft).toBe(33);
  expect(totals.days).toEqual([0, 0, 19, 22, 0, 0, 0]);
  expect(totals.lastWeek).toBe(47);
  expect(totals.prevWeek).toBe(34);
  expect(formatAvg(totals.avg)).toBe("3.7");
  expect(totals.wow.label).toBe("↓ 13%");

  expect(ranked.map((rep) => rep.name)).toEqual(EXPECTED.map((row) => row[0]));
  ranked.forEach((rep, index) => {
    const [, week, lastWeek, prevWeek, avg, days, cx, cxPct, wowLabel, est] = EXPECTED[index];
    expect(rep.week).toBe(week);
    expect(rep.lastWeek).toBe(lastWeek);
    expect(rep.prevWeek).toBe(prevWeek);
    expect(formatAvg(rep.avg)).toBe(avg);
    expect(rep.days).toEqual(days);
    expect(rep.cx).toBe(cx);
    expect(`${Math.round(rep.cxPct)}%`).toBe(cxPct);
    expect(rep.wow.label).toBe(wowLabel);
    expect(rep.est).toBe(est);
  });
});

test("renders the live board as of Thursday", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "G-UNIT" })).toBeInTheDocument();
  expect(screen.getByText("Sep 7 – Sep 13")).toBeInTheDocument();
  expect(screen.getByText("As of Thursday · Sep 10")).toBeInTheDocument();
  expect(screen.getByTestId("live-line")).toHaveTextContent(
    "Kyron Tisdale +1 phone (Cx1 / Galaxy AT7)"
  );
  expect(screen.getByTestId("team-apps")).toHaveTextContent("41.0");
  expect(screen.getByTestId("team-cx")).toHaveTextContent("26");
  expect(screen.getByTestId("team-cxpct")).toHaveTextContent("63%");
  expect(screen.getByTestId("team-est")).toHaveTextContent("$3,998");
  expect(screen.getByTestId("nl-left")).toHaveTextContent("33");
  expect(screen.getByTestId("team-avg")).toHaveTextContent("3.7");
  expect(screen.getByTestId("thu-apps")).toHaveTextContent("22.0");
  expect(screen.getByTestId("thu-apps")).toHaveTextContent(/daily app goal hit/i);
  expect(screen.getByTestId("week-nate")).toHaveTextContent("7.0");
  expect(screen.getByTestId("rank-kyron")).toHaveTextContent("8");
  expect(screen.getByTestId("cxpct-guy")).toHaveTextContent("167%");
  expect(screen.getAllByText("1ST WEEK")).toHaveLength(7);
  expect(screen.getByText("DAILY GOAL HIT")).toBeInTheDocument();
  expect(screen.getByText(/Ismael Ramos is not Steveo Ramos/)).toBeInTheDocument();
});

test("logs an app, logs a close, and shift-click subtracts", () => {
  render(<App />);

  fireEvent.click(screen.getByTestId("app-shaad-thu"));
  expect(screen.getByTestId("app-shaad-thu")).toHaveTextContent("1.0");
  expect(screen.getByTestId("week-shaad")).toHaveTextContent("1.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("42.0");
  expect(screen.getByTestId("team-est")).toHaveTextContent("$4,095");
  expect(screen.getByTestId("nl-left")).toHaveTextContent("32");
  expect(screen.getByTestId("wow-shaad")).toHaveTextContent("NEW");
  expect(screen.getByTestId("rank-shaad")).toHaveTextContent("14");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Shaad Hyppolite +1 app · THU");

  fireEvent.click(screen.getByTestId("app-shaad-thu"), { shiftKey: true });
  expect(screen.getByTestId("app-shaad-thu")).toHaveTextContent("0.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("41.0");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Shaad Hyppolite −1 app · THU");

  fireEvent.click(screen.getByTestId("app-shaad-mon"), { shiftKey: true });
  expect(screen.getByTestId("app-shaad-mon")).toHaveTextContent("0.0");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Shaad Hyppolite −1 app · THU");

  fireEvent.click(screen.getByTestId("cx-nate"));
  expect(screen.getByTestId("cx-nate")).toHaveTextContent("5");
  expect(screen.getByTestId("cxpct-nate")).toHaveTextContent("71%");
  expect(screen.getByTestId("team-cx")).toHaveTextContent("27");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Nate +1 close");

  const nateRow = screen.getByTestId("rep-nate");
  expect(within(nateRow).getByTestId("week-nate")).toHaveTextContent("7.0");
});

test("logs Team 7 production without copying the G-Unit roster", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Team 7" }));

  expect(screen.getByRole("heading", { name: "TEAM 7" })).toBeInTheDocument();
  expect(screen.getByText("Production")).toBeInTheDocument();
  expect(screen.getByText("Sep 21 – Sep 27")).toBeInTheDocument();
  expect(screen.getByText("As of Sunday · Sep 27")).toBeInTheDocument();
  expect(screen.getByText("No reps yet. Add one to start the live log.")).toBeInTheDocument();
  expect(screen.queryByText("Nate")).not.toBeInTheDocument();
  expect(screen.getByTestId("team-apps")).toHaveTextContent("0.0");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Team 7 production board is live");

  fireEvent.change(screen.getByLabelText("Rep name"), { target: { value: "Avery Cole" } });
  fireEvent.click(screen.getByRole("button", { name: "Add rep" }));

  expect(screen.getByTestId("rep-avery-cole")).toBeInTheDocument();
  fireEvent.click(screen.getByTestId("app-avery-cole-sun"));
  expect(screen.getByTestId("app-avery-cole-sun")).toHaveTextContent("1.0");
  expect(screen.getByTestId("week-avery-cole")).toHaveTextContent("1.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("1.0");
  expect(screen.getByTestId("live-day-apps")).toHaveTextContent("Sunday live log 1.0 apps");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Avery Cole +1 app · SUN");

  fireEvent.click(screen.getByTestId("cx-avery-cole"));
  expect(screen.getByTestId("cx-avery-cole")).toHaveTextContent("1");
  expect(screen.getByTestId("team-cx")).toHaveTextContent("1");
  expect(screen.getByTestId("cxpct-avery-cole")).toHaveTextContent("100%");
  expect(screen.getByTestId("live-line")).toHaveTextContent("Avery Cole +1 close");

  fireEvent.click(screen.getByTestId("app-avery-cole-sun"), { shiftKey: true });
  expect(screen.getByTestId("app-avery-cole-sun")).toHaveTextContent("0.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("0.0");

  fireEvent.click(screen.getByRole("button", { name: "G-Unit" }));
  expect(screen.getByRole("heading", { name: "G-UNIT" })).toBeInTheDocument();
  expect(screen.getByTestId("week-nate")).toHaveTextContent("7.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("41.0");

  fireEvent.click(screen.getByRole("button", { name: "Team 7" }));
  expect(screen.getByTestId("cx-avery-cole")).toHaveTextContent("1");
  expect(screen.getByTestId("app-avery-cole-sun")).toHaveTextContent("0.0");
});
