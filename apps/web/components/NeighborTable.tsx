type Neighbor = {
  s2Id: string;
  title: string;
  year?: number;
  metric?: string;
  value?: string;
};

export function NeighborTable({ neighbors }: { neighbors: Neighbor[] }) {
  return (
    <div className="card">
      <h2>Neighbors</h2>
      <table style={{ marginTop: "0.75rem" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>S2 ID</th>
          </tr>
        </thead>
        <tbody>
          {neighbors.map((n) => (
            <tr key={n.s2Id}>
              <td>{n.title}</td>
              <td>{n.year ?? "-"}</td>
              <td>{n.s2Id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
