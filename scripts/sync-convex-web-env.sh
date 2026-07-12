#!/usr/bin/env bash
set -euo pipefail

ROOT_ENV="${1:-.env.local}"
WEB_ENV="apps/web/.env.local"

if [[ ! -f "$ROOT_ENV" ]]; then
  echo "No $ROOT_ENV found. Run: CONVEX_AGENT_MODE=anonymous npx convex dev --once" >&2
  exit 1
fi

url="$(grep -E '^NEXT_PUBLIC_CONVEX_URL=' "$ROOT_ENV" | cut -d= -f2- || true)"
site="$(grep -E '^NEXT_PUBLIC_CONVEX_SITE_URL=' "$ROOT_ENV" | cut -d= -f2- || true)"

if [[ -z "$url" ]]; then
  echo "NEXT_PUBLIC_CONVEX_URL missing in $ROOT_ENV" >&2
  exit 1
fi

{
  echo "# Synced from root $ROOT_ENV — run \`pnpm convex:dev:once\` to refresh"
  echo "NEXT_PUBLIC_CONVEX_URL=$url"
  [[ -n "$site" ]] && echo "NEXT_PUBLIC_CONVEX_SITE_URL=$site"
} > "$WEB_ENV"

echo "Wrote $WEB_ENV (NEXT_PUBLIC_CONVEX_URL=$url)"
