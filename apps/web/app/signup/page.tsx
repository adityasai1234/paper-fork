import Link from "next/link";
import { ForkMotif } from "@/components/art/ForkMotif";
import { MarketingShell } from "@/components/MarketingShell";
import { WaitlistForm } from "@/components/WaitlistForm";
import { routes } from "@/lib/routes";

export const metadata = {
  title: "Join waitlist — Paperfork",
  description: "Get notified when Paperfork accounts open up.",
};

export default function SignupPage() {
  return (
    <MarketingShell centered>
      <div className="relative">
        <ForkMotif className="absolute -right-6 -top-4 h-28 w-20 opacity-40" />
        <div className="mb-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
            #02 · Waitlist
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.02em]">Get early access</h1>
          <p className="mt-3 text-sm text-muted">
            We&apos;ll email you when full accounts launch. Sign in today to run audits.
          </p>
        </div>
        <WaitlistForm />
        <p className="mt-6 text-center text-sm text-muted">
          <Link href={routes.login()} className="text-signal hover:underline">
            Sign in to run an audit →
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
