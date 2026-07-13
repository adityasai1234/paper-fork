import { SiteNav } from "@/components/SiteNav";

export function MarketingShell({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div className="min-h-screen bg-ink font-body text-white">
      <SiteNav />
      <main className={centered ? "mx-auto max-w-lg px-6 py-12" : undefined}>
        {children}
      </main>
    </div>
  );
}
