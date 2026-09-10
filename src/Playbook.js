import {
  ADVICE,
  CODE_OF_ETHICS,
  FIELD_STEPS,
  LAP_SYSTEM,
  LAW_OF_AVERAGES,
  QUOTES,
  SALE_CYCLE,
  SEE_FACTORS,
  adviceForDate,
  quoteForDate,
  slackCulturePost,
  slackNewStartPost,
} from "./data/playbook";
import { formatWeatherLine, THURSDAY_FIELD_SNAPSHOT } from "./data/weather";

function copy(text) {
  return navigator.clipboard.writeText(text);
}

export default function Playbook() {
  const quote = quoteForDate();
  const advice = adviceForDate();

  return (
    <div className="playbook">
      <header className="board-hero">
        <div className="eyebrow">🪖 New starts · pour in</div>
        <h1>G-Unit codes, ethics, and steps</h1>
        <p className="hero-sub">
          Culture first. Numbers follow. Copy this until it is muscle memory.
        </p>
      </header>

      <section className="quote-card" aria-label="Quote of the day">
        <p className="eyebrow">Quote + entrepreneurial shot</p>
        <blockquote>
          “{quote.text}”
          <cite>— {quote.by}</cite>
        </blockquote>
        <p className="advice">{advice}</p>
        <div className="updater-actions">
          <button
            type="button"
            onClick={() =>
              copy(
                slackCulturePost({
                  weatherLine: formatWeatherLine(THURSDAY_FIELD_SNAPSHOT),
                  quote,
                  advice,
                })
              )
            }
          >
            Copy morning Slack post
          </button>
          <button type="button" className="ghost" onClick={() => copy(slackNewStartPost())}>
            Copy new-start playbook
          </button>
        </div>
      </section>

      <section className="culture-grid" aria-label="9 Steps for Success">
        <div className="section-head">
          <h2>9 Steps for Success</h2>
          <p>The field 8, plus the one that separates killers from quitters.</p>
        </div>
        <ol className="step-list">
          {FIELD_STEPS.map((step) => (
            <li key={step.n}>
              <strong>
                {step.n}. {step.title}
              </strong>
              <span>{step.note}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="culture-grid" aria-label="Code of Ethics">
        <div className="section-head">
          <h2>C.O.E · Code of Ethics</h2>
          <p>Be the example. New starts watch everything.</p>
        </div>
        <div className="coe-grid">
          {CODE_OF_ETHICS.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="culture-grid" aria-label="Lap system">
        <div className="section-head">
          <h2>Lap System</h2>
          <p>Work the clock. Work the houses that can buy today.</p>
        </div>
        <div className="lap-row">
          {LAP_SYSTEM.laps.map((lap) => (
            <article key={lap.name} className={lap.name === "Money Lap" ? "money-lap" : undefined}>
              <p>{lap.code}</p>
              <strong>{lap.name}</strong>
              <span>{lap.window}</span>
            </article>
          ))}
        </div>
        <div className="lap-lists">
          <div>
            <h3>Looking for</h3>
            <ul>
              {LAP_SYSTEM.lookingFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Not looking for</h3>
            <ul>
              {LAP_SYSTEM.notLookingFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Hints</h3>
            <ul>
              {LAP_SYSTEM.hints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="stat-grid see-grid" aria-label="SEE factors">
        {SEE_FACTORS.map((item) => (
          <article key={item.title}>
            <p>{item.letter}</p>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </article>
        ))}
      </section>

      <section className="notes" aria-label="LOA and sale cycle">
        <h2>{LAW_OF_AVERAGES.title}</h2>
        <p>{LAW_OF_AVERAGES.summary}</p>
        <p>{LAW_OF_AVERAGES.field}</p>
        <h2>Sale cycle</h2>
        <p>{SALE_CYCLE}</p>
      </section>

      <section className="notes" aria-label="More quotes and advice">
        <h2>Bank of quotes</h2>
        <ul>
          {QUOTES.map((item) => (
            <li key={item.text}>
              “{item.text}” — {item.by}
            </li>
          ))}
        </ul>
        <h2>Entrepreneurial advice</h2>
        <ul>
          {ADVICE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
