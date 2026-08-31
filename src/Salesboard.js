import { useMemo, useState } from "react";
import "./Salesboard.css";
import {
  applyLastWeekFinal,
  formatMoney,
  formatSignedPercent,
  loadStoredBoard,
  parseBoardText,
  resetBoard,
  saveBoard,
  setTeamWeeklyGoal,
} from "./data/board";

const DAY_LABELS = [
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
  ["sat", "Sat"],
  ["sun", "Sun"],
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

function DailyBars({ totals, title }) {
  const values = DAY_LABELS.map(([key]) =>
    totals?.[key] === null || totals?.[key] === undefined ? null : Number(totals[key]) || 0
  );
  const known = values.filter((value) => value !== null);
  const dailyMax = Math.max(1, ...known);

  return (
    <section className="daily" aria-label={title}>
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      <div className="daily-bars daily-bars-7">
        {DAY_LABELS.map(([key, label], index) => {
          const value = values[index];
          const pending = value === null;
          return (
            <div key={key} className="daily-bar">
              <div
                className={`bar${pending ? " bar-pending" : ""}`}
                style={{ height: `${pending ? 12 : Math.max(8, (value / dailyMax) * 100)}%` }}
              />
              <strong>{pending ? "—" : value}</strong>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Salesboard() {
  const [board, setBoard] = useState(() => loadStoredBoard());
  const [draft, setDraft] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [goalDraft, setGoalDraft] = useState(String(board.teamWeeklyGoal));

  const lastWeek = board.lastWeek;
  const weekly = board.weeklyGoal;

  const lastWeekReps = useMemo(
    () => [...(lastWeek?.reps || [])].sort((a, b) => (a.rank || 0) - (b.rank || 0)),
    [lastWeek]
  );

  function applyBoard(next, message) {
    const saved = { ...next };
    saveBoard(saved);
    setBoard(saved);
    setGoalDraft(String(saved.teamWeeklyGoal));
    setNotice(message);
  }

  function handlePasteThisWeek(event) {
    event.preventDefault();
    try {
      applyBoard(parseBoardText(draft, board), "This week updated from pasted text.");
      setDraft("");
      setEditorOpen(false);
    } catch (error) {
      setNotice(error.message);
    }
  }

  function handlePasteLastWeek() {
    try {
      applyBoard(
        applyLastWeekFinal(draft, board),
        "Last week final updated from Saturday/Sunday paste."
      );
      setDraft("");
      setEditorOpen(false);
    } catch (error) {
      setNotice(error.message);
    }
  }

  function handleReset() {
    applyBoard(resetBoard(), "Restored the new-week snapshot with last week archived.");
    setDraft("");
  }

  function handleGoalSave(event) {
    event.preventDefault();
    applyBoard(
      setTeamWeeklyGoal(board, goalDraft),
      `This week's team goal set to ${Number(goalDraft) || 0} NL.`
    );
  }

  return (
    <div className="board">
      <header className="board-hero">
        <div className="eyebrow">Opulent Inventory · G-Unit</div>
        <div className="hero-row">
          <div>
            <h1>{board.title}</h1>
            <p className="hero-sub">
              {board.day} · {board.weekLabel} · {board.sourceLabel}
            </p>
          </div>
          <div className="hero-chip">
            <span>Team weekly goal</span>
            <strong>{weekly.nlLeft} NL left</strong>
          </div>
        </div>
      </header>

      <section className="week-goal" aria-label="This week team goal">
        <div className="section-head">
          <h2>This week team goal</h2>
          <p>
            {weekly.produced} / {weekly.goal} NL · {weekly.pct}%
          </p>
        </div>
        <div className="progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={weekly.pct}>
          <div className="progress-fill" style={{ width: `${weekly.pct}%` }} />
        </div>
        <form className="goal-form" onSubmit={handleGoalSave}>
          <label htmlFor="weekly-goal">Set NL target</label>
          <input
            id="weekly-goal"
            type="number"
            min="0"
            value={goalDraft}
            onChange={(event) => setGoalDraft(event.target.value)}
          />
          <button type="submit">Save goal</button>
        </form>
      </section>

      {lastWeek && (
        <section className="last-week" aria-label="Last week production">
          <div className="section-head">
            <h2>{lastWeek.label}</h2>
            <p>
              {lastWeek.pendingWeekend
                ? "Sat/Sun pending from Google Doc"
                : lastWeek.sourceLabel}
            </p>
          </div>
          <div className="stat-grid last-week-stats">
            <article>
              <p>Last week apps</p>
              <strong>{lastWeek.totals.apps}</strong>
            </article>
            <article>
              <p>Last week CX</p>
              <strong>{lastWeek.totals.cx}</strong>
            </article>
            <article>
              <p>Last week $</p>
              <strong>{formatMoney(lastWeek.totals.earned)}</strong>
            </article>
            <article>
              <p>Sunday remaining</p>
              <strong>{lastWeek.sundayRemaining?.team ?? "—"}</strong>
            </article>
          </div>
        </section>
      )}

      <section className="stat-grid" aria-label="This week totals">
        <article>
          <p>This week apps</p>
          <strong>{board.totals.apps}</strong>
        </article>
        <article>
          <p>This week CX</p>
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

      <section className="leaderboard" aria-label="This week leaderboard">
        <div className="section-head">
          <h2>This week leaderboard</h2>
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
                <th>Last wk apps</th>
                <th>Last wk CX</th>
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
                  <td>{rep.lastWeekApps ?? "—"}</td>
                  <td>{rep.lastWeekCx ?? "—"}</td>
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

      <DailyBars totals={board.dailyTotals} title="This week daily totals" />
      {lastWeek?.dailyTotals && (
        <DailyBars totals={lastWeek.dailyTotals} title="Last week daily totals" />
      )}

      {lastWeekReps.length > 0 && (
        <section className="leaderboard" aria-label="Last week leaderboard">
          <div className="section-head">
            <h2>Last week leaderboard</h2>
            <p>{lastWeek.sourceLabel}</p>
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
                  <th>Est. $</th>
                </tr>
              </thead>
              <tbody>
                {lastWeekReps.map((rep) => (
                  <tr key={`last-${rep.name}`}>
                    <td>
                      <span className="rank">
                        {medalFor(rep.rank)} {rep.rank}
                      </span>
                    </td>
                    <td className="rep-name">{rep.displayName}</td>
                    <td>{rep.apps}</td>
                    <td>{rep.cx}</td>
                    <td>{rep.cxPct}%</td>
                    <td>{formatMoney(rep.earned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          {editorOpen ? "Hide update panel" : "Paste a scoreboard"}
        </button>
        <button type="button" className="ghost" onClick={handleReset}>
          Reset official snapshot
        </button>
        {editorOpen && (
          <form onSubmit={handlePasteThisWeek}>
            <label htmlFor="board-paste">
              Paste Slack scoreboard text. Use Last week final for Saturday/Sunday close numbers.
            </label>
            <textarea
              id="board-paste"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={"DG: 4/10 | 3 NL LEFT | Sunday\n1. Jordan Aguirre 17 Apps | 6 CX"}
            />
            <div className="updater-actions">
              <button type="submit">Update this week</button>
              <button type="button" className="ghost" onClick={handlePasteLastWeek}>
                Save as last week final
              </button>
            </div>
          </form>
        )}
        {notice ? <p className="notice">{notice}</p> : null}
      </section>
    </div>
  );
}
