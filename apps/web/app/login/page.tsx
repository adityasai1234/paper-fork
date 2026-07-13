"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ForkMotif } from "@/components/art/ForkMotif";
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
      <div className="relative">
        <ForkMotif className="absolute -left-8 -top-4 h-28 w-20 opacity-40" />
        <div className="mb-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
            Demo access
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-[-0.02em]">
            Sign in to Paperfork
          </h1>
          <p className="mt-3 text-sm text-muted">
            Leave fields blank to use the default demo account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl font-normal">Continue</CardTitle>
            <CardDescription>Run audits and research from your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm text-muted">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={DEFAULT_EMAIL}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm text-muted">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Continue"}
              </Button>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href={routes.signup()} className="text-signal hover:underline">
            Join the waitlist
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
