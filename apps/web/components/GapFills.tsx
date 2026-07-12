type GapFill = {
  type: string;
  content: string;
  evidence: string;
};

export function GapFills({ items }: { items: GapFill[] }) {
  return (
    <div className="card">
      <h2>Gap fills</h2>
      {items.map((g, i) => (
        <div key={i} style={{ marginTop: "1rem" }}>
          <strong>{g.type}</strong>
          <p style={{ color: "#999", fontSize: "0.875rem" }}>{g.evidence}</p>
          <pre>{g.content}</pre>
        </div>
      ))}
    </div>
  );
}
