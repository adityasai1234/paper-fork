export function ForkSignal() {
  return (
    <figure className="fork-signal" aria-labelledby="fork-signal-caption">
      <div className="fork-signal-header">
        <span>Live evidence comparison</span>
        <span className="status-label status-label-warning">Fork detected</span>
      </div>
      <div className="fork-signal-grid">
        <div className="fork-evidence fork-evidence-paper">
          <span className="fork-source">Paper claim</span>
          <strong>“We report 5-fold cross-validation.”</strong>
          <code>Methods §4.1</code>
        </div>
        <div className="fork-axis" aria-hidden="true">
          <span>≠</span>
        </div>
        <div className="fork-evidence fork-evidence-repo">
          <span className="fork-source">Repository behavior</span>
          <strong>One fixed holdout split is executed.</strong>
          <code>train.py:118</code>
        </div>
      </div>
      <figcaption id="fork-signal-caption">
        Every verdict links the claim, code path, and suggested fix.
      </figcaption>
    </figure>
  );
}
