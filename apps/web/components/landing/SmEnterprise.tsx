import { ENTERPRISE, GITHUB_REPO } from "./data";

export function SmEnterprise() {
  return (
    <section className="sm-enterprise">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉ENTERPRISE</span>
          <span>[7/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">Paperfork runs everywhere.</h2>
        <p className="sm-section-subtitle sm-section-subtitle--light">
          On-prem, in your cloud, or fully air-gapped — same workers, same report format, and a
          paper trail your security team will actually read.
        </p>

        <div className="sm-enterprise-grid">
          {ENTERPRISE.map((card) => (
            <article key={card.title} className="sm-enterprise-card">
              {"badge" in card && card.badge ? (
                <span className="sm-enterprise-badge">{card.badge}</span>
              ) : null}
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <p className="sm-enterprise-link">
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            View our security page →
          </a>
        </p>
      </div>
    </section>
  );
}
