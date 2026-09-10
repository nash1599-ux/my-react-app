import { useState } from "react";
import { loadStoredBoard } from "./data/board";
import { slackHypePost } from "./data/playbook";
import LeaderboardPoster from "./LeaderboardPoster";
import Playbook from "./Playbook";
import Salesboard from "./Salesboard";
import WeatherBar from "./WeatherBar";
import WeeklyTracker from "./WeeklyTracker";
import "./GUnitShell.css";

const TABS = [
  ["board", "Leaderboard"],
  ["poster", "Poster"],
  ["culture", "Culture"],
  ["tracker", "Weekly tracker"],
];

export default function GUnitShell() {
  const [tab, setTab] = useState("board");
  const board = loadStoredBoard();

  return (
    <div className="gunit-shell">
      <nav className="gunit-nav" aria-label="G-Unit">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "active" : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="ghost"
          onClick={() => navigator.clipboard.writeText(slackHypePost(board))}
        >
          Copy hype post
        </button>
      </nav>
      <WeatherBar />
      {tab === "board" && <Salesboard />}
      {tab === "poster" && (
        <div className="board">
          <LeaderboardPoster board={board} />
        </div>
      )}
      {tab === "culture" && (
        <div className="board">
          <Playbook />
        </div>
      )}
      {tab === "tracker" && (
        <div className="board">
          <WeeklyTracker />
        </div>
      )}
    </div>
  );
}
