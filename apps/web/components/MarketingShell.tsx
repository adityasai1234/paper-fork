import { MarketingNav } from "@/components/landing/MarketingNav";

export function MarketingShell({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div className="marketing-shell">
      <MarketingNav />
      <main
        id="main-content"
        className={centered ? "auth-main" : "marketing-main"}
      >
        {children}
      </main>
    </div>
  );
}
