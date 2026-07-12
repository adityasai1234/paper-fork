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
      <table style={{ marginTop: "0.75rem" }}>
        <thead>
          <tr>
            <th>Claim</th>
            <th>Section</th>
            <th>Dimension</th>
            <th>Verdict</th>
            <th>Evidence</th>
            <th>Fix</th>
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
  );
}
