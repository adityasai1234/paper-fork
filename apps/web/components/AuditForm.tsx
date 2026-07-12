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
    </form>
  );
}
