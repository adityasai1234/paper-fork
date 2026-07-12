# Paperfork Landing + Deploy Design

**Date:** 2026-07-12  
**Status:** Implemented

## Summary

Full Hermes-style marketing landing at `/`, mock demo login at `/login`, product behind `/app/*` with Convex Auth. Single Vercel deployment for `apps/web`, Convex production backend.

## Landing sections

1. **Nav** — Features anchor, waitlist, Start audit CTA
2. **Hero** — Instrument Serif thesis, dual CTAs
3. **Features** — Seven capability cards (Literature → Memory → Outputs) with framer-motion half-reveal. Memory recalls recurring gaps after 2+ audits per repo owner.
4. **Partners** — Convex, Linkup, ElevenLabs, Hermes
5. **Final CTA** — Start audit → `/login`
6. **Footer**

## Auth flow (demo mode)

- `/login` — cosmetic email/password; blank fields use `demo@paperfork.dev`
- Sets `paperfork_demo` cookie (cosmetic) + Convex Auth password sign-in/sign-up
- Middleware protects all non-public routes via `@convex-dev/auth`
- Upgrade path: remove demo fallback; require real accounts only

## Route map

| Public | Gated |
|--------|-------|
| `/` | `/app` |
| `/login` | `/app/audit/[id]` |
| `/signup` | `/app/report/[id]` |

## Tech

- Tailwind CSS 3 + shadcn-style primitives (`Button`, `Card`, `Input`, `Badge`)
- framer-motion scroll reveals with `prefers-reduced-motion` respect
- Report/audit pages keep existing plain CSS (`.card`, `.chip`, etc.)

## Deploy topology

```
GitHub → Vercel (apps/web) → NEXT_PUBLIC_CONVEX_URL → Convex prod
```

See [docs/deploy.md](../deploy.md) for commands and env vars.

## Deprecated

- `frontend/` standalone package removed from workspace; landing merged into `apps/web`
