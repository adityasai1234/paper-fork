"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { routes } from "@/lib/routes";

const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "admin@gmail.com";
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "pass1234";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const resolvedEmail = email.trim() || DEFAULT_EMAIL;
    const resolvedPassword = password || DEFAULT_PASSWORD;

    try {
      await signIn("password", {
        email: resolvedEmail,
        password: resolvedPassword,
        flow: "signIn",
      });
      router.push(routes.audits());
    } catch {
      try {
        await signIn("password", {
          email: resolvedEmail,
          password: resolvedPassword,
          flow: "signUp",
        });
        router.push(routes.audits());
      } catch (signUpErr) {
        setError(
          signUpErr instanceof Error ? signUpErr.message : "Sign-in failed"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="marketing min-h-screen">
      <header className="marketing-topbar">
        <Link href="/">Paperfork</Link>
      </header>

      <section className="hero" aria-labelledby="login-title">
        <p className="marketing-eyebrow">Demo access</p>
        <h1 id="login-title" className="hero-title">
          Sign in to Paperfork
        </h1>
        <p className="hero-subtitle">
          Use the demo credentials or leave fields blank to sign in with the default demo account.
        </p>
      </section>

      <form className="marketing-card hero-form" onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={DEFAULT_EMAIL}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error ? <p className="form-status-error">{error}</p> : null}
      </form>

      <p className="hero-spec">
        <Link href={routes.signup()}>Join the waitlist</Link>
      </p>
    </main>
  );
}
