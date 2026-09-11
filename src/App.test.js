import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { STORAGE_KEY } from "./data/seed";
import { rankedReps, teamTotals } from "./lib/stats";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the Friday G-Unit sheet with Steveo holding Ismael's phones", () => {
  render(<App />);

  expect(screen.getByText("G-UNIT")).toBeInTheDocument();
  expect(screen.getByText(/Mackenzie Faith/i)).toBeInTheDocument();
  expect(screen.getAllByText(/^Nate$/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Matthew ²/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Guy Lesperance/i)).toBeInTheDocument();
  expect(screen.getByText(/Jordan #23/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Steveo Ramos/i).length).toBeGreaterThan(0);
  expect(screen.queryByText(/^Ismael Ramos$/)).not.toBeInTheDocument();
  expect(screen.getAllByText(/^Neika$/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Kyron Tisdale/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Matthew Grant/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Steve Nash/i)).toBeInTheDocument();
  expect(screen.getByText(/Shatreasure Evans/i)).toBeInTheDocument();
  expect(screen.getByText(/Shaad Hyppolite/i)).toBeInTheDocument();
  expect(screen.queryByTestId("apps-gianna-smith")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-cameron-winfield")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-leo-chowdhury")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-ismael-ramos")).not.toBeInTheDocument();
  expect(screen.getByTestId("team-apps")).toHaveTextContent("42.0");
  expect(screen.getByTestId("apps-nate")).toHaveTextContent("7.0");
  expect(screen.getByTestId("apps-neika")).toHaveTextContent("5.0");
  expect(screen.getByTestId("apps-steve-nash")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-matthew-grant")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-steven-ramos")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-shatreasure-evans")).toHaveTextContent("2.0");
  expect(screen.getByTestId("avg-ky-tisdale")).toHaveTextContent("7.7");
  expect(screen.getByTestId("avg-mackenzie-faith")).toHaveTextContent("4.0");
  expect(screen.getByTestId("avg-nate")).toHaveTextContent("7.0");
  expect(screen.getByTestId("avg-neika")).toHaveTextContent("5.0");
  expect(screen.getByTestId("avg-steven-ramos")).toHaveTextContent("5.7");
  expect(screen.getByTestId("avg-matthew-grant")).toHaveTextContent("5.0");
  expect(screen.getByTestId("avg-steve-nash")).toHaveTextContent("6.0");
  expect(screen.getAllByText(/1st week/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Daily goal HIT/i).length).toBeGreaterThan(0);
  expect(screen.getByText("1/12")).toBeInTheDocument();
});

test("clicking a day cell logs an app and re-ranks live", () => {
  render(<App />);

  fireEvent.click(
    screen.getByTitle("Judah Rodgers SUN: click to add an app, shift-click to remove.")
  );

  expect(screen.getByTestId("apps-judah-rodgers")).toHaveTextContent("1.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("43.0");
  expect(window.localStorage.getItem(STORAGE_KEY)).toContain("judah-rodgers");
});

test("merges a saved Ismael row into Steveo Ramos on load", () => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      teamName: "G-UNIT",
      weekStart: "2026-09-07",
      dg: { current: 1, goal: 12 },
      nlLeft: 32,
      reps: [
        {
          id: "steven-ramos",
          name: "Steveo Ramos",
          lastWeekApps: 10,
          prevWeekApps: 3,
          days: [0, 0, 2, 0, 0, 0, 0],
          cx: 1,
        },
        {
          id: "ismael-ramos",
          name: "Ismael",
          lastWeekApps: 0,
          prevWeekApps: 0,
          days: [0, 0, 0, 2, 0, 0, 0],
          cx: 1,
        },
      ],
    })
  );

  render(<App />);

  expect(screen.queryByTestId("apps-ismael-ramos")).not.toBeInTheDocument();
  expect(screen.getByTestId("apps-steven-ramos")).toHaveTextContent("4.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("4.0");
});

test("does not add Ismael as a new roster row", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /edit roster/i }));
  fireEvent.change(screen.getByLabelText(/add a g-unit rep/i), {
    target: { value: "Ismael" },
  });
  fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

  expect(screen.queryByTestId("apps-ismael-ramos")).not.toBeInTheDocument();
  expect(screen.getByText(/already on the live board/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Steveo Ramos/i).length).toBeGreaterThan(0);
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
