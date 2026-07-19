"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      router.push(routes.research());
    } catch {
      try {
        await signIn("password", {
          email: resolvedEmail,
          password: resolvedPassword,
          flow: "signUp",
        });
        router.push(routes.research());
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
    <MarketingShell centered>
      <div className="auth-panel">
        <div className="auth-heading">
          <p className="section-kicker">Demo workspace</p>
          <h1>Sign in to Paperfork</h1>
          <p>
            Leave fields blank to use the default demo account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Continue</CardTitle>
            <CardDescription>Run audits and research from your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <label htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DEFAULT_EMAIL}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Continue"}
              </Button>
              {error ? <p className="form-error" role="alert" id="login-error">{error}</p> : null}
            </form>
          </CardContent>
        </Card>

        <p className="auth-switch">
          <Link href={routes.signup()}>
            Join the waitlist
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
