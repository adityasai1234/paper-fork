import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { WaitlistForm } from "@/components/WaitlistForm";
import { routes } from "@/lib/routes";

export const metadata = {
  title: "Join the waitlist",
  description: "Get notified when Paperfork accounts open up.",
};

export default function SignupPage() {
  return (
    <MarketingShell centered>
      <div className="auth-panel">
        <div className="auth-heading">
          <p className="section-kicker">Waitlist</p>
          <h1>Get early access</h1>
          <p>
            We&apos;ll email you when full accounts launch. Sign in today to run audits.
          </p>
        </div>
        <WaitlistForm />
        <p className="auth-switch">
          <Link href={routes.login()}>
            Sign in to run an audit <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
