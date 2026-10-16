# Idea v2 — spec (strategy A: faithful dark translation)

Source: `doc/idea-v1-spec.md`, `doc/content.md`, `doc/idea-v1-decisions.md`, this conversation's ArtCraft review (2026-10-16, screenshots of `https://getartcraft.com/` top/mid/bottom), and the layout-v2 mockup (option A). Strategy: A (faithful translation of the inspiration into our dark theme, reimplemented — never copied).

## Goal

Restyle the v1 static portfolio for Mohamed Khalil Becheikh (L3 informatique, UPPA Pau, graduating summer 2027; DevOps / Cloud / SRE) so the first seconds carry the ArtCraft feel — table-divided sections, marquee band right under the hero, ruler scroll readout with page-depth %, and a clickable side rail — while keeping v1's content, bilingual wiring, and dark identity intact. Same journey: theme + scroll mechanism first, hero pass-through, projects focus, skills scan, contact end. Still no mention of alternance.

## Scope (strategy A sequencing)

Build in vertical slices over the assembled v1 site (tickets 001–006 done; 007 baseline first):

1. **Table divisions.** 1px cell borders on all five sections plus small numbered headers (`01/`–style) extending the existing `.section` counter system. Borders and numbering are tokens; no new copy.
2. **Ticker relocation.** Marquee band moves from the fixed bottom bar into in-flow position directly under the hero and scrolls away with the page (no longer fixed; the `has-ticker` body-padding hack is retired). Still binds the active-language `hero.tagline`, still idles hidden while empty, still static in-flow under reduced motion.
3. **Ruler replaces native scroll.** A thin right-edge overlay (0–100 ticks, blue progress line, `%` readout at the thumb) becomes the scroll readout *and driver*: native scrollbar hidden, scroll position owned by the single scroll-driver seam (Lenis bridge + ruler sync). Ruler updates must stay on one rAF loop. JS is required for scrolling (explicit user-approved override — see decisions).
4. **Side rail.** Persistent right-side vertical stack of section names (hero → projects → skills → education → contact) mirroring the nav anchors. Highlights the current section on scroll; clicking jumps (smooth via the driver) and moves DOM focus sensibly. Labels reuse the nav/section headings per language (zero new marketing copy); only digits/`%` and existing aria patterns are added.
5. **Nav stays, page ends at contact.** The sticky top nav keeps owning the 5 anchors + EN/FR switch (user override of the earlier "no navbar" read). No footer and no credits bar — contact is the last painted element.
6. **Hardening as v1.** Token gate, vendor-only libs, vanilla ES modules, no reference code; screenshot checks at 375px and 1440px (EN/FR + reduced); keyboard pass via nav/rail/links with visible focus; Lighthouse performance > 90.

## Non-goals

- No theme flip (stays dark; the inspiration's light paper theme is not adopted).
- No footer, credits bar, alternance banner, contact form, blog, CV download, backend, frameworks, or bundler.
- No new copy beyond the dictionaries (rail reuses nav labels; `%`/digits are chrome, like `a11y.newTab`).
- No project screenshots or portrait (slots stay reserved).
- No native-scrollbar fallback, no-JS scroll, or reduced-motion smoothing (explicitly dropped per user override — see decisions).
- No hosting/deployment work — v2 stops at local static files.
- No copying of the reference site's code or assets; behavior is reimplemented.

## Exposed endpoints

None — static files only, no backend, no network API. The interaction surface instead:

- In-page anchors: `#hero`, `#projects`, `#skills`, `#education`, `#contact` (driven via the ruler scroll driver; instant-position under reduced motion).
- Right ruler: 0–100 ticks + blue progress + `%` readout; drag/thumb position drives scroll (JS-required).
- Right rail: current-section highlight + click-to-jump per section (mirrors nav anchors).
- EN/FR language switch in the nav (persisted, defaults from browser language); rail labels flip with it.
- Outbound links: GitHub profile, LinkedIn, three project repos (new tab + `rel="noopener noreferrer"`); email via same-tab mailto.

## Data

- **Source of truth:** `doc/content.md` (FR + EN approved as-is; unchanged by v2).
- **Runtime:** `src/i18n/en.json`, `src/i18n/fr.json`, keyed per string and bound via `data-i18n` keys; rail labels reuse existing nav/section keys; no hardcoded copy in HTML.
- **Browser state:** one localStorage key for language choice; ruler/rail hold no persisted state (scroll position is live only).
- **Assets:** favicon + OG image as v1; reserved sized slots unchanged (no layout shift).

## Acceptance criteria

- [ ] Section order is hero → projects → skills → education → contact; contact is last with no footer/credits after it.
- [ ] Sections render as 1px table-like cells with numbered headers continuing the existing counter system.
- [ ] Ticker sits in-flow directly under the hero, scrolls away (not fixed), shows the active-language tagline, idles hidden while empty.
- [ ] Native scrollbar is hidden; the right ruler (ticks 0–100 + blue progress + `%`) reflects and drives scroll position on one rAF loop.
- [ ] Right rail persistently lists all section names, highlights the current section on scroll, click-jumps with sensible focus moves, and flips language with the switch.
- [ ] Nav bar stays with 5 anchors + visible EN/FR switch; switch flips every string (including rail), persists, defaults from browser language, updates `<html lang>`.
- [ ] With `prefers-reduced-motion`: no smoothing, no reveals/ticker motion; ruler reflects position instantly without animation; all content readable.
- [ ] Keyboard-only: nav, rail, switch, and all links reachable with visible focus; arrow/space scrolling works through the ruler driver (native fallback explicitly dropped).
- [ ] All FR/EN copy matches `doc/content.md`; no hardcoded text except `data-i18n` keys and sanctioned chrome (`%`/digits/aria).
- [ ] All project bullets visible (no collapse); repo links + GitHub/LinkedIn open new tab with `rel="noopener noreferrer"`; email is a mailto link.
- [ ] Image slots hold their size empty; favicon + OG present.
- [ ] Lighthouse performance > 90; verified screenshots at 375px and 1440px (EN/FR + reduced).
- [ ] Tokens only as CSS variables in `src/styles/tokens.css`; one section per `src/sections/<name>/`; vanilla ES modules, no build step; libraries only from `/vendor`; no reference code copied.
- [ ] Known accepted limitation (user-approved): scrolling requires JS — with JS disabled the ruler driver is inert and the page cannot scroll via a native bar.
