import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  DAILY_APP_GOAL,
  DAILY_CX_GOAL,
  DAYS,
  STORAGE_KEY,
  WEEKLY_LINE_GOAL,
  applyCount,
  cloneBoard,
  deriveBoard,
  formatApps,
  formatAvg,
  formatMoney,
  formatPct,
  loadBoardState,
} from "./boardData";

const NOTES = [
  "Week of Monday 9/7. Wednesday is the close. Thursday is the G-Unit live log. This board is as of Thursday 9/10.",
  "Last week is the Sunday G-Unit close. Previous week is the PM board: Grant 8, Kyron 6, Jordan 5, Shaad 2, Matthew 1.",
  "Steve Nash's previous week of 9 includes Granna 7, Leo 1, and his own 1.",
  "Steveo Ramos's previous week of 3 is Cameron's lines. Ismael Ramos is not Steveo Ramos.",
  "First week on this board: Nate, Mackenzie Faith, Neika, Guy Lesperance, Ismael Ramos, Shatreasure Evans, and Ashunte Reyes.",
];

function App() {
  const [board, setBoard] = useState(loadBoardState);
  const { ranked, totals } = useMemo(() => deriveBoard(board.reps), [board.reps]);
  const latest = board.activity[0];
  const maxWeek = Math.max(1, ...ranked.map((rep) => rep.week));
  const thursdayApps = totals.days[3];
  const thursdayGoalHit = thursdayApps >= DAILY_APP_GOAL;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch {
      // Private mode and full storage can reject the write. The board still works in memory.
    }
  }, [board]);

  function changeCount(repId, field, dayIndex, subtract) {
    const delta = subtract ? -1 : 1;
    const entryId = `${repId}-${field}-${dayIndex}-${delta}-${Date.now()}`;
    setBoard((current) => applyCount(current, { repId, dayIndex, field, delta, entryId }));
  }

  function resetBoard() {
    if (!window.confirm("Reset the board to the Thursday snapshot?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures and still restore the in-memory snapshot.
    }
    setBoard(cloneBoard());
  }

  return (
    <div className="board">
      <header className="top">
        <div className="brand">
          <p className="eyebrow">Sales channel</p>
          <h1>G-UNIT</h1>
          <p className="tag">Results get rewarded</p>
        </div>
        <div className="week">
          <p className="eyebrow">Week of</p>
          <p className="week-range">Sep 7 – Sep 13</p>
          <p className="asof">As of Thursday · Sep 10</p>
        </div>
        <div className="live-block">
          <p className="live-kicker">
            <span className="live-dot" aria-hidden="true" />
            Live
          </p>
          <p className="live-line" data-testid="live-line" aria-live="polite">
            <strong>{latest.rep}</strong> {latest.detail} <span className="hash">#G-UNIT</span>
          </p>
          {board.activity.length > 1 && (
            <ul className="live-history">
              {board.activity.slice(1, 4).map((item) => (
                <li key={item.id}>
                  {item.rep} {item.detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <section className="kpis" aria-label="Week totals">
        <Kpi label="Week apps" value={formatApps(totals.week)} testId="team-apps" />
        <Kpi label="CX count" value={String(totals.cx)} testId="team-cx" />
        <Kpi label="Team CX %" value={formatPct(totals.cxPct)} testId="team-cxpct" />
        <Kpi label="WoW" value={totals.wow.label} testId="team-wow" tone={totals.wow.kind} />
        <Kpi label="Earned" value={formatMoney(totals.est)} testId="team-est" featured />
        <Kpi label="Blended $/line" value="$97.50" detail="estimate" />
        <Kpi
          label="NL left"
          value={String(totals.nlLeft)}
          testId="nl-left"
          detail={`of ${WEEKLY_LINE_GOAL}`}
        />
        <Kpi label="DG" value={`${DAILY_APP_GOAL}/${DAILY_CX_GOAL}`} detail="apps / closes" />
        <Kpi label="Rolling 3-wk avg" value={formatAvg(totals.avg)} testId="team-avg" />
      </section>

      <div className={`goal-strip${thursdayGoalHit ? " goal-hit" : ""}`}>
        <p data-testid="thu-apps">
          Thursday live log {formatApps(thursdayApps)} apps
          {thursdayGoalHit
            ? " · daily app goal hit"
            : ` · ${formatApps(DAILY_APP_GOAL - thursdayApps)} to the daily app goal`}
        </p>
        <p className="push" data-testid="earned-banner">
          Team has earned {formatMoney(totals.est)} this week. Keep pushing.
        </p>
      </div>

      <p className="hint">Click a day cell to log an app. Click CX to log a close. Shift-click to subtract.</p>

      <div className="table-scroll">
        <table className="sheet">
          <caption>G-Unit running week totals, week of Sep 7 through Sep 13, as of Thursday.</caption>
          <thead>
            <tr>
              <th className="sticky-rank">#</th>
              <th className="sticky-rep">Rep</th>
              <th>Week</th>
              <th>Last</th>
              <th>Prev</th>
              <th>3-wk</th>
              {DAYS.map((day) => (
                <th key={day.key} className={day.today ? "today" : undefined}>
                  <span className="day-name">{day.short}</span>
                  <span className="day-date">{day.date}</span>
                  {day.note && <span className="day-note">{day.note}</span>}
                </th>
              ))}
              <th>CX</th>
              <th>CX %</th>
              <th>WoW</th>
              <th>Est. $</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((rep, index) => (
              <tr key={rep.id} data-testid={`rep-${rep.id}`}>
                <th className="sticky-rank rank" data-testid={`rank-${rep.id}`} scope="row">
                  {index + 1}
                </th>
                <th className="sticky-rep rep" scope="row">
                  <span className="rep-name">{rep.name}</span>
                  {rep.tag && <span className="rep-tag">{rep.tag}</span>}
                  <span className="badges">
                    {rep.firstWeek && <span className="badge">1ST WEEK</span>}
                    {rep.dailyGoalHit && <span className="badge badge-hit">DAILY GOAL HIT</span>}
                  </span>
                </th>
                <td className="strong" data-testid={`week-${rep.id}`}>
                  {formatApps(rep.week)}
                </td>
                <td>{formatApps(rep.lastWeek)}</td>
                <td>{formatApps(rep.prevWeek)}</td>
                <td data-testid={`avg-${rep.id}`}>{formatAvg(rep.avg)}</td>
                {DAYS.map((day, dayIndex) => {
                  const value = rep.days[dayIndex];
                  return (
                    <td key={day.key} className={day.today ? "today" : undefined}>
                      <button
                        type="button"
                        className={value > 0 ? "cell-btn hot" : "cell-btn"}
                        data-testid={`app-${rep.id}-${day.key}`}
                        aria-label={`${rep.name} ${day.short} ${formatApps(value)} apps. Click to log an app. Shift-click to subtract.`}
                        onMouseDown={(event) => {
                          if (event.shiftKey) event.preventDefault();
                        }}
                        onClick={(event) => changeCount(rep.id, "app", dayIndex, event.shiftKey)}
                      >
                        {formatApps(value)}
                      </button>
                    </td>
                  );
                })}
                <td>
                  <button
                    type="button"
                    className={rep.cx > 0 ? "cell-btn hot cx-btn" : "cell-btn cx-btn"}
                    data-testid={`cx-${rep.id}`}
                    aria-label={`${rep.name} ${rep.cx} closes. Click to log a close. Shift-click to subtract.`}
                    onMouseDown={(event) => {
                      if (event.shiftKey) event.preventDefault();
                    }}
                    onClick={(event) => changeCount(rep.id, "cx", 0, event.shiftKey)}
                  >
                    {rep.cx}
                  </button>
                </td>
                <td data-testid={`cxpct-${rep.id}`} className={rep.cxPct >= 100 ? "hot-pct" : undefined}>
                  {formatPct(rep.cxPct)}
                </td>
                <td data-testid={`wow-${rep.id}`} className={`wow wow-${rep.wow.kind}`}>
                  {rep.wow.label}
                </td>
                <td className="est" data-testid={`est-${rep.id}`}>
                  {formatMoney(rep.est)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className="sticky-rank" scope="row" />
              <th className="sticky-rep" scope="row">
                Totals
              </th>
              <td>{formatApps(totals.week)}</td>
              <td>{formatApps(totals.lastWeek)}</td>
              <td>{formatApps(totals.prevWeek)}</td>
              <td>{formatAvg(totals.avg)}</td>
              {totals.days.map((value, index) => (
                <td key={DAYS[index].key} className={DAYS[index].today ? "today" : undefined}>
                  {formatApps(value)}
                </td>
              ))}
              <td>{totals.cx}</td>
              <td>{formatPct(totals.cxPct)}</td>
              <td className={`wow wow-${totals.wow.kind}`}>{totals.wow.label}</td>
              <td className="est" title="Rounded from week apps × $97.50">
                {formatMoney(totals.est)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="bars" aria-labelledby="bars-title">
        <h2 id="bars-title">Week apps by rep</h2>
        <ol>
          {ranked.map((rep) => (
            <li key={rep.id}>
              <span className="bar-name">{rep.name}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(rep.week / maxWeek) * 100}%` }} />
              </span>
              <span className="bar-value">{formatApps(rep.week)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="notes" aria-labelledby="notes-title">
        <h2 id="notes-title">Notes</h2>
        <ul>
          {NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <button type="button" className="reset" onClick={resetBoard}>
          Reset to Thursday snapshot
        </button>
      </section>
    </div>
  );
}

function Kpi({ label, value, detail, testId, featured, tone }) {
  return (
    <article className={`kpi${featured ? " kpi-featured" : ""}`}>
      <p className="kpi-label">{label}</p>
      <p className={`kpi-value${tone ? ` wow-${tone}` : ""}`} data-testid={testId}>
        {value}
      </p>
      {detail && <p className="kpi-detail">{detail}</p>}
    </article>
  );
}

export default App;
