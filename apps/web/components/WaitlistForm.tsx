"use client";

import { useState } from "react";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    // ponytail: UI-only v1 — upgrade path = Convex waitlist mutation or Resend/Formspree
    setSubmittedEmail(trimmed);
  }

  if (submittedEmail) {
    return (
      <div className="marketing-card waitlist-success">
        <p>
          You&apos;re on the list. We&apos;ll be in touch at{" "}
          <strong>{submittedEmail}</strong>.
        </p>
        <Link href="/">Run an audit</Link>
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
      />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit">Join waitlist</button>
    </form>
  );
}
