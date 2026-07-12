#!/usr/bin/env bash
# Hermes harness: deterministic audit trigger (no LLM). POST to Convex /audit webhook.
set -euo pipefail

MESSAGE="${1:-}"
CONVEX_AUDIT_URL="${CONVEX_AUDIT_URL:-}"
PAPERFORK_WEBHOOK_SECRET="${PAPERFORK_WEBHOOK_SECRET:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

if [[ -z "$MESSAGE" ]]; then
  echo "Usage: hermes-audit.sh 'audit arXiv:2401.12345 https://github.com/owner/repo'" >&2
  exit 1
fi

if [[ -z "$CONVEX_AUDIT_URL" || -z "$PAPERFORK_WEBHOOK_SECRET" ]]; then
  echo "Set CONVEX_AUDIT_URL and PAPERFORK_WEBHOOK_SECRET" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARSED="$(npx --yes tsx -e "
import { parseAuditMessage } from './convex/lib/hermes-parse.ts';
const p = parseAuditMessage(process.argv[1]);
if (!p) { process.exit(2); }
console.log(JSON.stringify(p));
" "$MESSAGE" 2>/dev/null)" || {
  echo "Message must match: audit <paperId> <githubUrl>" >&2
  exit 2
}

PAPER_ID="$(echo "$PARSED" | python3 -c 'import json,sys; print(json.load(sys.stdin)["paperId"])')"
PAPER_TYPE="$(echo "$PARSED" | python3 -c 'import json,sys; print(json.load(sys.stdin)["paperIdType"])')"
GITHUB_URL="$(echo "$PARSED" | python3 -c 'import json,sys; print(json.load(sys.stdin)["githubUrl"])')"

BODY="$(python3 - <<PY
import json, os
print(json.dumps({
  "paperId": "$PAPER_ID",
  "paperIdType": "$PAPER_TYPE",
  "githubUrl": "$GITHUB_URL",
  "secret": os.environ.get("PAPERFORK_WEBHOOK_SECRET", ""),
  **({"telegramChatId": os.environ["TELEGRAM_CHAT_ID"]} if os.environ.get("TELEGRAM_CHAT_ID") else {}),
}))
PY
)"

RESP="$(curl -sf -X POST "$CONVEX_AUDIT_URL" \
  -H "Content-Type: application/json" \
  -d "$BODY")"

echo "$RESP"
echo "$RESP" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("Report:", d.get("reportUrl",""))'
