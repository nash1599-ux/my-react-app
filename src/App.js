import { useEffect, useMemo, useState } from "react";
import {
  BLENDED_RATE,
  STORAGE_KEY,
  WEEK_DAYS,
  cloneSeed,
} from "./data/seed";
import {
  addDays,
  bump,
  formatAvg,
  formatMoney,
  formatPct,
  formatWeekRange,
  formatWow,
  isoDate,
  mondayDate,
  rankedReps,
  slugify,
  teamTotals,
  todayIndex,
} from "./lib/stats";
import "./App.css";

function loadBoard() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw);
    if (!parsed?.reps?.length) return cloneSeed();
    return parsed;
  } catch {
    return cloneSeed();
  }
}

function deltaFromEvent(event) {
  if (event.shiftKey || event.button === 2) return -1;
  return 1;
}

export default function App() {
  const [board, setBoard] = useState(loadBoard);
  const [editRoster, setEditRoster] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const rows = useMemo(() => rankedReps(board.reps), [board.reps]);
  const totals = useMemo(() => teamTotals(board.reps), [board.reps]);
  const liveDay = todayIndex(board.weekStart);
  const weekLabel = formatWeekRange(board.weekStart);
  const maxApps = Math.max(1, ...rows.map((row) => row.apps));

  function updateRep(id, updater) {
    setBoard((current) => ({
      ...current,
      reps: current.reps.map((rep) =>
        rep.id === id ? updater({ ...rep, days: [...rep.days] }) : rep
      ),
    }));
  }

  function changeDay(id, dayIndex, event) {
    event.preventDefault();
    const delta = deltaFromEvent(event);
    updateRep(id, (rep) => {
      const days = [...rep.days];
      days[dayIndex] = bump(days[dayIndex], delta);
      return { ...rep, days };
    });
  }

  function changeCx(id, event) {
    event.preventDefault();
    const delta = deltaFromEvent(event);
    updateRep(id, (rep) => ({ ...rep, cx: bump(rep.cx, delta) }));
  }

  function startNewWeek() {
    const ok = window.confirm(
      "Roll this week into Last Week and start a fresh Mon–Sun board?"
    );
    if (!ok) return;
    setBoard((current) => ({
      ...current,
      weekStart: isoDate(addDays(mondayDate(current.weekStart), 7)),
      asOfLabel: "live week",
      reps: current.reps.map((rep) => ({
        ...rep,
        prevWeekApps: rep.lastWeekApps,
        lastWeekApps: rep.days.reduce((sum, value) => sum + value, 0),
        firstWeek: false,
        badge: undefined,
        days: [0, 0, 0, 0, 0, 0, 0],
        cx: 0,
      })),
    }));
  }

  function resetBoard() {
    const ok = window.confirm("Reset the board back to the Wednesday G-Unit snapshot?");
    if (!ok) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setBoard(cloneSeed());
  }

  function addRep(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const id = `${slugify(name)}-${Date.now()}`;
    setBoard((current) => ({
      ...current,
      reps: [
        ...current.reps,
        {
          id,
          name,
          accent: "slate",
          lastWeekApps: 0,
          prevWeekApps: 0,
          days: [0, 0, 0, 0, 0, 0, 0],
          cx: 0,
          listOrder: 999,
        },
      ],
    }));
    setNewName("");
  }

  function removeRep(id) {
    setBoard((current) => ({
      ...current,
      reps: current.reps.filter((rep) => rep.id !== id),
    }));
  }

  return (
    <div className="board-page">
      <div className="board-shell">
        <header className="toolbar">
          <div>
            <p className="eyebrow">Precision Management · Sales Channel</p>
            <h1>G-Unit live board</h1>
            <p className="subhead">
              Week of {weekLabel} · {board.asOfLabel}. Click a day cell to log an
              app, click CX to log a close. Shift-click to subtract.
            </p>
            {board.liveCall && <p className="live-call">{board.liveCall}</p>}
          </div>
          <div className="toolbar-actions">
            <button type="button" onClick={startNewWeek}>
              Start new week
            </button>
            <button type="button" className="ghost" onClick={() => setEditRoster((v) => !v)}>
              {editRoster ? "Done" : "Edit roster"}
            </button>
            <button type="button" className="ghost" onClick={resetBoard}>
              Reset snapshot
            </button>
          </div>
        </header>

        <div className="sheet" data-testid="gunit-sheet">
          <table>
            <thead>
              <tr className="group-row">
                <th className="logo-cell" rowSpan={2} colSpan={2}>
                  <div className="brand">
                    <div className="mark" aria-hidden="true">
                      GU
                    </div>
                    <div>
                      <div className="brand-name">G-UNIT</div>
                      <div className="brand-sub">SALES CHANNEL</div>
                      <div className="brand-tag">“{board.tagline}”</div>
                    </div>
                  </div>
                </th>
                <th className="grp grp-apps">WEEK TOTALS</th>
                <th className="grp grp-run" colSpan={4}>
                  RUNNING WEEK TOTALS
                </th>
                <th className="grp grp-last">Last Week</th>
                <th className="grp grp-prev">Prev. Week</th>
                <th className="grp grp-avg">3-Wk Avg</th>
                {WEEK_DAYS.map((day, index) => (
                  <th
                    key={day}
                    className={`grp grp-day day-${index} ${liveDay === index ? "is-today" : ""}`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
              <tr className="label-row">
                <th className="grp-apps">Apps</th>
                <th className="cx">Cx Count</th>
                <th className="cxpct">CX %</th>
                <th className="wow">WoW</th>
                <th className="money">Est. $</th>
                <th className="grp-last">Apps</th>
                <th className="grp-prev">Apps</th>
                <th className="grp-avg">Apps</th>
                {WEEK_DAYS.map((day, index) => (
                  <th
                    key={`h-${day}`}
                    className={`grp-day day-${index} ${liveDay === index ? "is-today" : ""}`}
                  >
                    Apps
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((rep) => (
                <tr key={rep.id}>
                  <td className="rank">{rep.rank}</td>
                  <td className={`name accent-${rep.accent}`}>
                    <span>{rep.name}</span>
                    {rep.badge && <span className="rep-badge">{rep.badge}</span>}
                    {editRoster && (
                      <button
                        type="button"
                        className="remove"
                        onClick={() => removeRep(rep.id)}
                        aria-label={`Remove ${rep.name}`}
                      >
                        ×
                      </button>
                    )}
                  </td>
                  <td
                    className={`apps ${rep.rank === 1 ? "leader" : ""}`}
                    data-testid={`apps-${rep.id}`}
                  >
                    {rep.apps.toFixed(1)}
                  </td>
                  <td className="cx">
                    <button
                      type="button"
                      className="cell-btn"
                      onClick={(event) => changeCx(rep.id, event)}
                      onContextMenu={(event) => changeCx(rep.id, event)}
                      title={`${rep.name} CX: click to add a close, shift-click to remove.`}
                    >
                      {rep.cx}
                    </button>
                  </td>
                  <td className={`cxpct ${rep.cxPct >= 80 ? "hot" : ""}`}>
                    {formatPct(rep.cxPct)}
                  </td>
                  <td className={`wow ${rep.wow >= 0 ? "up" : "down"}`}>
                    {formatWow(rep.wow, rep.lastWeekApps, rep.firstWeek)}
                  </td>
                  <td className="money">{formatMoney(rep.earned)}</td>
                  <td className="grp-last">{rep.lastWeekApps.toFixed(1)}</td>
                  <td className="grp-prev">{rep.prevWeekApps.toFixed(1)}</td>
                  <td className="grp-avg" data-testid={`avg-${rep.id}`}>
                    {formatAvg(rep.rolling)}
                  </td>
                  {rep.days.map((value, dayIndex) => (
                    <td
                      key={`${rep.id}-${dayIndex}`}
                      className={`grp-day day-${dayIndex} ${liveDay === dayIndex ? "is-today" : ""}`}
                    >
                      <button
                        type="button"
                        className="cell-btn"
                        onClick={(event) => changeDay(rep.id, dayIndex, event)}
                        onContextMenu={(event) => changeDay(rep.id, dayIndex, event)}
                        title={`${rep.name} ${WEEK_DAYS[dayIndex]}: click to add an app, shift-click to remove.`}
                      >
                        {Number(value).toFixed(1)}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="rank" />
                <td className="name totals-name">TOTALS</td>
                <td className="apps leader" data-testid="team-apps">
                  {totals.apps.toFixed(1)}
                </td>
                <td className="cx">{totals.cx}</td>
                <td className="cxpct">{formatPct(totals.cxPct)}</td>
                <td className={`wow ${totals.wow >= 0 ? "up" : "down"}`}>
                  {formatWow(totals.wow, totals.lastWeekApps)}
                </td>
                <td className="money">{formatMoney(totals.earned)}</td>
                <td className="grp-last">{totals.lastWeekApps.toFixed(1)}</td>
                <td className="grp-prev">{totals.prevWeekApps.toFixed(1)}</td>
                <td className="grp-avg">{formatAvg(totals.rolling)}</td>
                {totals.days.map((value, dayIndex) => (
                  <td
                    key={`t-${dayIndex}`}
                    className={`grp-day day-${dayIndex} ${liveDay === dayIndex ? "is-today" : ""}`}
                  >
                    {value.toFixed(1)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {editRoster && (
          <form className="roster-form" onSubmit={addRep}>
            <label htmlFor="new-rep">Add a G-Unit rep</label>
            <input
              id="new-rep"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Full name"
            />
            <button type="submit">Add</button>
          </form>
        )}

        <div className="banner">
          TEAM HAS EARNED {formatMoney(totals.earned)} THIS WEEK — KEEP PUSHING!
        </div>

        <section className="lower">
          <div className="chart-card">
            <h2>Week Apps by Rep</h2>
            <div className="bars">
              {rows.map((rep) => (
                <div className="bar-col" key={`bar-${rep.id}`}>
                  <div className="bar-value">{rep.apps}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${(rep.apps / maxApps) * 100}%` }}
                    />
                  </div>
                  <div className="bar-label">{rep.shortName || rep.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="meta-card">
            <dl>
              <div>
                <dt>Blended $line (estimate)</dt>
                <dd>{formatMoney(BLENDED_RATE)}</dd>
              </div>
              <div>
                <dt>DG</dt>
                <dd className={board.dg.current >= board.dg.goal ? "goal-hit" : ""}>
                  {board.dg.current}/{board.dg.goal}
                </dd>
              </div>
              <div>
                <dt>NL left</dt>
                <dd>{board.nlLeft}</dd>
              </div>
              <div>
                <dt>Team CX %</dt>
                <dd>{formatPct(totals.cxPct)}</dd>
              </div>
              <div>
                <dt>Rolling 3-wk avg</dt>
                <dd>{formatAvg(totals.rolling)}</dd>
              </div>
            </dl>
            <p className="notes">
              <strong>NOTES</strong>
              <br />
              {board.notes}
            </p>
            <p className="hint">
              This board stays live in your browser. Log apps as they close and
              hit Start new week on Monday to roll last week / prev week.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
