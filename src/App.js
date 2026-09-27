import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  BOARDS,
  addRep,
  applyCount,
  cloneBoard,
  deriveBoard,
  formatApps,
  formatAvg,
  formatMoney,
  formatPct,
  loadBoardState,
  removeRep,
} from "./boardData";

function App() {
  const [teamId, setTeamId] = useState("gunit");
  const [boards, setBoards] = useState(() => ({
    gunit: loadBoardState(BOARDS.gunit),
    team7: loadBoardState(BOARDS.team7),
  }));

  useEffect(() => {
    Object.values(BOARDS).forEach((profile) => {
      try {
        localStorage.setItem(profile.storageKey, JSON.stringify(boards[profile.id]));
      } catch {
        // Private mode and full storage can reject the write. The board still works in memory.
      }
    });
  }, [boards]);

  function updateBoard(next) {
    setBoards((current) => {
      const previous = current[teamId];
      const resolved = typeof next === "function" ? next(previous) : next;
      return { ...current, [teamId]: resolved };
    });
  }

  return (
    <div className="app-shell">
      <nav className="team-switch" aria-label="Boards">
        {Object.values(BOARDS).map((profile) => (
          <button
            key={profile.id}
            type="button"
            aria-pressed={teamId === profile.id}
            onClick={() => setTeamId(profile.id)}
          >
            {profile.switchLabel}
          </button>
        ))}
      </nav>
      <SalesBoard profile={BOARDS[teamId]} board={boards[teamId]} onChange={updateBoard} />
    </div>
  );
}

