export function EvidenceLedgerSection() {
  return (
    <section className="landing-section" id="evidence" aria-labelledby="evidence-title">
      <div className="marketing-container evidence-layout">
        <div className="section-heading evidence-heading">
          <p className="section-kicker">Inspectability by default</p>
          <h2 id="evidence-title">A verdict is only useful when you can challenge it.</h2>
          <p>
            Reports preserve the exact claim, repository evidence, status, and next action—plus
            source URLs and immutable commit references for research runs.
          </p>
        </div>
        <div className="evidence-ledger" role="region" aria-label="Example fork ledger">
          <div className="evidence-ledger-row evidence-ledger-header" aria-hidden="true">
            <span>Dimension</span>
            <span>Evidence</span>
            <span>Verdict</span>
          </div>
          <div className="evidence-ledger-row">
            <strong>Evaluation split</strong>
            <span>Paper: 5-fold CV · Repo: fixed holdout</span>
            <span className="status-label status-label-danger">Forked</span>
          </div>
          <div className="evidence-ledger-row">
            <strong>Primary metric</strong>
            <span>Macro F1 in paper and evaluation script</span>
            <span className="status-label status-label-success">Aligned</span>
          </div>
          <div className="evidence-ledger-row">
            <strong>Random seeds</strong>
            <span>Multiple seeds claimed; one seed found</span>
            <span className="status-label status-label-warning">Review</span>
          </div>
        </div>
      </div>
    </section>
  );
}
