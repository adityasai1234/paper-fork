type LedgerItem = {
  claim: string;
  paperSource: string;
  repoEvidence?: string;
  verdict: string;
  suggestedFix?: string;
  effort?: string;
  section?: string;
  dimension?: string;
};

export function ForkLedger({ items }: { items: LedgerItem[] }) {
  return (
    <div className="card">
      <h2>Fork ledger</h2>
      <div className="data-table-scroll">
        <table>
          <caption className="sr-only">Paper claims compared with repository evidence</caption>
          <thead>
            <tr>
              <th scope="col">Claim</th>
              <th scope="col">Section</th>
              <th scope="col">Dimension</th>
              <th scope="col">Verdict</th>
              <th scope="col">Evidence</th>
              <th scope="col">Fix</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.claim}</td>
                <td>{item.section ?? item.paperSource}</td>
                <td>{item.dimension ?? "-"}</td>
                <td className={`verdict-${item.verdict}`}>{item.verdict}</td>
                <td>{item.repoEvidence ?? item.paperSource}</td>
                <td>{item.suggestedFix ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
