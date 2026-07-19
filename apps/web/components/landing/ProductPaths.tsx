import Link from "next/link";
import { PRODUCT_PATHS } from "./data";

export function ProductPaths() {
  return (
    <section className="landing-section" id="product" aria-labelledby="product-title">
      <div className="marketing-container">
        <div className="section-heading">
          <p className="section-kicker">Two evidence workflows</p>
          <h2 id="product-title">Inspect what exists. Measure what comes next.</h2>
          <p>
            Use the audit when a paper and repository already exist. Use the research loop when
            you want the next experiment to earn its place.
          </p>
        </div>
        <div className="product-paths-grid">
          {PRODUCT_PATHS.map((path) => (
            <article className="product-path-card" key={path.label}>
              <p className="product-path-label">{path.label}</p>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
              <dl className="product-path-output">
                <dt>Output</dt>
                <dd>{path.output}</dd>
              </dl>
              <Link href={path.href}>{path.cta} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
