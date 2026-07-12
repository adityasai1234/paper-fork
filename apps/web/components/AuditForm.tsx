"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export function AuditForm() {
  const router = useRouter();
  const createAudit = useMutation(api.audits.createAudit);
  const [paperId, setPaperId] = useState("");
  const [paperIdType, setPaperIdType] = useState<"arxiv" | "doi">("arxiv");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const auditId = await createAudit({ paperId, paperIdType, githubUrl });
      router.push(`/audit/${auditId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <label htmlFor="paperId">Paper ID (arXiv or DOI)</label>
      <input
        id="paperId"
        value={paperId}
        onChange={(e) => setPaperId(e.target.value)}
        placeholder="2401.12345"
        required
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
    </form>
  );
}
