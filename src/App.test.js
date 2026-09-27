import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { STORAGE_KEY } from "./data/seed";
import { rankedReps, teamTotals } from "./lib/stats";

beforeEach(() => {
  window.localStorage.clear();
});

test("renders the Sunday G-Unit sheet from the live close", () => {
  render(<App />);

  expect(screen.getByText("G-UNIT")).toBeInTheDocument();
  expect(screen.getByText(/Nate Hilarie/i)).toBeInTheDocument();
  expect(screen.getByText(/Jordan #23/i)).toBeInTheDocument();
  expect(screen.getByText(/Guy Lesperance/i)).toBeInTheDocument();
  expect(screen.getByText(/Coivon Patterson/i)).toBeInTheDocument();
  expect(screen.getByText(/Jamaal Brown/i)).toBeInTheDocument();
  expect(screen.getByText(/Neika Bolívar/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Matthew Grant/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Steveo Ramos/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Steve Nash/i)).toBeInTheDocument();
  expect(screen.getByText(/Shaad Hyppolite/i)).toBeInTheDocument();
  expect(screen.getByText(/Mackenzie Faith/i)).toBeInTheDocument();
  expect(screen.getByText(/Kyron Tisdale/i)).toBeInTheDocument();
  expect(screen.getByText(/Fritzna Salomon/i)).toBeInTheDocument();
  expect(screen.getByText(/Amaya Montero/i)).toBeInTheDocument();
  expect(screen.queryByText(/^Ismael Ramos$/)).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-gianna-smith")).not.toBeInTheDocument();
  expect(screen.queryByTestId("apps-ismael-ramos")).not.toBeInTheDocument();
  expect(screen.getByTestId("team-apps")).toHaveTextContent("47.0");
  expect(screen.getByTestId("apps-nate")).toHaveTextContent("9.0");
  expect(screen.getByTestId("apps-jordan-aguirre")).toHaveTextContent("7.0");
  expect(screen.getByTestId("apps-guy-lesperance")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-coivon-patterson")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-neika")).toHaveTextContent("4.0");
  expect(screen.getByTestId("apps-steven-ramos")).toHaveTextContent("3.0");
  expect(screen.getByTestId("apps-fritzna-salomon")).toHaveTextContent("0.0");
  expect(screen.getByText("4/13")).toBeInTheDocument();
  expect(screen.getAllByText(/need a save/i).length).toBeGreaterThan(0);
  expect(screen.getByTestId("avg-nate")).toHaveTextContent("8.0");
  expect(screen.getByTestId("avg-jordan-aguirre")).toHaveTextContent("7.7");
  expect(screen.getByTestId("avg-steve-nash")).toHaveTextContent("6.0");
  expect(screen.getByTestId("avg-neika")).toHaveTextContent("5.0");
  expect(screen.getByTestId("avg-fritzna-salomon")).toHaveTextContent("1.3");
});

test("clicking a day cell logs an app and re-ranks live", () => {
  render(<App />);

  fireEvent.click(
    screen.getByTitle("Amaya Montero SUN: click to add an app, shift-click to remove.")
  );

  expect(screen.getByTestId("apps-amaya-montero")).toHaveTextContent("1.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("48.0");
  expect(window.localStorage.getItem(STORAGE_KEY)).toContain("amaya-montero");
});

test("merges a saved Ismael row into Steveo Ramos on load", () => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      teamName: "G-UNIT",
      weekStart: "2026-09-21",
      dg: { current: 4, goal: 13 },
      nlLeft: 28,
      reps: [
        {
          id: "steven-ramos",
          name: "Steveo Ramos",
          lastWeekApps: 4,
          prevWeekApps: 10,
          days: [0, 0, 0, 0, 0, 0, 3],
          cx: 3,
        },
        {
          id: "ismael-ramos",
          name: "Ismael",
          lastWeekApps: 0,
          prevWeekApps: 0,
          days: [0, 0, 0, 0, 0, 0, 0],
          cx: 0,
        },
      ],
    })
  );

  render(<App />);

  expect(screen.queryByTestId("apps-ismael-ramos")).not.toBeInTheDocument();
  expect(screen.getByTestId("apps-steven-ramos")).toHaveTextContent("3.0");
  expect(screen.getByTestId("team-apps")).toHaveTextContent("3.0");
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
