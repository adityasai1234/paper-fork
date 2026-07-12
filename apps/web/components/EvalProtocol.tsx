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
            <dt style={{ color: "#999" }}>Splits</dt>
            <dd>{protocol.splits}</dd>
          </>
        )}
        {protocol.seeds && (
          <>
            <dt style={{ color: "#999" }}>Seeds</dt>
            <dd>{protocol.seeds}</dd>
          </>
        )}
        {protocol.metrics.length > 0 && (
          <>
            <dt style={{ color: "#999" }}>Metrics</dt>
            <dd>{protocol.metrics.join(", ")}</dd>
          </>
        )}
        {protocol.baselines.length > 0 && (
          <>
            <dt style={{ color: "#999" }}>Baselines</dt>
            <dd>{protocol.baselines.join(", ")}</dd>
          </>
        )}
        {protocol.datasets.length > 0 && (
          <>
            <dt style={{ color: "#999" }}>Datasets</dt>
            <dd>{protocol.datasets.join(", ")}</dd>
          </>
        )}
        {protocol.hardware && (
          <>
            <dt style={{ color: "#999" }}>Hardware</dt>
            <dd>{protocol.hardware}</dd>
          </>
        )}
        {protocol.checkpointPolicy && (
          <>
            <dt style={{ color: "#999" }}>Checkpoints</dt>
            <dd>{protocol.checkpointPolicy}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