function SalesBoard({ profile, board, onChange }) {
  const [draft, setDraft] = useState("");
  const [formError, setFormError] = useState("");
  const { ranked, totals } = useMemo(
    () =>
      deriveBoard(board.reps, {
        blendedRate: profile.blendedRate,
        weeklyLineGoal: profile.weeklyLineGoal,
      }),
    [board.reps, profile]
  );
  const latest = board.activity[0];
  const maxWeek = Math.max(1, ...ranked.map((rep) => rep.week));
  const liveApps = totals.days[profile.liveDayIndex] || 0;
  const showMoney = profile.blendedRate != null;
  const goalHit = profile.dailyAppGoal != null && liveApps >= profile.dailyAppGoal;
  const columnCount = 6 + profile.days.length + 3 + (showMoney ? 1 : 0);

  function changeCount(repId, field, dayIndex, subtract) {
    const delta = subtract ? -1 : 1;
    const entryId = `${profile.id}-${repId}-${field}-${dayIndex}-${delta}-${Date.now()}`;
    onChange((current) =>
      applyCount(current, { repId, dayIndex, field, delta, entryId, days: profile.days })
    );
  }

  function resetBoard() {
    if (!window.confirm(profile.resetConfirm)) return;
    try {
      localStorage.removeItem(profile.storageKey);
    } catch {
      // Ignore storage failures and still restore the in-memory snapshot.
    }
    setDraft("");
    setFormError("");
    onChange(cloneBoard(profile));
  }

  function submitRep(event) {
    event.preventDefault();
    const entryId = `${profile.id}-add-${Date.now()}`;
    const result = addRep(board, draft, entryId);
    setFormError(result.error);
    if (!result.error) {
      onChange(result.board);
      setDraft("");
    }
  }

  function deleteRep(repId) {
    const rep = board.reps.find((item) => item.id === repId);
    if (!rep || !window.confirm(`Remove ${rep.name} from Team 7?`)) return;
    onChange(removeRep(board, repId, `${profile.id}-remove-${repId}-${Date.now()}`));
  }

  return (
    <div className="board" data-team={profile.id}>
      <header className="top">
        <div className="brand">
          <p className="eyebrow">{profile.eyebrow}</p>
          <h1>{profile.brand}</h1>
          <p className="tag">{profile.tagline}</p>
        </div>
        <div className="week">
          <p className="eyebrow">Week of</p>
          <p className="week-range">{profile.weekLabel}</p>
          <p className="asof">{profile.asOf}</p>
        </div>
        <div className="live-block">
          <p className="live-kicker">
            <span className="live-dot" aria-hidden="true" />
            Live
          </p>
          <p className="live-line" data-testid="live-line" aria-live="polite">
            <strong>{latest.rep}</strong> {latest.detail} <span className="hash">{profile.channel}</span>
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
        {showMoney && <Kpi label="Earned" value={formatMoney(totals.est)} testId="team-est" featured />}
        {showMoney && <Kpi label="Blended $/line" value="$97.50" detail="estimate" />}
        {totals.nlLeft != null && (
          <Kpi label="NL left" value={String(totals.nlLeft)} testId="nl-left" detail={`of ${profile.weeklyLineGoal}`} />
        )}
        {profile.dailyAppGoal != null && (
          <Kpi label="DG" value={`${profile.dailyAppGoal}/${profile.dailyCxGoal}`} detail="apps / closes" />
        )}
        <Kpi label="Rolling 3-wk avg" value={formatAvg(totals.avg)} testId="team-avg" />
      </section>

      <div className={`goal-strip${goalHit ? " goal-hit" : ""}`}>
        <p data-testid={profile.id === "gunit" ? "thu-apps" : "live-day-apps"}>
          {profile.liveDayName} live log {formatApps(liveApps)} apps
          {profile.dailyAppGoal == null
            ? ""
            : goalHit
              ? " · daily app goal hit"
              : ` · ${formatApps(profile.dailyAppGoal - liveApps)} to the daily app goal`}
        </p>
        <p className="push" data-testid="earned-banner">
          {showMoney ? `Team has earned ${formatMoney(totals.est)} this week. ` : "Team 7 production. "}
          {profile.pushLine}
        </p>
      </div>

      <p className="hint">Click a day cell to log an app. Click CX to log a close. Shift-click to subtract.</p>

      {profile.allowAddedReps && (
        <form className="add-rep" onSubmit={submitRep}>
          <label htmlFor="rep-name">Rep name</label>
          <input
            id="rep-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a rep"
            autoComplete="off"
          />
          <button type="submit">Add rep</button>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
        </form>
      )}

      <div className="table-scroll">
        <table className="sheet">
          <caption>{profile.caption}</caption>
          <thead>
            <tr>
              <th className="sticky-rank">#</th>
              <th className="sticky-rep">Rep</th>
              <th>Week</th>
              <th>Last</th>
              <th>Prev</th>
              <th>3-wk</th>
              {profile.days.map((day) => (
                <th key={day.key} className={day.today ? "today" : undefined}>
                  <span className="day-name">{day.short}</span>
                  <span className="day-date">{day.date}</span>
                  {day.note && <span className="day-note">{day.note}</span>}
                </th>
              ))}
              <th>CX</th>
              <th>CX %</th>
              <th>WoW</th>
              {showMoney && <th>Est. $</th>}
            </tr>
          </thead>
          <tbody>
            {ranked.length === 0 && (
              <tr>
                <td className="empty" colSpan={columnCount}>
                  No reps yet. Add one to start the live log.
                </td>
              </tr>
            )}
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
                    {profile.allowAddedReps && (
                      <button type="button" className="remove-rep" onClick={() => deleteRep(rep.id)}>
                        Remove
                      </button>
                    )}
                  </span>
                </th>
                <td className="strong" data-testid={`week-${rep.id}`}>
                  {formatApps(rep.week)}
                </td>
                <td>{formatApps(rep.lastWeek)}</td>
                <td>{formatApps(rep.prevWeek)}</td>
                <td data-testid={`avg-${rep.id}`}>{formatAvg(rep.avg)}</td>
                {profile.days.map((day, dayIndex) => {
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
                {showMoney && (
                  <td className="est" data-testid={`est-${rep.id}`}>
                    {formatMoney(rep.est)}
                  </td>
                )}
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
                <td key={profile.days[index].key} className={profile.days[index].today ? "today" : undefined}>
                  {formatApps(value)}
                </td>
              ))}
              <td>{totals.cx}</td>
              <td>{formatPct(totals.cxPct)}</td>
              <td className={`wow wow-${totals.wow.kind}`}>{totals.wow.label}</td>
              {showMoney && (
                <td className="est" title="Rounded from week apps × $97.50">
                  {formatMoney(totals.est)}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {ranked.length > 0 && (
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
      )}

      <section className="notes" aria-labelledby="notes-title">
        <h2 id="notes-title">Notes</h2>
        <ul>
          {profile.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <button type="button" className="reset" onClick={resetBoard}>
          {profile.resetLabel}
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
