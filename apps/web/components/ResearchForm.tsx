"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@convex/_generated/api";
import { persistActiveResearchSession } from "@/components/ResumeResearchBanner";
import { routes } from "@/lib/routes";

export function ResearchForm() {
  const router = useRouter();
  const createResearchRun = useMutation(api.research.createResearchRun);
  const [prompt, setPrompt] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [metricName, setMetricName] = useState("val_bpb");
  const [runCommand, setRunCommand] = useState("uv run train.py");
  const [metricDirection, setMetricDirection] = useState<"minimize" | "maximize">(
    "minimize"
  );
  const [minimumImprovement, setMinimumImprovement] = useState("0.001");
  const [maxExperiments, setMaxExperiments] = useState("5");
  const [runtimeMinutes, setRuntimeMinutes] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cloudConfig = repositoryUrl.trim()
        ? {
            repositoryUrl: repositoryUrl.trim(),
            baseBranch: baseBranch.trim(),
            metricName: metricName.trim(),
            runCommand: runCommand.trim(),
            metricDirection,
            minimumImprovement: Number(minimumImprovement),
            maxExperiments: Number(maxExperiments),
            maxRuntimeSeconds: Number(runtimeMinutes) * 60,
          }
        : {};
      const result = await createResearchRun({
        prompt: prompt.trim(),
        ...cloudConfig,
      });
      persistActiveResearchSession(result.runId);
      router.push(routes.researchRun(result.runId, result.sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start research run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form-panel" onSubmit={onSubmit}>
      <div className="form-section-heading">
        <div>
          <h2>Research goal</h2>
          <p>Start with literature only, or add an execution contract for measured experiments.</p>
        </div>
      </div>
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

      <fieldset className="research-execution-contract">
        <legend>Cloud experiment contract <span>Optional</span></legend>
        <div className="research-contract-heading">
          <div>
            <strong>Measure candidates against your repository</strong>
            <p>Add a repository to let Hermes test source-backed changes to <code>train.py</code>.</p>
          </div>
          <span>{repositoryUrl.trim() ? "armed" : "literature only"}</span>
        </div>
        <div className="field">
          <label htmlFor="researchRepository">GitHub repository</label>
          <input
            id="researchRepository"
            type="url"
            value={repositoryUrl}
            onChange={(event) => setRepositoryUrl(event.target.value)}
            placeholder="https://github.com/owner/repository.git"
          />
        </div>
        <div className="research-contract-grid">
          <div className="field">
            <label htmlFor="researchBaseBranch">Base branch or revision</label>
            <input
              id="researchBaseBranch"
              value={baseBranch}
              onChange={(event) => setBaseBranch(event.target.value)}
              required={Boolean(repositoryUrl.trim())}
            />
          </div>
          <div className="field">
            <label htmlFor="researchMetric">Metric</label>
            <input
              id="researchMetric"
              value={metricName}
              onChange={(event) => setMetricName(event.target.value)}
              required={Boolean(repositoryUrl.trim())}
            />
          </div>
          <div className="field research-contract-wide">
            <label htmlFor="researchRunCommand">Timed run command</label>
            <input
              id="researchRunCommand"
              value={runCommand}
              onChange={(event) => setRunCommand(event.target.value)}
              required={Boolean(repositoryUrl.trim())}
            />
          </div>
          <div className="field">
            <label htmlFor="researchDirection">Winning direction</label>
            <select
              id="researchDirection"
              value={metricDirection}
              onChange={(event) =>
                setMetricDirection(event.target.value as "minimize" | "maximize")
              }
            >
              <option value="minimize">Lower is better</option>
              <option value="maximize">Higher is better</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="researchMinImprovement">Minimum improvement</label>
            <input
              id="researchMinImprovement"
              type="number"
              min="0"
              step="any"
              value={minimumImprovement}
              onChange={(event) => setMinimumImprovement(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="researchExperimentBudget">Experiment budget</label>
            <input
              id="researchExperimentBudget"
              type="number"
              min="1"
              max="20"
              value={maxExperiments}
              onChange={(event) => setMaxExperiments(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="researchRuntime">Minutes per experiment</label>
            <input
              id="researchRuntime"
              type="number"
              min="1"
              max="60"
              value={runtimeMinutes}
              onChange={(event) => setRuntimeMinutes(event.target.value)}
            />
          </div>
        </div>
        <p className="field-hint">
          The worker checks out the current winner, may edit only train.py, and keeps a commit only
          when the configured metric improves.
        </p>
      </fieldset>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-submit-row">
        <p>{repositoryUrl.trim() ? "A baseline runs before any candidate can be claimed." : "No code executes in a literature-only run."}</p>
        <button type="submit" disabled={loading || prompt.trim().length < 10}>
          {loading
            ? "Starting…"
            : repositoryUrl.trim()
              ? "Start cloud research loop"
              : "Start literature run"}
        </button>
      </div>
    </form>
  );
}
