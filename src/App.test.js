import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { STORAGE_KEY } from "./data/seed";
import { rankedReps, teamTotals } from "./lib/stats";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the Thursday G-Unit sheet with Wed close plus live Thu sales", () => {
  render(<App />);

  expect(screen.getByText("G-UNIT")).toBeInTheDocument();
  expect(screen.getByText(/Mackenzie Faith/i)).toBeInTheDocument();
  expect(screen.getAllByText(/^Nate$/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Matthew ²/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Guy Lesperance/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Jordan #23/i)).toBeInTheDocument();
  expect(screen.getByText(/Steveo Ramos/i)).toBeInTheDocument();
  expect(screen.getByText(/Ismael Ramos/i)).toBeInTheDocument();
  expect(screen.getAllByText(/^Neika$/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Kyron Tisdale/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Matthew Grant/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Steve Nash/i)).toBeInTheDocument();
  expect(screen.getByText(/Shaad Hyppolite/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Shatreasure Evans/i).length).toBeGreaterThan(0);
  expect(screen.queryByTestId("apps-gianna-smith")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-cameron-winfield")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-leo-chowdhury")).not.toBeInTheDocument();
  expect(screen.getByTestId("team-apps")).toHaveTextContent("40.0");
  expect(screen.getByTestId("apps-nate")).toHaveTextContent("7.0");
  expect(screen.getByTestId("apps-guy-lesperance")).toHaveTextContent("3.0");
  expect(screen.getByTestId("apps-steve-nash")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-neika")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-matthew-grant")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-shatreasure-evans")).toHaveTextContent("2.0");
  expect(screen.getByTestId("apps-ismael-ramos")).toHaveTextContent("2.0");
  expect(screen.getByTestId("apps-steven-ramos")).toHaveTextContent("2.0");
  expect(screen.getByTestId("avg-ky-tisdale")).toHaveTextContent("7.3");
  expect(screen.getByTestId("avg-mackenzie-faith")).toHaveTextContent("4.0");
  expect(screen.getByTestId("avg-nate")).toHaveTextContent("7.0");
  expect(screen.getByTestId("avg-steven-ramos")).toHaveTextContent("5.0");
  expect(screen.getByTestId("avg-matthew-grant")).toHaveTextContent("5.0");
  expect(screen.getByTestId("avg-steve-nash")).toHaveTextContent("6.0");
  expect(screen.getAllByText(/1st week/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Daily goal HIT/i).length).toBeGreaterThan(0);
  expect(screen.getByText("21/12")).toBeInTheDocument();
});

test("clicking a day cell logs an app and re-ranks live", () => {
  render(<App />);

  fireEvent.click(
    screen.getByTitle("Judah Rodgers SUN: click to add an app, shift-click to remove.")
  );

  expect(screen.getByTestId("apps-judah-rodgers")).toHaveTextContent("1.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("41.0");
  expect(window.localStorage.getItem(STORAGE_KEY)).toContain("judah-rodgers");
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
