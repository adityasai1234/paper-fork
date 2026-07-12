"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/demo-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Invalid demo password");
        return;
      }

      router.push(next.startsWith("/") ? next : "/app");
      router.refresh();
    } catch {
      setError("Could not verify password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <p className="eyebrow">PaperFork demo</p>
        <h1>Enter demo password</h1>
        <p className="login-copy">
          Use the shared demo password to open the audit workspace.
        </p>

        <form onSubmit={onSubmit} className="login-form">
          <label>
            Demo password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ask your host for the password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Checking…" : "Continue to app →"}
          </button>
        </form>

        <p className="login-footer">
          <Link href="/">← Back to landing</Link>
        </p>
      </div>
    </main>
  );
}
