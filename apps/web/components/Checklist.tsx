type CheckItem = {
  item: string;
  status: "red" | "amber" | "green";
  evidence: string;
};

export function Checklist({ items }: { items: CheckItem[] }) {
  return (
    <div className="card">
      <h2>Checklist</h2>
      <ul className="checklist-list">
        {items.map((item) => (
          <li key={item.item} className={`check-${item.status}`}>
            [{item.status.toUpperCase()}] {item.item}: {item.evidence}
          </li>
        ))}
      </ul>
    </div>
  );
}
