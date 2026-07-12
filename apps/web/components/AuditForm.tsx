"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { persistActiveSession } from "@/components/ResumeAuditBanner";

export function AuditForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const createAudit = useMutation(api.audits.createAudit);
  const [paperId, setPaperId] = useState("");
  const [paperIdType, setPaperIdType] = useState<"arxiv" | "doi">("arxiv");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createAudit({ paperId, paperIdType, githubUrl });
      persistActiveSession(result.auditId, result.sessionId);
      router.push(`/app/audit/${result.auditId}?session=${result.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start audit");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return <p>Checking sign-in...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="marketing-card hero-form">
        <p>Sign in to start an audit. Your reports stay private to your account.</p>
        <Link href="/login">Sign in or create account</Link>
      </div>
    );
  }

  return (
    <form className="marketing-card hero-form" onSubmit={onSubmit}>
      <label htmlFor="paperId">Paper ID (arXiv or DOI)</label>
      <input
        id="paperId"
        value={paperId}
        onChange={(e) => setPaperId(e.target.value)}
        placeholder="2401.12345"
        required
        autoFocus
      />
      <label htmlFor="paperIdType">ID type</label>
      <select
        id="paperIdType"
        value={paperIdType}
        onChange={(e) => setPaperIdType(e.target.value as "arxiv" | "doi")}
      >
        <option value="arxiv">arXiv</option>
        <option value="doi">DOI</option>
      </select>
      <label htmlFor="githubUrl">GitHub repository URL</label>
      <input
        id="githubUrl"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        placeholder="https://github.com/owner/repo"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Starting audit..." : "Find the fork"}
      </button>
      {error && (
        <p style={{ color: "#f66", marginTop: "0.75rem", fontSize: "0.9rem" }}>
          {error}
        </p>
      )}
    </form>
  );
}
