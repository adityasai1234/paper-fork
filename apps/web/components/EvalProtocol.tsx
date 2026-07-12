type EvalProtocolData = {
  splits?: string;
  seeds?: string;
  metrics: string[];
  baselines: string[];
  datasets: string[];
  hardware?: string;
  checkpointPolicy?: string;
  summary: string;
};

export function EvalProtocol({ protocol }: { protocol?: EvalProtocolData }) {
  if (!protocol) return null;

  return (
    <div className="card">
      <h2>How are you evaluating your model?</h2>
      <p style={{ marginTop: "0.75rem", lineHeight: 1.5 }}>{protocol.summary}</p>
      <dl style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
        {protocol.splits && (
          <>
            <dt className="field-label">Splits</dt>
            <dd>{protocol.splits}</dd>
          </>
        )}
        {protocol.seeds && (
          <>
            <dt className="field-label">Seeds</dt>
            <dd>{protocol.seeds}</dd>
          </>
        )}
        {protocol.metrics.length > 0 && (
          <>
            <dt className="field-label">Metrics</dt>
            <dd>{protocol.metrics.join(", ")}</dd>
          </>
        )}
        {protocol.baselines.length > 0 && (
          <>
            <dt className="field-label">Baselines</dt>
            <dd>{protocol.baselines.join(", ")}</dd>
          </>
        )}
        {protocol.datasets.length > 0 && (
          <>
            <dt className="field-label">Datasets</dt>
            <dd>{protocol.datasets.join(", ")}</dd>
          </>
        )}
        {protocol.hardware && (
          <>
            <dt className="field-label">Hardware</dt>
            <dd>{protocol.hardware}</dd>
          </>
        )}
        {protocol.checkpointPolicy && (
          <>
            <dt className="field-label">Checkpoints</dt>
            <dd>{protocol.checkpointPolicy}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
