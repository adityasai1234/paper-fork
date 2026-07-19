import { RESEARCH_LOOP_STEPS } from "./data";

export function ResearchLoopSection() {
  return (
    <section className="research-loop-section" id="research-loop" aria-labelledby="research-loop-title">
      <div className="marketing-container research-loop-layout">
        <div className="research-loop-intro">
          <p className="section-kicker section-kicker-inverse">Cloud research loop</p>
          <h2 id="research-loop-title">Autoresearch with an evidence trail and a stop condition.</h2>
          <p>
            The search model proposes. The worker measures. The metric decides. Paperfork keeps
            the source, patch, runtime, hardware, and commit together.
          </p>
        </div>
        <ol className="research-loop-steps">
          {RESEARCH_LOOP_STEPS.map((step, index) => (
            <li key={step.label}>
              <span className="research-loop-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.label}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
