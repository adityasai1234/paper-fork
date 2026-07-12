#!/usr/bin/env bash
# Create text-track issues (#31-35)
set -euo pipefail
REPO="adityasai1234/paper-fork"

gh label create "text-track" --repo "$REPO" --color "1d76db" --description "Paper text sourcing track" 2>/dev/null || true

gh issue create --repo "$REPO" \
  --title "[#31] Text track — arXiv Atom API (abstract + metadata)" \
  --body-file .github/ISSUES/31-arxiv-atom-api.md \
  --label buildathon --label layer-agents --label text-track

gh issue create --repo "$REPO" \
  --title "[#32] Text track — Semantic Scholar (metadata + neighbors)" \
  --body-file .github/ISSUES/32-semantic-scholar.md \
  --label buildathon --label layer-agents --label text-track

gh issue create --repo "$REPO" \
  --title "[#33] Text track — arXiv HTML (section-level body)" \
  --body-file .github/ISSUES/33-arxiv-html.md \
  --label buildathon --label layer-agents --label text-track

gh issue create --repo "$REPO" \
  --title "[#34] Text track — AI Gateway LLM extraction" \
  --body-file .github/ISSUES/34-ai-gateway-extraction.md \
  --label buildathon --label layer-agents --label partner-vercel --label text-track

gh issue create --repo "$REPO" \
  --title "[#35] Text track — Regex extraction (fallback)" \
  --body-file .github/ISSUES/35-regex-extraction.md \
  --label buildathon --label layer-ship --label text-track

echo "Created text-track issues #31-35 on $REPO"
