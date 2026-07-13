# Paperfork Hermes Full-App UI Design

**Date:** 2026-07-13  
**Status:** Implemented

## Summary

Full-app visual redesign matching the Hermes Agent website plan: dark ink atmosphere, Instrument Serif display typography, fork-themed art primitives, unified marketing shell, and dark Hermes theme across AppShell, audits, research, and report surfaces.

## Scope

- Landing `/` — hero, 6 capability cards, partners, final CTA
- Auth `/login`, `/signup` — shared `MarketingShell` + shadcn Card forms
- Dashboard — `AppShell`, audit/research home, live runs, fork/research reports

## Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Instrument Serif | Hero h1, page h1, section h2, card headlines, brand, partner names |
| Body | DM Sans | Nav, descriptions, labels, buttons |
| Mono | System monospace | Eyebrows (`#01 · Audit`), spec rows, chips, terminals |

Rules: sentence case on display type; one italic keyword per major headline; no Alata.

## Color tokens

| Token | Value |
|-------|-------|
| `--bg-deep` | `#080a10` |
| `--bg-elevated` | `#11141c` |
| `--accent-primary` | `#4d6bff` |
| `--text-primary` | `#ededed` |
| `--text-muted` | `#8b9099` |
| `--border-subtle` | `rgba(255,255,255,0.07)` |

Semantic dashboard vars (`--background`, `--card`, `--foreground`, etc.) map to dark equivalents so existing `.card`, `.chip`, `table`, `pre` classes inherit the theme without per-page rewrites.

Verdict colors unchanged: `#f87171` (FORKED), `#6ee7a0` (ALIGNED), `#fbbf24` (UNVERIFIABLE).

## Landing sections

1. **Nav** — Features, GitHub, Waitlist, Start audit
2. **Hero** — `#01 · Audit`, Instrument Serif thesis, CTA, spec row, `HeroArtPanel`
3. **Features** — 6 workers with `FeaturePreview` art + scroll half-reveal
4. **Partners** — Convex, Linkup, ElevenLabs, Hermes
5. **Final CTA** → `/login`
6. **Footer**

Removed from landing: HowItWorks, WorkingNow, OpenSourceCta (content lives in README/GitHub).

## Art primitives (`apps/web/components/art/`)

| Component | Role |
|-----------|------|
| `ForkMotif` | SVG diverging branch lines |
| `HeroVignette` | Radial signal glow behind hero |
| `HeroArtPanel` | Live audit terminal illustration |
| `FeaturePreview` | Per-worker mini UI scenes on capability cards |

Grain: global `body::before` SVG noise overlay.

## Auth

- `/login` — centered Card, Convex password auth unchanged, demo credential fallback
- `/signup` — waitlist Card, Convex `waitlist.join` mutation

## Dashboard

- `AppShell`: dark sidebar (`--bg-elevated`), ink workspace, signal eyebrows, Instrument Serif page titles
- Chips, tables, pre blocks, research progress — dark surface variants
- `ReportFooter` — single dark style everywhere

## Files

- `apps/web/app/globals.css` — unified tokens + dark dashboard
- `apps/web/components/MarketingShell.tsx`, `SiteNav.tsx`
- `apps/web/components/art/*`
- `apps/web/components/landing/*` — trimmed section set
- `apps/web/app/login/page.tsx`, `apps/web/app/signup/page.tsx`

## Supersedes

Extends [2026-07-12-paperfork-landing-deploy-design.md](./2026-07-12-paperfork-landing-deploy-design.md) and [2026-07-12-paperfork-hero-design.md](./2026-07-12-paperfork-hero-design.md) with full-app dark theme and Instrument Serif display system.
