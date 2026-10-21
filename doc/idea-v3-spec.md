# Idea v3 — spec: brand, nav, intro, hero reload, about, footer

Status: approved by the user (2026-10-18, visual-boards + "i approve … and move on").
Origin: post-115 creative work. Spec: this file. Modifications: `doc/idea-v3-decisions.md`.
Measured references: `probe-hero.mjs`, `probe-footer.mjs`, `probe-load.mjs` runs of 2026-10-18
(inspiration at 1440×1080; screenshots in the same `/tmp/opencode` dir, subject to the
environment's tmp cleanup).

## 1. Brand (ticket 116)

The KB monogram is the user's `Blue KB Monogram Logo.png`, traced to one vector path
(potracer; provenance + lesson in the decisions file). Geometry untouched. Fill = the site's
ink via `currentColor`; three inline symbols in index.html `<defs>`:

- `brand-mark` — the composite monogram, `viewBox="0 0 923 687"` (nav, footer, favicon source,
  intro beat 1).
- `brand-k` — the full stylized K, `viewBox="0 0 730 818"` (intro beat 2 only).
- `brand-b` — the standalone B, `viewBox="0 0 105 162"` (intro beat 2 only).

Favicon: `favicon.svg` = badge — mark centred on a `#121316` rounded square, ink glyph —
plus `favicon.ico` (16/32/48/64) re-rendered from it. OG image refreshed to the mark + name.
The 005-era mint "code-drawn monogram" retires.

## 2. Nav (ticket 117)

Bar keeps the 107 form (sticky, ~47px, translucent blur, mono uppercase boxed links).
Left end gains the brand mark as the home link (`<a class="nav__brand" href="#hero">`,
`aria-label` from `nav.hero` — no new copy; the mark is decorative content, `aria-hidden`).
The nav list drops its hero link (the mark replaces it) and keeps
`projects / skills / education / contact`; lang switch unchanged at the inline end.
The name layer / section indexes keep using `nav.hero` (whose value becomes Home) — 117 only
touches the nav bar.

## 3. Hero first viewport (ticket 118)

Full-bleed `#hero` head matching the probed inspiration structure:

- **Backdrop**: `absolute inset-0` thin concentric rings (hairline `--color-border`, few,
  centred on the column centre), plus **13 floating skill-logo chips** (simple-icons paths,
  ink at low alpha): large and sharp near the edges, smaller + blurred toward the centre,
  so the type occupies the middle without collisions. Parallax: chips and rings translate
  with scroll at measured factors (their chips drift slower than the content; scroll-linked,
  no time term — the 115 engine pattern).
- **Content**: the centred column passes over (1280 + 2rem padding, 112's frame); name
  (`--font-size-2xl`, one line), tagline under it (`hero.tagline`, rich-text bold lead kept),
  one CTA row: filled-ink `GITHUB ↗` button (opens `https://github.com/Khalil-bec`, new tab +
  `a11y.newTab` announcement) and a mono metadata row (`contact.location · hero.role` —
  `hero.role` is the one new copy key, both languages).
- **Ticker**: in-flow band at the hero's bottom edge, as today (003/101/112 full-bleed), but
  its source items become the skill names — `skills.tiers[*].items` flattened in the
  dictionaries under `skills.all[]` (one array, duplicated copy-free: the tiers remain the
  section's source; the ticker consumes `skills.all`). Single new dict array, both languages.
- The scroll cue chevron stays (v1's affordance).

> **Amendment 126 (2026-10-20):** the `<h1>` carries the pre-boot name
> `Mohamed Khalil BECHEIKH`. It is identical in EN and FR, so the fallback is
> safe before the dictionary arrives; `data-i18n="hero.name"` still owns the key
> and i18n rebinds it. Without a text node in the initial HTML, Lighthouse's
> simulation charged the JS bind for the whole module/vendor path and kept
> mobile LCP at ~3.5 s. This is one of two recorded copy-rule exceptions (the
> other is the document `<title>`, which is language-invariant too).

## 4. About (ticket 119)

Promoted into its own section between the ticker and `#projects`: the name-layer rows,
section index and ruler gain an About stop; copy moves from `hero.*` to `about.*` keys
(body paragraphs, the human-languages line, the title). The reserved portrait slot is
deleted. `#hero` = first viewport only (head + ticker). `nav.hero` value → Home / Accueil;
new `nav.about` = About / À propos; the name layer renders six rows.
Links inside the about body keep their existing dict-rich behaviour (the mail line is text,
links remain in `#contact` only).

## 5. Intro (ticket 120)

`src/intro/intro.js` + `intro.css`, overlay injected at boot only when JS runs and the user
allows motion (else: nothing — the settled page shows). Four beats, tokenised durations
(`--intro-*`):

1. `0 → 0.4s` `brand-mark` scales in at centre with a soft ink glow.
2. `0.4 → 0.9s` the mark fades while `brand-k` (left) and `brand-b` (right) scale in apart,
   equal heights, equal ink.
3. `0.9 → 1.35s` the letters shrink toward the sides and fade as the **hero name reveals in
   place** (the settled element; the overlay only gates its visibility class).
4. `1.35 → 1.7s` tagline/CTA/meta/cue + chips + ticker bloom in the same way; the overlay
   unmounts.

No scroll lock, no pointer interception, replays every load (the inspiration's behaviour).
Under reduced motion the overlay never injects and no reveal classes are added.

> **Amendment 126 (2026-10-20, user decision):** the intro is desktop-only. The
> boot guard returns before setting `data-intro` when
> `matchMedia("(min-width: 769px)")` is false, so ≤768 the hero is the first
> paint and no overlay is created. This follows the existing mobile policy
> (letter travel already stops at 768) and keeps the mobile LCP path clear.
> Above 768 nothing changes.

## 6. Footer (ticket 121)

New section after `#contact` (partial `src/sections/footer/`): the mark + the mailto email in
mono on the left; `NAVIGATION` and `ELSEWHERE` mono-labelled columns to the right (nav.* keys,
contact link labels, real hrefs as data); a hairline-topped bar with `© 2026 <name>` on the
left and `hero.role` uppercase on the right. Footer copy is pull-out-free: everything reuses
existing keys except `footer.heading`-less structure and `hotel-*` none — the only new key
beyond §3 is `hero.role`.
Geometry contract: after 118–120 reshape the page, the footer must put the contact flip inside
`maxScroll` (the v2-measured `4501 > 4231` bug) — verified by live flip, and the final
maxScroll/section-tops recorded in `doc/idea-v2-decisions.md`'s successor note (119's decisions
file) for the harnesses.

## 7. Verification plan (all tickets)

> **Amendment 125/128 (2026-10-20):** the ad-hoc `/tmp/opencode` harnesses are
> replaced by the repo command `npm ci && npm run verify` (dev-only Playwright +
> Lighthouse). It runs the static audits, the 1440/1024/768/375 × EN/FR runtime
> matrix, reduced motion, no-JS, vendor failure, keyboard, deep links, Lighthouse
> and the screenshot sweep in one pass. The final evidence is
> `doc/acceptance-criteria.md` and `qa-out/report.json`.

Per ticket: token gate (`grep`-audited literal colours/sizes outside tokens.css), the fresh
baseline harness (`/tmp/opencode/qa-baseline.mjs` — rebuilt 2026-10-18) extended with
per-ticket checks, screenshot sweep at 375/1440 EN + FR + reduced motion, then code review
(standards + spec sub-agents) before `in-review`. Regressions re-run after every ticket.
Commit per ticket after verification (user's standing "move on" batching; stop on any failure).
