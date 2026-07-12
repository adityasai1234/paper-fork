#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Generating JWT keys..."
OUT="$(node generateKeys.mjs)"
JWT_PRIVATE_KEY="$(printf '%s\n' "$OUT" | sed -n 's/^JWT_PRIVATE_KEY=//p' | head -1 | sed 's/^"//;s/"$//')"
JWKS="$(printf '%s\n' "$OUT" | sed -n 's/^JWKS=//p' | head -1)"

if [[ -z "$JWT_PRIVATE_KEY" || -z "$JWKS" ]]; then
  echo "Failed to parse keys from generateKeys.mjs" >&2
  exit 1
fi

SITE_URL="${SITE_URL:-http://localhost:3000}"

echo "Setting Convex Auth env on current deployment..."
printf '%s' "$JWT_PRIVATE_KEY" | npx convex env set JWT_PRIVATE_KEY
printf '%s' "$JWKS" | npx convex env set JWKS
printf '%s' "$SITE_URL" | npx convex env set SITE_URL

echo "Done. Auth env vars set (JWT_PRIVATE_KEY, JWKS, SITE_URL=$SITE_URL)."
