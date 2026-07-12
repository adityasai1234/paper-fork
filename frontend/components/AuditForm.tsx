"use client";

import { useState } from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function AuditForm() {
  const [paperId, setPaperId] = useState("");
  const [paperIdType, setPaperIdType] = useState<"arxiv" | "doi">("arxiv");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${APP_URL}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId, paperIdType, githubUrl }),
      });
      const data = (await res.json()) as {
        auditId?: string;
        sessionId?: string;
        error?: string;
      };
      if (!res.ok || !data.auditId || !data.sessionId) {
        throw new Error(data.error ?? "Failed to start audit");
      }
      try {
        localStorage.setItem(
          "paperfork:activeSession",
          JSON.stringify({ auditId: data.auditId, sessionId: data.sessionId })
        );
      } catch {
        // ignore storage errors
      }
      window.location.href = `${APP_URL}/audit/${data.auditId}?session=${data.sessionId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start audit");
    } finally {
      setLoading(false);
    }
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
      {error ? <p className="form-status-error">{error}</p> : null}
    </form>
  );
}
