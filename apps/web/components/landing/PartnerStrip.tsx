import { PARTNERS } from "./data";

export function PartnerStrip() {
  return (
    <section className="border-y border-border py-8">
      <p className="mb-4 text-center text-xs uppercase tracking-[0.1em] text-muted">Built with</p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 font-mono text-sm text-muted">
        {PARTNERS.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
    </section>
  );
}
