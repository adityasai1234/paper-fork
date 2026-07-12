import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function SignupPage() {
  return (
    <main className="marketing signup-page">
      <header className="marketing-topbar">
        <Link href="/">← Back</Link>
        <span>Paperfork</span>
      </header>

      <section className="hero" aria-labelledby="signup-title">
        <p className="marketing-eyebrow">#02 · Waitlist</p>
        <h1 id="signup-title" className="hero-title">
          Get early access
        </h1>
        <p className="hero-subtitle">
          Join the waitlist for Paperfork audits. We&apos;ll email you when accounts
          open.
        </p>
      </section>

      <WaitlistForm />

      <p className="signup-alt">
        Already have access? <Link href="/">Run an audit →</Link>
      </p>
    </main>
  );
}
