type Repro = {
  install?: string;
  train?: string;
  eval?: string;
  seeds?: string;
  dataPath?: string;
  hardware?: string;
  checkpoints?: string;
};

export function ReproAppendix({ repro }: { repro: Repro }) {
  return (
    <div className="card">
      <h2>Reproduction appendix</h2>
      <ul className="repro-list">
        {Object.entries(repro).map(([k, v]) =>
          v ? (
            <li key={k}>
              <strong>{k}:</strong> {v}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
