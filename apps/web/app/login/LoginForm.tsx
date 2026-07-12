"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const DEMO_COOKIE = "paperfork_demo=1; path=/; max-age=604800; SameSite=Lax";
const FALLBACK_EMAIL = "demo@paperfork.dev";
const FALLBACK_PASSWORD = "demopass8";

export default function LoginForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = email.trim() || FALLBACK_EMAIL;
    const loginPassword = password || FALLBACK_PASSWORD;

    try {
      // ponytail: demo gate — cookie is cosmetic; Convex Auth handles real session
      document.cookie = DEMO_COOKIE;
      try {
        await signIn("password", {
          email: loginEmail,
          password: loginPassword,
          flow: "signIn",
        });
      } catch {
        await signIn("password", {
          email: loginEmail,
          password: loginPassword,
          flow: "signUp",
        });
      }
      router.push(next.startsWith("/") ? next : "/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 font-body text-white">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-signal">Account</p>
          <CardTitle className="font-display text-3xl font-normal">Sign in to run audits</CardTitle>
          <CardDescription>
            Demo mode — use any email and password, or leave blank to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-muted">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lab.edu"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-muted">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Continuing..." : "Continue"}
            </Button>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/signup" className="text-signal hover:underline">
              Join waitlist
            </Link>
            {" · "}
            <Link href="/" className="text-signal hover:underline">
              Back home
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
