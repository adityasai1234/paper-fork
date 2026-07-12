#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

load_env_file ".env"
load_env_file ".env.local"

if [[ -z "${JWT_PRIVATE_KEY:-}" || -z "${JWKS:-}" ]]; then
  echo "JWT_PRIVATE_KEY/JWKS missing; generating new keys..."
  OUT="$(node generateKeys.mjs)"
  JWT_PRIVATE_KEY="$(printf '%s\n' "$OUT" | sed -n 's/^JWT_PRIVATE_KEY=//p' | head -1)"
  JWKS="$(printf '%s\n' "$OUT" | sed -n 's/^JWKS=//p' | head -1)"
fi

SITE_URL="${SITE_URL:-http://localhost:3000}"

if [[ -z "$JWT_PRIVATE_KEY" || -z "$JWKS" ]]; then
  echo "Failed to resolve JWT_PRIVATE_KEY and JWKS" >&2
  exit 1
fi

echo "Setting Convex Auth env on current deployment..."
npx convex env set JWT_PRIVATE_KEY "$JWT_PRIVATE_KEY"
npx convex env set JWKS "$JWKS"
npx convex env set SITE_URL "$SITE_URL"

echo "Done. Auth env vars set on Convex deployment."
