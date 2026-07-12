type CheckItem = {
  item: string;
  status: "red" | "amber" | "green";
  evidence: string;
};

export function Checklist({ items }: { items: CheckItem[] }) {
  return (
    <div className="card">
      <h2>Checklist</h2>
      <ul style={{ marginTop: "0.75rem", listStyle: "none" }}>
        {items.map((item) => (
          <li key={item.item} className={`check-${item.status}`} style={{ marginBottom: "0.5rem" }}>
            [{item.status.toUpperCase()}] {item.item}: {item.evidence}
          </li>
        ))}
      </ul>
    </div>
  );
}
