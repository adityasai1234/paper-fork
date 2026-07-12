#!/usr/bin/env bash
# Create micro-audit issues (#25-29)
set -euo pipefail
REPO="adityasai1234/paper-fork"

gh label create "partner-vercel" --repo "$REPO" --color "000000" --description "Vercel AI Gateway" 2>/dev/null || true

gh issue create --repo "$REPO" \
  --title "[#25] AI Gateway shim + audit-registry + env" \
  --body-file .github/ISSUES/25-ai-gateway-registry.md \
  --label buildathon --label layer-agents --label partner-vercel

gh issue create --repo "$REPO" \
  --title "[#26] Hybrid paper-fetch + worker:methods" \
  --body-file .github/ISSUES/26-paper-methods-worker.md \
  --label buildathon --label layer-agents --label partner-vercel

gh issue create --repo "$REPO" \
  --title "[#27] Eval-protocol fork rules + judge gateway migration" \
  --body "Refactor fork-rules to plugins; judge reads methods output; report.evalProtocol.

See .github/ISSUES/27-fork-rules-judge.md" \
  --label buildathon --label layer-judge --label partner-vercel

gh issue create --repo "$REPO" \
  --title "[#28] Literature + repo LLM migration + llm_turn forensics" \
  --body "Complete repo LLM pass; standardize worker_report; forensics llm_turn UI.

See .github/ISSUES/28-llm-migration-forensics.md" \
  --label buildathon --label layer-agents --label partner-vercel

gh issue create --repo "$REPO" \
  --title "[#29] UI EvalProtocol panel + eval fixtures + Hermes harness docs" \
  --body "EvalProtocol component, ForkLedger columns, eval fixtures, Hermes harness docs.

See .github/ISSUES/29-ui-eval-hermes-docs.md" \
  --label buildathon --label layer-ui --label partner-hermes --label partner-vercel

echo "Created micro-audit issues #25-29 on $REPO"
