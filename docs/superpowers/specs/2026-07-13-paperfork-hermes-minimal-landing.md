# Paperfork Hermes Minimal Landing

**Date:** 2026-07-13  
**Status:** Implemented

## Summary

Replaced the laggy SuperMemory motion landing with a fast, static Hermes Agent-style layout ([hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/)): entry action row, single hero preview, six vertically stacked worker sections. Zero `framer-motion`, zero duplicate feature sections.

## Performance constraints

- All marketing sections are server components (no `"use client"` on landing)
- No scroll listeners, parallax, infinite animations, or CSS marquee
- Removed `body::before` SVG feTurbulence noise overlay
- Removed `backdrop-blur` from landing art components
- Removed `framer-motion` from `apps/web` dependencies

## Section map (Hermes crawl reference)

| Hermes | Paperfork |
|--------|-----------|
| Hero art + thesis | `LandingHero` + `HeroArtPanel` |
| Install via terminal | `HeroInstallBlock` |
| Mac / Win / Linux row | `HeroEntryRow` |
| Feature preview label + `#1` stack | `HermesWorkerSections` |
| Nous Portal band | `PortalSection` |
| Footer | `LandingFooter` |

`LandingPage.tsx`: Nav → Hero → Worker sections → Portal → Footer.

## Feature labels

Hermes uses `#1 Connect` + `## Lives Everywhere`. Paperfork uses `#1 Literature` + headline from `data.ts` `verb` + `headline` fields.

## Status

Supersedes SuperMemory motion landing. Full Hermes-structure revamp (2026-07-13 crawl).

## Hero entry row

Three tiles (Paperfork CTAs instead of OS downloads):

- **Start audit** → `/login`
- **GitHub** → open-source repo
- **Waitlist** → `/signup`

## Typography and color

Unchanged from Hermes full-app spec: Instrument Serif display, DM Sans body, mono eyebrows, ink `#080a10`, signal `#4d6bff`.

## Routing

Unchanged: `/research` default after login, `/home` → `/research`, marketing at `/` with no audit form.

## Supersedes

- [`2026-07-13-paperfork-supermemory-landing.md`](2026-07-13-paperfork-supermemory-landing.md) — SuperMemory bento/parallax approach removed

## Files

- `apps/web/components/landing/HeroEntryRow.tsx`
- `apps/web/components/landing/HermesWorkerSections.tsx`
- `apps/web/components/landing/LandingHero.tsx`
- `apps/web/components/landing/LandingPage.tsx`
- Deleted: `BentoGrid`, `WorkerShowcase`, `HeroProductStack`, `AuthEntrance`, `lib/motion.ts`
