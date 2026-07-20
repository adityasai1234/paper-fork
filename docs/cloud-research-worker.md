# Cloud research worker

Paperfork's executable research loop is provider-neutral:

```text
research prompt
  -> Linkup web search + cited candidate
  -> Convex leased queue
  -> Hermes worker on a GPU pod
  -> baseline / timed train.py experiment
  -> metric judgment
  -> keep winner or feed failure into the next search
```

Convex is the durable control plane. The GPU worker may be an ephemeral RunPod, Vast.ai, Lambda, or other machine with the target repository's runtime. The worker owns its GitHub credential; Paperfork never puts a GitHub token in a job payload.

## Configure Convex

Set a high-entropy shared secret and deploy the functions:

```bash
npx convex env set PAPERFORK_RESEARCH_WORKER_SECRET "<generated-secret>"
pnpm convex:push
```

`LINKUP_API_KEY` must also be configured for executable candidate generation. arXiv fallback still supports literature-only runs but intentionally does not invent executable candidates.

## Configure Hermes

Install or expose the repository skill at `skills/paperfork-research/SKILL.md`, then configure the worker environment:

```bash
export PAPERFORK_RESEARCH_API_URL="https://<deployment>.convex.site"
export PAPERFORK_RESEARCH_WORKER_SECRET="<same-secret>"
export PAPERFORK_WORKER_ID="gpu-4090-01"
export GITHUB_TOKEN="<worker-owned-token>"
```

Ask Hermes to follow the Paperfork research skill until the queue returns `204`. A scheduler may start an ephemeral GPU worker when queued work exists and terminate it after the queue drains; a persistent pod will continue billing while idle.

## Worker API

All endpoints are `POST`, accept JSON, require `Authorization: Bearer <secret>`, and return `Cache-Control: no-store`.

- `/research/experiments/claim` — atomically leases the oldest runnable job.
- `/research/experiments/heartbeat` — changes a claimed job to running and extends its five-minute lease.
- `/research/experiments/report` — records an idempotent terminal result and schedules either the next search or final report.

Candidate jobs remain unclaimable until the unmodified baseline has produced the first metric and commit. Expired leases are returned to the queue on the next claim.

## Trust boundary

The run command is provided by the signed-in Paperfork user and executes code from their selected repository. Run workers in disposable, least-privilege machines with no unrelated credentials or mounted data. Treat repositories and commands as untrusted input.

The Hermes adapter must own the complete subprocess lifecycle. Start each run in an isolated process group/session or Windows Job Object, retain its handle, and wait inside `try/finally`. On timeout, cancellation, interruption, or lease loss, terminate the entire process tree, wait briefly, force-kill survivors, and then wait again to reap the child. Do not report, clean the checkout, release the pod, or claim another job until exit is confirmed. This prevents orphaned training processes from consuming GPU time after Paperfork believes a run has ended.
