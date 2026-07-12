import { PARTNERS } from "./data";

export function PartnerStrip() {
  return (
    <section className="border-b border-white/10 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Built with
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="border-t border-white/10 pt-5 text-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-left sm:first:border-l-0"
            >
              <p className="font-display text-xl uppercase tracking-[-0.01em]">{partner.name}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                {partner.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
