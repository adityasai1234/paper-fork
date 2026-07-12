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
    return <p className="loading-state">Checking sign-in…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="card audit-form">
        <p>Sign in to start an audit. Your reports stay private to your account.</p>
        <Link className="button-link" href="/login">Sign in or create account</Link>
      </div>
    );
  }

  return (
    <form className="card audit-form" onSubmit={onSubmit}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="paperId">Research paper</label>
          <input
            id="paperId"
            value={paperId}
            onChange={(e) => setPaperId(e.target.value)}
            placeholder="1706.03762"
            autoComplete="off"
            required
          />
          <span className="field-hint">Canonical arXiv identifier or DOI</span>
        </div>
        <div className="field">
          <label htmlFor="paperIdType">Registry</label>
          <select
            id="paperIdType"
            value={paperIdType}
            onChange={(e) => setPaperIdType(e.target.value as "arxiv" | "doi")}
          >
            <option value="arxiv">arXiv</option>
            <option value="doi">DOI</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="githubUrl">Implementation repository</label>
        <input
          id="githubUrl"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          inputMode="url"
          required
        />
        <span className="field-hint">Public GitHub repository associated with the paper</span>
      </div>
      <div className="form-action">
        <p className="form-action-copy">Literature, repository, and web workers run in parallel.</p>
        <button type="submit" disabled={loading}>
          {loading ? "Opening audit…" : "Run evidence audit →"}
        </button>
      </div>
      {error && <p className="form-status-error">{error}</p>}
    </form>
  );
}
