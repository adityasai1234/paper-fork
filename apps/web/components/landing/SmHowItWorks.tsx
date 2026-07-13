import { BENCHMARKS, ENTERPRISE, HOW_IT_WORKS, USE_CASES } from "./data";

export function SmHowItWorks() {
  return (
    <section id="how" className="sm-how">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉HOW IT WORKS</span>
          <span>[4/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">How it works.</h2>
        <p className="sm-section-subtitle sm-section-subtitle--light">
          Four primitives, one graph. Ingest, understand, retrieve — then a fifth step that makes
          the audit worth running.
        </p>

        <ol className="sm-how-list">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.id} className="sm-how-item">
              <span className="sm-how-id">{step.id}</span>
              <div>
                <h3 className="sm-how-title">{step.title}</h3>
                <p className="sm-how-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SmBenchmarks() {
  return (
    <section className="sm-benchmarks">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉BENCHMARKS</span>
          <span>[5/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">{BENCHMARKS.headline}</h2>
        <p className="sm-section-subtitle sm-section-subtitle--light">{BENCHMARKS.subhead}</p>

        <div className="sm-benchmarks-grid">
          {BENCHMARKS.cards.map((card) => (
            <article key={card.title} className="sm-benchmark-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
