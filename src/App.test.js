import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { STORAGE_KEY } from "./data/seed";
import { rankedReps, teamTotals } from "./lib/stats";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the G-Unit sales board with snapshot reps and totals", () => {
  render(<App />);

  expect(screen.getByText("G-UNIT")).toBeInTheDocument();
  expect(screen.getByText("SALES CHANNEL")).toBeInTheDocument();
  expect(screen.getByText(/Matthew Grant/i)).toBeInTheDocument();
  expect(screen.getByText(/Steven Ramos/i)).toBeInTheDocument();
  expect(screen.getByText(/Steve Nash/i)).toBeInTheDocument();
  expect(screen.getByText(/TEAM HAS EARNED/i)).toBeInTheDocument();
  expect(screen.getByText("TOTALS")).toBeInTheDocument();
  expect(screen.getByTestId("team-apps")).toHaveTextContent("38.0");
});

test("clicking a day cell logs an app and re-ranks live", () => {
  render(<App />);

  fireEvent.click(
    screen.getByTitle("Steve Nash SUN: click to add an app, shift-click to remove.")
  );

  expect(screen.getByTestId("apps-steve-nash")).toHaveTextContent("2.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("39.0");
  expect(window.localStorage.getItem(STORAGE_KEY)).toContain("steve-nash");
});

test("ranks G-Unit reps by week apps then CX", () => {
  const rows = rankedReps([
    { name: "A", lastWeekApps: 0, prevWeekApps: 0, days: [2, 0, 0, 0, 0, 0, 0], cx: 1 },
    { name: "B", lastWeekApps: 0, prevWeekApps: 0, days: [2, 0, 0, 0, 0, 0, 0], cx: 2 },
    { name: "C", lastWeekApps: 0, prevWeekApps: 0, days: [5, 0, 0, 0, 0, 0, 0], cx: 1 },
  ]);

  expect(rows.map((row) => row.name)).toEqual(["C", "B", "A"]);
  expect(teamTotals(rows).apps).toBe(9);
});
