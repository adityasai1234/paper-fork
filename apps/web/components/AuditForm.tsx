"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@convex/_generated/api";
import { persistActiveSession } from "@/components/ResumeAuditBanner";
import { routes } from "@/lib/routes";

export function AuditForm() {
  const router = useRouter();
  const createAudit = useMutation(api.audits.createAudit);
  const startGithubOAuth = useMutation(api.github.startGithubOAuth);
  const disconnectGithub = useMutation(api.github.disconnectGithub);
  const githubConnection = useQuery(api.github.getGithubConnection);
  const [paperId, setPaperId] = useState("");
  const [paperIdType, setPaperIdType] = useState<"arxiv" | "doi">("arxiv");
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  async function onConnectGithub() {
    setGithubLoading(true);
    setError(null);
    try {
      const { authorizeUrl } = await startGithubOAuth({});
      window.location.href = authorizeUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start GitHub connect");
      setGithubLoading(false);
    }
  }

  async function onDisconnectGithub() {
    setGithubLoading(true);
    try {
      await disconnectGithub({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect GitHub");
    } finally {
      setGithubLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await createAudit({
        paperId: paperId.trim(),
        paperIdType,
        githubUrl: githubUrl.trim(),
      });
      persistActiveSession(result.auditId);
      router.push(routes.audit(result.auditId, result.sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start audit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="marketing-card hero-form" onSubmit={onSubmit}>
      <div className="hero-form-github">
        {githubConnection === undefined ? (
          <p className="text-muted">Checking GitHub…</p>
        ) : githubConnection ? (
          <p>
            GitHub connected as <strong>@{githubConnection.githubLogin}</strong>{" "}
            <button
              type="button"
              className="link-button"
              onClick={onDisconnectGithub}
              disabled={githubLoading}
            >
              Disconnect
            </button>
          </p>
        ) : (
          <p>
            <button
              type="button"
              className="secondary-button"
              onClick={onConnectGithub}
              disabled={githubLoading}
            >
              {githubLoading ? "Redirecting…" : "Connect GitHub"}
            </button>
            <span className="text-muted"> — required for PR fixes on your repo</span>
          </p>
        )}
      </div>
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
        {loading ? "Starting audit…" : "Find the fork"}
      </button>
      {error ? <p className="form-status-error">{error}</p> : null}
    </form>
  );
}
