import { useMemo, useState } from "react";
import { loadStoredBoard } from "./data/board";
import {
  DAILY_HEADERS,
  downloadCsv,
  loadStoredTracker,
  saveTracker,
  snapshotWeekFromBoard,
  toCsv,
  WEEKLY_HEADERS,
} from "./data/weeklyTracker";

function Table({ headers, rows, onChange, onRemove }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.Rep || row.Date || "row"}-${rowIndex}`}>
              {headers.map((header) => (
                <td key={header}>
                  <input
                    aria-label={`${header} ${rowIndex + 1}`}
                    value={row[header] ?? ""}
                    onChange={(event) => onChange(rowIndex, header, event.target.value)}
                  />
                </td>
              ))}
              <td>
                <button type="button" className="ghost" onClick={() => onRemove(rowIndex)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function emptyWeeklyRow(tracker) {
  return Object.fromEntries(
    WEEKLY_HEADERS.map((header) => [
      header,
      header === "Week Start"
        ? tracker.weekStart
        : header === "Week Label"
          ? tracker.weekLabel
          : "",
    ])
  );
}

function emptyDailyRow(tracker) {
  return Object.fromEntries(
    DAILY_HEADERS.map((header) => [
      header,
      header === "Weekly Goal" ? tracker.weeklyRows?.[0]?.["Weekly Goal"] || "" : "",
    ])
  );
}

export default function WeeklyTracker() {
  const [tracker, setTracker] = useState(() => loadStoredTracker());
  const [notice, setNotice] = useState("");
  const weeklyCsv = useMemo(
    () => toCsv(WEEKLY_HEADERS, tracker.weeklyRows),
    [tracker.weeklyRows]
  );
  const dailyCsv = useMemo(
    () => toCsv(DAILY_HEADERS, tracker.dailyRows),
    [tracker.dailyRows]
  );

  function persist(next, message) {
    const saved = saveTracker(next);
    setTracker(saved);
    setNotice(message);
  }

  function updateRow(key) {
    return (rowIndex, header, value) => {
      const rows = tracker[key].map((row, index) =>
        index === rowIndex ? { ...row, [header]: value } : row
      );
      persist({ ...tracker, [key]: rows }, "Tracker saved.");
    };
  }

  function removeRow(key) {
    return (rowIndex) => {
      persist(
        { ...tracker, [key]: tracker[key].filter((_, index) => index !== rowIndex) },
        "Row removed."
      );
    };
  }

  function handleSnapshot() {
    const board = loadStoredBoard();
    persist(
      snapshotWeekFromBoard(tracker, board, {
        Date: new Date().toISOString().slice(0, 10),
        Day: board.day,
        notes: "Pulled from live board",
      }),
      "Week snapshot saved from the live board."
    );
  }

  return (
    <div className="tracker">
      <header className="board-hero">
        <div className="eyebrow">Week to week</div>
        <h1>G-Unit spreadsheet tracker</h1>
        <p className="hero-sub">
          Keep every week. Export CSV into Google Sheets. Do not lose the story of the run.
        </p>
      </header>

      <section className="week-goal">
        <div className="goal-form">
          <label htmlFor="week-start">Week start</label>
          <input
            id="week-start"
            type="date"
            value={tracker.weekStart}
            onChange={(event) =>
              persist({ ...tracker, weekStart: event.target.value }, "Week start updated.")
            }
          />
          <label htmlFor="week-label">Label</label>
          <input
            id="week-label"
            value={tracker.weekLabel}
            onChange={(event) =>
              persist({ ...tracker, weekLabel: event.target.value }, "Week label updated.")
            }
          />
          <button type="button" onClick={handleSnapshot}>
            Snapshot live board
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => downloadCsv("gunit-weekly-reps.csv", weeklyCsv)}
          >
            Download reps CSV
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => downloadCsv("gunit-weekly-days.csv", dailyCsv)}
          >
            Download days CSV
          </button>
        </div>
        {notice ? <p className="notice">{notice}</p> : null}
      </section>

      <section className="leaderboard" aria-label="Weekly rep tracker">
        <div className="section-head">
          <h2>Reps by week</h2>
          <p>Import this CSV as a Google Sheet tab named G-Unit Weekly Tracker.</p>
        </div>
        <Table
          headers={WEEKLY_HEADERS}
          rows={tracker.weeklyRows}
          onChange={updateRow("weeklyRows")}
          onRemove={removeRow("weeklyRows")}
        />
        <button
          type="button"
          className="ghost"
          onClick={() =>
            persist(
              { ...tracker, weeklyRows: [...tracker.weeklyRows, emptyWeeklyRow(tracker)] },
              "Rep row added."
            )
          }
        >
          Add rep row
        </button>
      </section>

      <section className="leaderboard" aria-label="Daily tracker">
        <div className="section-head">
          <h2>Days by week</h2>
          <p>One row per field day so Thursday can be compared to last Thursday.</p>
        </div>
        <Table
          headers={DAILY_HEADERS}
          rows={tracker.dailyRows}
          onChange={updateRow("dailyRows")}
          onRemove={removeRow("dailyRows")}
        />
        <button
          type="button"
          className="ghost"
          onClick={() =>
            persist(
              { ...tracker, dailyRows: [...tracker.dailyRows, emptyDailyRow(tracker)] },
              "Day row added."
            )
          }
        >
          Add day row
        </button>
      </section>
    </div>
  );
}
