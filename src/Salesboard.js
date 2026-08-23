import { useMemo, useState } from "react";
import "./Salesboard.css";
import {
  formatMoney,
  formatSignedPercent,
  loadStoredBoard,
  parseBoardText,
  resetBoard,
  saveBoard,
} from "./data/board";

const DAY_LABELS = [
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
];

function medalFor(rank) {
  return { 1: "🥇", 2: "🥈", 3: "🥉" }[rank] || "";
}

function wowClass(value) {
  if (value === null || value === undefined) return "wow wow-new";
  if (value > 0) return "wow wow-up";
  if (value < 0) return "wow wow-down";
  return "wow wow-flat";
}

export default function Salesboard() {
  const [board, setBoard] = useState(() => loadStoredBoard());
  const [draft, setDraft] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const dailyMax = useMemo(() => {
    const values = Object.values(board.dailyTotals || {}).filter(
      (value) => typeof value === "number"
    );
    return Math.max(1, ...values);
  }, [board.dailyTotals]);

  function applyBoard(next, message) {
    const saved = { ...next };
    saveBoard(saved);
    setBoard(saved);
    setNotice(message);
  }

  function handlePaste(event) {
    event.preventDefault();
    try {
      applyBoard(parseBoardText(draft), "Board updated from pasted text.");
      setDraft("");
      setEditorOpen(false);
    } catch (error) {
      setNotice(error.message);
    }
  }

  function handleReset() {
    applyBoard(resetBoard(), "Restored the official Thursday/Sunday snapshot.");
    setDraft("");
  }

  const teamGoal = board.goals.find((goal) => goal.id === "team");

  return (
    <div className="board">
      <header className="board-hero">
        <div className="eyebrow">Opulent Inventory · G-Unit</div>
        <div className="hero-row">
          <div>
            <h1>{board.title}</h1>
            <p className="hero-sub">
              {board.day} · {board.sourceLabel}
            </p>
          </div>
          <div className="hero-chip">
            <span>DG {board.dgNum}/{board.dgDen}</span>
            <strong>{teamGoal ? `${teamGoal.nlLeft} NL left` : "Live board"}</strong>
          </div>
        </div>
      </header>

      <section className="goal-grid" aria-label="Goal tracker">
        {board.goals.map((goal) => (
          <article key={goal.id} className={`goal-card tone-${goal.tone}`}>
            <p>{goal.label}</p>
            <h2>{goal.nlLeft}</h2>
            <span>NL remaining</span>
          </article>
        ))}
      </section>

      <section className="stat-grid" aria-label="Team totals">
        <article>
          <p>Week apps</p>
          <strong>{board.totals.apps}</strong>
        </article>
        <article>
          <p>CX / NL</p>
          <strong>{board.totals.cx}</strong>
        </article>
        <article>
          <p>CX rate</p>
          <strong>{board.totals.cxPct}%</strong>
        </article>
        <article>
          <p>Est. team $</p>
          <strong>{formatMoney(board.totals.earned)}</strong>
        </article>
      </section>

      <section className="leaderboard" aria-label="Rep leaderboard">
        <div className="section-head">
          <h2>Leaderboard</h2>
          <p>{board.dataAsOf}</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Rep</th>
                <th>Apps</th>
                <th>CX</th>
                <th>CX%</th>
                <th>WoW</th>
                <th>Est. $</th>
              </tr>
            </thead>
            <tbody>
              {board.reps.map((rep) => (
                <tr key={rep.name} className={rep.rank <= 3 ? "podium" : undefined}>
                  <td>
                    <span className="rank">
                      {medalFor(rep.rank)} {rep.rank}
                    </span>
                  </td>
                  <td>
                    <div className="rep-name">{rep.displayName}</div>
                    {rep.flags?.length ? (
                      <div className="rep-flag">{rep.flags[0]}</div>
                    ) : null}
                  </td>
                  <td>{rep.apps}</td>
                  <td>{rep.cx}</td>
                  <td>{rep.cxPct}%</td>
                  <td>
                    <span className={wowClass(rep.wow)}>
                      {formatSignedPercent(rep.wow)}
                    </span>
                  </td>
                  <td>{formatMoney(rep.earned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {Object.keys(board.dailyTotals || {}).length > 0 && (
        <section className="daily" aria-label="Daily running totals">
          <div className="section-head">
            <h2>Daily running totals</h2>
          </div>
          <div className="daily-bars">
            {DAY_LABELS.map(([key, label]) => {
              const value = board.dailyTotals[key] || 0;
              return (
                <div key={key} className="daily-bar">
                  <div
                    className="bar"
                    style={{ height: `${Math.max(8, (value / dailyMax) * 100)}%` }}
                  />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="notes" aria-label="Board notes">
        <h2>Notes</h2>
        <ul>
          {board.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="updater">
        <button
          type="button"
          className="ghost"
          onClick={() => setEditorOpen((open) => !open)}
        >
          {editorOpen ? "Hide update panel" : "Paste a new scoreboard"}
        </button>
        <button type="button" className="ghost" onClick={handleReset}>
          Reset official snapshot
        </button>
        {editorOpen && (
          <form onSubmit={handlePaste}>
            <label htmlFor="board-paste">
              Paste Slack scoreboard text to refresh ranks
            </label>
            <textarea
              id="board-paste"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={"DG: 4/10 | 3 NL LEFT | Sunday\n1. Jordan Aguirre 17 Apps | 6 CX"}
            />
            <button type="submit">Update board</button>
          </form>
        )}
        {notice ? <p className="notice">{notice}</p> : null}
      </section>
    </div>
  );
}
