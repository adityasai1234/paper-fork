type ChipStatus = "pending" | "running" | "done" | "error";

export function AgentChips({
  chips,
}: {
  chips: { literature: ChipStatus; repo: ChipStatus; web: ChipStatus };
}) {
  const items = [
    { label: "Literature", status: chips.literature },
    { label: "Repo", status: chips.repo },
    { label: "Web", status: chips.web },
  ];

  return (
    <div className="card">
      <h2>Agents</h2>
      <div style={{ marginTop: "0.75rem" }}>
        {items.map((item) => (
          <span key={item.label} className={`chip ${item.status}`}>
            {item.label}: {item.status}
          </span>
        ))}
      </div>
    </div>
  );
}
