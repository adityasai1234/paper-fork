#!/usr/bin/env bash
# Sync Convex action env vars from repo .env (secrets stay local; not committed).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${1:-$ROOT/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "No $ENV_FILE found; skipping Convex env sync." >&2
  exit 0
fi

# Keys Convex actions read via process.env (see convex/lib/*.ts, convex/actions/*).
KEYS=(
  GROQ_API_KEY
  PAPERFORK_GROQ_MODEL
  PAPERFORK_LLM_MODEL
  PAPERFORK_LLM_GROQ_MODEL
  PAPERFORK_LLM_MOCK
  AI_GATEWAY_API_KEY
  LINKUP_API_KEY
  GITHUB_TOKEN
  SEMANTIC_SCHOLAR_API_KEY
  ELEVENLABS_API_KEY
  ELEVENLABS_VOICE_ID
  PAPERFORK_WEBHOOK_SECRET
  NEXT_PUBLIC_APP_URL
  TELEGRAM_BOT_TOKEN
)

get_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -1 || true)"
  if [[ -z "$line" ]]; then
    return 1
  fi
  printf '%s' "${line#*=}"
}

set_count=0
for key in "${KEYS[@]}"; do
  val="$(get_env "$key" || true)"
  if [[ -n "$val" ]]; then
    npx convex env set "$key" "$val" >/dev/null
    echo "✔ set $key"
    set_count=$((set_count + 1))
  fi
done

if [[ "$set_count" -eq 0 ]]; then
  echo "No Convex env keys found in $ENV_FILE"
else
  echo "Synced $set_count env var(s) to current Convex deployment."
fi
