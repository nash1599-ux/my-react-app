import { formatMoney } from "./data/board";

function medalOrRank(rank) {
  return { 1: "🥇", 2: "🥈", 3: "🥉" }[rank] || `${rank}`;
}

export default function LeaderboardPoster({ board }) {

  const weekly = board.weeklyGoal;
  const podium = board.reps.slice(0, 3);
  const rest = board.reps.slice(3);

  return (
    <div className="poster" aria-label="G-Unit leaderboard poster">
      <div className="poster-frame">
        <p className="poster-kicker">🪖 🫡 💰 🔥 📊</p>
        <h1>G-UNIT</h1>
        <p className="poster-sub">
          {board.day?.toUpperCase()} · {board.weekLabel} · DG {board.dgNum}/{board.dgDen}
        </p>
        <div className="poster-stats">
          <article>
            <span>Apps</span>
            <strong>{board.totals.apps}</strong>
          </article>
          <article>
            <span>CX</span>
            <strong>{board.totals.cx}</strong>
          </article>
          <article>
            <span>NL left</span>
            <strong>{weekly.nlLeft}</strong>
          </article>
          <article>
            <span>Daily goal</span>
            <strong>
              {board.dgNum}/{board.dgDen}
            </strong>
          </article>
        </div>
        <ol className="poster-podium">
          {podium.map((rep) => (
            <li key={rep.name} className={`place place-${rep.rank}`}>
              <span>{medalOrRank(rep.rank)}</span>
              <div>
                <strong>{rep.displayName}</strong>
                <em>
                  {rep.apps} Apps · {rep.cx} CX · {formatMoney(rep.earned)}
                </em>
              </div>
            </li>
          ))}
        </ol>
        <ol className="poster-rest">
          {rest.map((rep) => (
            <li key={rep.name}>
              <span>{rep.rank}</span>
              <strong>{rep.displayName}</strong>
              <em>
                {rep.apps} | {rep.cx}
              </em>
            </li>
          ))}
        </ol>
        <p className="poster-cycle">SALE → CPR → SALE → CPR · TAKE CONTROL</p>
      </div>
    </div>
  );
}
