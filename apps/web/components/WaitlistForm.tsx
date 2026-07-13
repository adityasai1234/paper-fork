"use client";

import { useMutation } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@convex/_generated/api";

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
      <div className="marketing-card waitlist-success">
        <p>
          You&apos;re on the list. We&apos;ll be in touch at{" "}
          <strong>{submittedEmail}</strong>.
        </p>
        <Link href="/login">Run an audit</Link>
      </div>
    );
  }

  return (
    <form className="marketing-card" onSubmit={onSubmit} noValidate>
      <label htmlFor="waitlist-email">Email address</label>
      <input
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
      />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={loading}>
        {loading ? "Joining…" : "Join waitlist"}
      </button>
    </form>
  );
}
