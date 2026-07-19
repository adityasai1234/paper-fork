"use client";

import { useMutation } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const joinWaitlist = useMutation(api.waitlist.join);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await joinWaitlist({ email: trimmed });
      setSubmittedEmail(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join waitlist");
    } finally {
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re on the list</CardTitle>
          <CardDescription>
            We&apos;ll be in touch at <strong className="text-foreground">{submittedEmail}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/login">Run an audit</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join waitlist</CardTitle>
        <CardDescription>We&apos;ll email you when accounts open.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-2">
            <label htmlFor="waitlist-email">
              Email address
            </label>
            <Input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@lab.edu"
              autoComplete="email"
              autoFocus
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "waitlist-email-error" : undefined}
            />
          </div>
          {error ? (
            <p className="form-error" role="alert" id="waitlist-email-error">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Joining…" : "Join waitlist"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
