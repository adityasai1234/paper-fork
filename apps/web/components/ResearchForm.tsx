"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@convex/_generated/api";
import { persistActiveResearchSession } from "@/components/ResumeResearchBanner";

export function ResearchForm() {
  const router = useRouter();
  const createResearchRun = useMutation(api.research.createResearchRun);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createResearchRun({ prompt: prompt.trim() });
      persistActiveResearchSession(result.runId);
      router.push(`/app/research/${result.runId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start research run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="marketing-card hero-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="researchPrompt">Research prompt</label>
        <textarea
          id="researchPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to research — e.g. efficient attention mechanisms for long-context LLMs"
          rows={5}
          required
          minLength={10}
          className="research-prompt-input"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={loading || prompt.trim().length < 10}>
        {loading ? "Starting…" : "Start research run"}
      </button>
    </form>
  );
}
