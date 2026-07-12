"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@convex/_generated/api";
import { persistActiveSession } from "@/components/ResumeAuditBanner";

export function AuditForm() {
  const router = useRouter();
  const createAudit = useMutation(api.audits.createAudit);
  const [paperId, setPaperId] = useState("");
  const [paperIdType, setPaperIdType] = useState<"arxiv" | "doi">("arxiv");
  const [githubUrl, setGithubUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.push(`/app/audit/${result.auditId}`);
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
        {loading ? "Starting audit…" : "Find the fork"}
      </button>
      {error ? <p className="form-status-error">{error}</p> : null}
    </form>
  );
}
