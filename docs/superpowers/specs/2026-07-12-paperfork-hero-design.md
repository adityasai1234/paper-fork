# Paperfork Hero UI Design

**Date:** 2026-07-12  
**Status:** Implemented

## Summary

Redesigned the Paperfork home hero and added a UI-only waitlist page at `/signup`. Visual direction blends Hermes Agent atmosphere, Supermemory polish, and Instrument Serif editorial typography — implemented with `next/font/google` and plain CSS only (no Tailwind, no Three.js, no auth backend).

## Scope

- Home hero + audit form (`/`)
- Waitlist signup page (`/signup`)
- Audit and report pages unchanged (960px `main`, existing components)

## Typography

| Role | Font | Usage |
|------|------|-------|
| Display | Instrument Serif | Hero h1 only |
| Body | DM Sans | Subtitles, labels, buttons, footer |
| Mono | System monospace | Spec row (`arxiv · github · …`) |

Loaded via CSS variables `--font-display` and `--font-body` in `layout.tsx`.

## Color Tokens

| Token | Value |
|-------|-------|
| `--bg-deep` | `#080a10` |
| `--bg-elevated` | `#11141c` |
| `--border-subtle` | `rgba(255,255,255,0.07)` |
| `--border-glow` | `rgba(77,107,255,0.25)` |
| `--accent-primary` | `#4d6bff` |
| `--text-primary` | `#ededed` |
| `--text-muted` | `#8b9099` |

Verdict colors (`#f87171`, `#6ee7a0`, `#fbbf24`) unchanged for report consistency.

## Home Page (`/`)

- Top bar: brand + "Join waitlist" → `/signup`
- Eyebrow: `#01 · Audit`
- Headline: Instrument Serif, two lines, italic on "repo"
- Subtitle: "Draft the merge commit."
- Audit form in elevated `.marketing-card`
- Spec row: `arxiv · github · fork report · voice brief`
- CSS fork motif and radial vignette behind hero
- SVG noise grain on `body::before`

## Signup Page (`/signup`)

- Eyebrow: `#02 · Waitlist`
- Headline: "Get early access"
- Email capture form with client-side validation
- Success state: inline confirmation + link to `/`
- No backend persistence in v1

## Upgrade Paths

- **Grain:** Three.js noise overlay (Hermes parity)
- **Waitlist:** Convex `waitlist` table or Resend/Formspree
- **Fork motif:** SVG illustration or ASCII art banner

## Files

- `apps/web/app/layout.tsx` — fonts
- `apps/web/app/globals.css` — tokens + marketing styles
- `apps/web/app/page.tsx` — hero
- `apps/web/app/signup/page.tsx` — waitlist page
- `frontend/` — standalone marketing Next.js app (port 3001)
- `apps/web/components/WaitlistForm.tsx` — email form
- `apps/web/components/AuditForm.tsx` — marketing card classes
- `apps/web/components/ReportFooter.tsx` — optional `className` prop
