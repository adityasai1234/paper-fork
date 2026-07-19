---
name: paperfork-research
description: Run Paperfork's leased Websearch-to-Hermes cloud experiment queue. Use when a Hermes agent is assigned to claim, execute, heartbeat, and report Paperfork research experiments.
---

# Paperfork Research Worker

You are the execution lead in Paperfork's cloud research loop. Paperfork and Linkup choose a source-grounded candidate. You execute exactly one leased job, report immutable evidence, and let Paperfork decide whether the commit survives.

## Required environment

- `PAPERFORK_RESEARCH_API_URL`: Convex site URL, without a trailing slash.
- `PAPERFORK_RESEARCH_WORKER_SECRET`: bearer token shared only with trusted workers.
- `PAPERFORK_WORKER_ID`: stable identifier for this worker or pod.
- `GITHUB_TOKEN`: worker-owned GitHub credential when the result branch must be pushed.

Never print these values or place them in a repository, command argument, patch, report, or log file.

## Loop

1. Claim one job with `POST /research/experiments/claim` and JSON `{"workerId":"..."}`. Send the worker secret in `Authorization: Bearer ...`.
2. A `204` response means the queue is empty. Stop without busy-polling.
3. Create a fresh temporary directory. Resolve its absolute path and verify it is beneath the intended worker scratch directory before cleanup.
4. Clone `job.repositoryUrl`, fetch `job.baseRevision`, and check out that exact revision on `job.resultBranch`.
5. While working, heartbeat at least every two minutes with `POST /research/experiments/heartbeat`. Include `experimentId`, `workerId`, and `leaseToken`.
6. Execute the job according to its kind.
7. Report exactly once to `POST /research/experiments/report` before the lease expires.

## Baseline job

- Do not modify any file.
- Run `job.runCommand` with a hard timeout of `job.maxRuntimeSeconds`.
- Extract the final finite numeric value for `job.metricName` from stdout or the repository's structured result artifact.
- Record the checked-out commit SHA and push the unchanged result branch if it is not already reachable from the remote.

## Candidate job

- Read `job.prompt`, `job.candidate`, and every `job.candidate.evidenceUrls` source before editing.
- Edit only the repository-relative path in `job.targetFile`. It is currently always `train.py`.
- Keep the change to one independently reversible hypothesis. Do not change dependencies, data, evaluation code, time budgets, seeds, or metric calculation.
- Run the repository's fastest documented smoke check first. If none exists, run the timed command with a short timeout and stop after initialization succeeds.
- Before the full run, verify `git diff --name-only` contains exactly `job.targetFile`. If any other path changed, restore it and recheck. If this cannot be achieved, report failure.
- Run `job.runCommand` with a hard timeout of `job.maxRuntimeSeconds`.
- Extract the final finite numeric value for `job.metricName` without estimating or transforming it.
- Commit the exact patch, push `job.resultBranch`, and report both the commit SHA and a GitHub URL in `resultRef`.
- Paperfork owns keep/revert judgment. Never claim success based on intuition.

## Report contract

Successful report body:

```json
{
  "experimentId": "...",
  "workerId": "...",
  "leaseToken": "...",
  "outcome": "succeeded",
  "metricValue": 1.2345,
  "commitSha": "40-character sha",
  "resultRef": "https://github.com/owner/repo/commit/sha",
  "patch": "unified diff",
  "runtimeSeconds": 301,
  "hardware": "NVIDIA RTX 4090 24GB",
  "stdoutTail": "last relevant lines only"
}
```

Failure report body uses `"outcome":"failed"` and a concrete `error`. Include `stdoutTail` when useful. Do not fabricate a metric or commit. The patch is limited to 200 KB and stdout tail to 20 KB.

## Invariants

- One active job per workspace.
- Same hardware class, run command, time limit, dataset, and metric across a run.
- The lease token authorizes only its experiment.
- A result is reproducible evidence, not a recommendation.
- A failed or reverted experiment becomes context for the next Websearch round.
- Never merge to the repository's default branch. Push only the Paperfork result branch.
