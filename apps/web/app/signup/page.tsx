import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata = {
  title: "Join waitlist — Paperfork",
  description: "Get notified when Paperfork accounts open up.",
};

export default function SignupPage() {
  return (
    <main className="marketing min-h-screen">
      <header className="marketing-topbar">
        <Link href="/">Paperfork</Link>
      </header>

      <section className="hero" aria-labelledby="signup-title">
        <p className="marketing-eyebrow">Early access</p>
        <h1 id="signup-title" className="hero-title">
          Join the waitlist
        </h1>
        <p className="hero-subtitle">
          We&apos;ll email you when full accounts and team features launch. You can run audits and
          research today without signing up.
        </p>
      </section>

      <WaitlistForm />

      <p className="hero-spec">
        <Link href="/app/audit">Run an audit now →</Link>
      </p>
    </main>
  );
}
