import { LOGO_MARQUEE } from "./data";

export function SmLogoMarquee() {
  const items = [...LOGO_MARQUEE, ...LOGO_MARQUEE];

  return (
    <section className="sm-marquee-section">
      <p className="sm-marquee-label">Used by the best teams</p>
      <div className="sm-marquee-track-wrap">
        <div className="sm-marquee-track">
          {items.map((name, i) => (
            <span key={`${name}-${i}`} className="sm-marquee-item">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
