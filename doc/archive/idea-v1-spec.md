# Idea v1 — spec (strategy A: motion-first)

Source: `doc/idea-v1.md`, `doc/idea-v1-brainstorming.md`, `doc/idea-v1-decisions.md`, `doc/content.md`. Strategy decided 2026-10-15: approach A (motion-first), overriding the earlier journey-tuned decision at the user's direction.

## Goal

Build a static personal portfolio for Mohamed Khalil Becheikh (L3 informatique, UPPA Pau, graduating summer 2027) targeting DevOps / Cloud / SRE roles. One link must let an expert feel the craft in the first seconds (theme + scroll mechanism), pass through the hero, land on projects, scan skills, and end at contact. Early preparation for a 27/28 alternance search; v1 says nothing about alternance.

## Scope (strategy A sequencing)

Build the motion shell first, fit content in after:

1. **Step zero — approval-gated scaffolding.** Create `src/` layout (`src/sections/<name>/` per section, `src/styles/tokens.css`, `src/i18n/`), and vendor Lenis 1.3.x + GSAP 3.15/ScrollTrigger into `/vendor`. No other dependencies; any addition needs explicit approval first.
2. **Motion shell.** Dark-theme tokens, marquee ticker, numbered-section scaffold, Lenis smooth scroll (lerp ~0.12, anchors on) with anchor navigation, GSAP ScrollTrigger row reveals with calm pacing, and the `prefers-reduced-motion` kill-switch that disables Lenis + all animation. Keyboard reachability of anchors/switch with visible focus from the start.
3. **Content fit-in.** Five sections in fixed order hero → projects → skills → education → contact. Hero carries name, tagline, about paragraphs, human languages. Projects show all bullets with reveals (no expand). Skills in four tiers. Ticker reuses the existing tagline per language (zero new copy). Text-first with reserved anti-CLS image slots; favicon + OG now, screenshots/portrait later.
4. **Bilingual wiring.** `src/i18n/en.json` + `fr.json` generated from `doc/content.md` without rewording; HTML carries keys only (`data-i18n`); visible EN/FR switch persisted in localStorage, default from `navigator.language`, `<html lang>` updated on switch.
5. **Hardening.** Lighthouse performance > 90, screenshot checks at 375px and 1440px, reduced-motion and keyboard passes, no reference code or assets anywhere.

## Non-goals

- No alternance banner, availability, or rhythm wording.
- No contact form, blog, CV download, backend, frameworks, or bundler.
- No new copy beyond the dictionaries (ticker reuses the tagline).
- No project screenshots or portrait in v1 (slots reserved; user supplies later).
- No hosting/deployment work — v1 stops at local static files.

## Exposed endpoints

None — static files only, no backend, no network API. The interaction surface instead:

- In-page anchors: `#hero`, `#projects`, `#skills`, `#education`, `#contact` (smooth-scrolled via Lenis, instant-jump with reduced motion).
- EN/FR language switch (persisted, defaults from browser language).
- Outbound links: GitHub profile, LinkedIn, three project repos (new tab + `rel="noopener"`); email via same-tab mailto.

## Data

- **Source of truth:** `doc/content.md` (FR + EN approved as-is).
- **Runtime:** `src/i18n/en.json`, `src/i18n/fr.json`, keyed per string and bound via `data-i18n` keys; no hardcoded copy in HTML.
- **Browser state:** one localStorage key for language choice; nothing else stored.
- **Assets:** favicon + OG image now; reserved sized slots for later screenshots/portrait (no layout shift when they land).

## Acceptance criteria

> **Final-gate annotation (2026-10-20, refreshed 2026-10-21):** this is the original
> v1 contract. Four
> items were deliberately amended by v3 (ticker/About placement, footer after
> contact, ticker copy = skills, portrait slot retired); the current tree is
> verified in [`doc/acceptance-criteria.md`](../acceptance-criteria.md) (the
> ledger's own figures are the current ones — 106/106 was the figure at this
> gate and has since grown with the harness; mobile 97, desktop 98, a11y 100).
> The copy-rule exceptions are the two language-invariant pre-boot fallbacks
> (the hero `<h1>` from ticket 126 and the document `<title>`). The boxes below
> stay unchecked as history; the ledger is the source of truth.

- [ ] Section order is hero → projects → skills → education → contact; contact is last.
- [ ] All FR/EN copy matches `doc/content.md` faithfully; no hardcoded text in HTML except `data-i18n` keys.
- [ ] EN/FR switch is visible, flips every string, persists across reload, defaults from browser language, updates `<html lang>`.
- [ ] Ticker scrolls the tagline in the active language; numbered sections and row reveals run on scroll.
- [ ] With `prefers-reduced-motion`: no Lenis smoothing, no reveals/ticker motion; all content fully readable.
- [ ] Keyboard-only: switch, anchors, and all links reachable with visible focus; anchor jumps move focus sensibly.
- [ ] All project bullets visible (no collapse); repo links + GitHub/LinkedIn open new tab with `rel="noopener"`; email is a mailto link.
- [ ] Image slots hold their size empty; favicon + OG present.
- [ ] Lighthouse performance > 90; verified screenshots at 375px and 1440px.
- [ ] Tokens only as CSS variables in `src/styles/tokens.css`; one section per `src/sections/<name>/`; vanilla ES modules, no build step; libraries only from `/vendor`; no reference code copied.
