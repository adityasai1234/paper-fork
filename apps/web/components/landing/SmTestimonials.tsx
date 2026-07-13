import { TESTIMONIALS } from "./data";

export function SmTestimonials() {
  return (
    <section className="sm-testimonials">
      <div className="sm-container">
        <div className="sm-section-meta sm-section-meta--light">
          <span>〉TESTIMONIALS</span>
          <span>[7/9]</span>
        </div>
        <h2 className="sm-section-title sm-section-title--light">Testimonials</h2>

        <div className="sm-testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <article key={t.author} className="sm-testimonial-card">
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <p className="sm-testimonial-meta">
                / {t.author}, {t.company}
              </p>
              <p className="sm-testimonial-stat">{t.stat}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
