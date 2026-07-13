import { SmNav } from "@/components/landing/SmNav";

export function MarketingShell({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div className="sm-landing min-h-screen">
      <SmNav />
      <main className={centered ? "mx-auto max-w-lg px-6 py-12" : undefined}>
        {children}
      </main>
    </div>
  );
}
