import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { STORAGE_KEY } from "./data/seed";
import { rankedReps, teamTotals } from "./lib/stats";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the Wednesday G-Unit roster and keeps returning-rep history", () => {
  render(<App />);

  expect(screen.getByText("G-UNIT")).toBeInTheDocument();
  expect(screen.getByText(/Mackenzie Faith/i)).toBeInTheDocument();
  expect(screen.getAllByText(/^Nate$/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Matthew ²/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Guy Lesperance/i)).toBeInTheDocument();
  expect(screen.getByText(/Jordan #23/i)).toBeInTheDocument();
  expect(screen.getByText(/Steveo Ramos/i)).toBeInTheDocument();
  expect(screen.getByText(/Kyron Tisdale/i)).toBeInTheDocument();
  expect(screen.getByText(/Matthew Grant/i)).toBeInTheDocument();
  expect(screen.getByText(/Steve Nash/i)).toBeInTheDocument();
  expect(screen.getByText(/Shaad Hyppolite/i)).toBeInTheDocument();
  expect(screen.queryByTestId("apps-gianna-smith")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-cameron-winfield")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-leo-chowdhury")).not.toBeInTheDocument();
  expect(screen.getByTestId("team-apps")).toHaveTextContent("19.0");
  expect(screen.getByTestId("avg-ky-tisdale")).toHaveTextContent("7.3");
  expect(screen.getByTestId("avg-mackenzie-faith")).toHaveTextContent("4.0");
  expect(screen.getByTestId("avg-steven-ramos")).toHaveTextContent("5.0");
  expect(screen.getByTestId("avg-matthew-grant")).toHaveTextContent("4.0");
  expect(screen.getByTestId("avg-steve-nash")).toHaveTextContent("4.7");
  expect(screen.getAllByText(/1st week/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Daily goal HIT/i).length).toBeGreaterThan(0);
  expect(screen.getByText("12/12")).toBeInTheDocument();
});

test("clicking a day cell logs an app and re-ranks live", () => {
  render(<App />);

  fireEvent.click(
    screen.getByTitle("Steve Nash SUN: click to add an app, shift-click to remove.")
  );

  expect(screen.getByTestId("apps-steve-nash")).toHaveTextContent("1.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("20.0");
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
