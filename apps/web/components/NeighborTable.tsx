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
      <div className="data-table-scroll">
        <table>
          <caption className="sr-only">Related papers and Semantic Scholar identifiers</caption>
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Year</th>
              <th scope="col">S2 ID</th>
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
    </div>
  );
}
