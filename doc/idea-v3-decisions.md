# Idea v3 — hero reload, footer, brand (decisions log)

Design phase ran through the visual companion (`.superpowers/brainstorm/26979-1792335868/content/kb-*.html`,
boards shown and user-approved 2026-10-18). This file records every decision behind the six
tickets 116–121. Spec: `doc/idea-v3-spec.md`.

## User's brief (their words, approved board `kb-mark-plan.html` + green light "i approve … and move on")

- The tab logo (`favicon`) becomes the KB mark.
- The site logo = `~/Downloads/Blue KB Monogram Logo.png`, **unchanged**, only recoloured to the
  site's style (ink), all sizes.
- Intro: the mark displays first → the K and B get **separated** → each becomes the mark's own
  letter designs (`~/Downloads/Stylized Blue Letter K Logo.png`, `~/Downloads/Untitled_design-removebg-preview.png`)
  → then the text appears displaying the full name. One line.
- Nav: **logo only** on the left, no wordmark/„Home" — "just copy how it's done from the inspiration".
  Mono links stay on the right.
- Nav **and footer** always use the KB mark **together** (the composite monogram; a letter never
  floats alone outside the intro).
- Hero = name + tagline + the moving bar underneath; the about is "just the paragraph, not the
  hero" (own paragraph section); hero button opens github.com/Khalil-bec; load animation
  like the inspiration's (their ~1.5s mark → wordmark → bloom, probed with `probe-load.mjs`).
- Floating chips = the user's skill logos ("you pick" was delegated; the set below).

## Provenance of the vector paths (potracer)

- Traced with the `potracer` pure-python potrace port (installed `pip install --user
  --break-system-packages`), input masks: `max(R,G,B) − min(R,G,B) > 40` for the painted
  PNGs, `alpha > 128` for the transparent B. **Lesson:** potracer treats the *falsy* pixels as
  foreground — pass `~mask` or the fill inverts (caught by composite render check).
- Composite mark: one path, 2310 bytes, viewBox `0 0 923 687` (glyph bbox 333..1255 × 185..871
  of the 1536×1024 canvas), `fill-rule="evenodd"` for the two bowl counters.
- Stylized K: 728×816 bbox (aspect 0.892); standalone B: 102×159 (aspect 0.648). The two PNGs
  do **not** reproduce the composite when re-assembled (different renders — registration search
  maxed at ~40% IoU, abandoned): irrelevant in the approved design, they appear only *after*
  the mark splits, never re-locked.
- Rebuild command if `/tmp` is lost again: `python3` + potracer, mask → `potrace.Bitmap(~mask)`,
  `trace(turdsize=10, opttolerance=0.6)`; path data lives inline in index.html `<defs>`.

## Decisions

- **The mark's fill is ink** (`currentColor`): 105 made the accent the ink itself, so a blue
  logo would be the first coloured element on a monochrome page. `--color-focus` blue stays
  for focus rings / ruler progress only. On paper (if ever) the same currentColor swaps.
- **Favicon = badge, not bare glyph**: ink-on-transparent would vanish on light tab bars; the
  SVG favicon is the mark on the site's own `#121316` rounded square. `favicon.ico` re-rendered
  from the SVG (playwright raster → PIL ICO sizes 16/32/48/64) and both files replaced in place
  (`favicon.svg`, `favicon.ico`, 005's links untouched). `og-image.svg/png` refreshed to the
  mark + name in the same pass (005's code-drawn monogram retires).
- **The three SVGs live once, inline in index.html `<defs>`** (symbol ids `brand-mark`,
  `brand-k`, `brand-b`), consumed by `<use>` in nav + footer + intro overlay — one source of
  truth, browser caches the single path set, no fetches.
- **Intro overlay is JS-injected** (`src/intro/intro.js`): with no JS the settled hero renders
  directly (progressive enhancement, the 004 contract); `prefers-reduced-motion` → the overlay
  is never injected (the user's earlier standing rule). It replays on every load (the
  inspiration's behaviour). Overlay is `pointer-events: none`, `z` above everything
  (`--z-intro: 300`), unmounted after its last frame — scroll never locked.
- **Intro choreography (~1.7s, timings as tokens):** 0–0.4s mark scale-in with soft glow →
  0.4–0.9s mark fades while the stylized K + standalone B scale in apart (ink, equal heights —
  the seam in the composite is the conceptual split line) → 0.9–1.35s letters shrink toward the
  sides while the **real hero name element** (already in settled layout) is unhidden →
  1.35–1.7s tagline/CTA/cue + chips/ticker bloom. The name is never a copy of itself: the real
  element exists from boot; the overlay only hides then reveals it (className-based, so the
  reveal is the settled layout, never a rebuilt copy).
- **Chips set (13, my pick per delegation):** Docker, Git, GitHub, Python, Linux, Nginx,
  MySQL, Flask, Ansible, Grafana, Terraform, AWS, Kubernetes. Sourced from simple-icons as
  local path SVGs under `src/sections/hero/assets/` (fetched once at build time, committed —
  assets, not libraries; zero external requests at runtime, the 007 contract). Ink-tinted
  monochrome (`fill: currentColor`) matching the accent decision. Their inspo mechanics
  (probe-hero): large at edges, blurred near the centre, absolute inset-0 backdrop, parallax
  drift with scroll.
- **Ticker content switches to the skill names** (reuse `skills.tiers[*].items` — dictionary
  arrays are already consumable; no new copy). The 003/101 ticker engine/ARIA shell is kept;
  only the bound keys change. The tagline stays under the name as static text (v1 kept it in
  the ticker; the new hero shows it under the name, per the approved board).
- **About is promoted to its own `<section id="about">`** (the inspiration's structure; the
  user's "the about section is just the paragraph, not the hero"). The reserved 4:5 portrait
  slot retires with it (unsupplied since 005). New partial `src/sections/about/`; dict keys
  move `hero.about[0..2]` → `about.body[0..2]`, `hero.languages` → `about.languages`,
  `hero.aboutTitle` → `about.title`. Row copy: `nav.hero` value becomes **Home / Accueil**
  (the hero is the name hero now), new key `nav.about` = About / À propos for the new section's
  rows (name layer + section index), nav bar keeps its 4 links (its hero link is replaced by
  the brand mark in 117 — the mark links home, as on the inspiration). Name layer grows to six
  rows; geometry re-measured; the 112–115 harnesses were wiped by the environment — a fresh
  baseline harness (`/tmp/opencode/qa-baseline.mjs`) reconstructs the gates before 119 lands.
- **Footer (new partial `src/sections/footer/`, after `#contact`):** mark + mono email left,
  two mono-labelled columns — NAVIGATION (`nav.*`) and ELSEWHERE (`contact.githubLabel` /
  `contact.linkedinLabel`, real URLs as data) — © bar: `© 2026` + the name left, the role right
  (new key `hero.role` = "DevOps & Infrastructure", shared by the hero's metadata row and the
  footer bar). The footer's height is the ~500px that finally lets the contact flip land
  (the 4501 > 4231 maxScroll bug measured in v2); kingpin verification: live flip at depth,
  not just arithmetic.
- **The hero's GitHub CTA** opens `https://github.com/Khalil-bec` in a new tab (`a11y.newTab`
  announcement, the 005 pattern). Mono metadata row under the CTA: `contact.location` +
  `hero.role` (no new location copy).
- **z-order with the intro:** `--z-intro: 300` over nav 180 / ruler 160 / names 150; the
  overlay never intercepts input.
- **Baseline harness rebuilt 2026-10-18** after the environment restart wiped `/tmp/opencode`
  (qa-112…qa-115 lost): `qa-baseline.mjs` re-asserts the standing gates (zero overflow/errors
  EN+FR+reduced+375, ruler lane mapping, names states, nav focus, ticker ARIA, token-gate
  pattern) — counts differ from the lost files by design; it is the new regression floor,
  extended per ticket.

## 2026-10-18 — ticket 118 (hero reload) — decisions recorded at review

- **The chip set's 13th member is Prometheus, not AWS**: simple-icons removed the AWS mark
  (trademark takedown; `amazonaws` 404s on the current release). Prometheus is a tier-2 dict
  skill ("Hands-on — worked with in real setups"), same DevOps family, so it takes the slot.
- **Asset provenance + license**: the 13 chips are simple-icons files (fetched once, at
  `simple-icons@15.22.0`, committed under `src/sections/hero/assets/`). The collection is
  CC0; the underlying brand marks remain subject to their owners' trademark rules — used
  here decoratively. No runtime external requests (the 007 contract).
- **The backdrop is cell-scoped, not full-bleed**: the page lives in the bordered table
  frame (112) — the inspo's viewport-bleed becomes the hero cell's own box, so the rings
  and chips crop at the column edge exactly as the inspo crops at the viewport edge.
- **The CTA is built as the ink inversion** (`--color-text` ground / `--color-bg` text) —
  the ticket's `--color-accent`/`--color-accent-contrast` pair is value-identical
  (`#f2f1ee` / `#121316`); accent keeps its 116-only focus/ruler job. The label's NE arrow
  is drawn with border corners (the cue-chevron technique) — no glyph enters markup outside
  the dictionary seam.
- **Drift direction is the probe's truth**: chips travel *slower* than the content —
  a receding background plane — so `--chip-drift-px: 1px` (positive), factors 0.10–0.25;
  rings recede deeper at 0.05.

## 2026-10-18 — ticket 119 (about promotion) — decisions recorded at review

- **The hero cell ends exactly at one viewport** (spec §4's "#hero = first viewport only").
  118's head formula couldn't deliver that without knowing the hero's in-flow sticky index
  bar (whose height comes from content, not a token), so hero.js publishes
  `--hero-index-h` on first paint + resize — the 106 measured-parameter precedent
  (`--eyebrow-top`); tokens.css keeps only the 0px no-JS fallback (no-JS hero ≈ 41px taller,
  tolerable). Under reduced motion the measurement still runs (only the backdrop drift is
  gated off).
- **The reserved portrait slot retired with the promotion**; its two tokens
  (`--slot-portrait-ratio/width`) are deleted. The project-shot slot tokens stay (ticket 006
  still reserves those slots).
- **The about section = the 106 display title + the paragraph set + the languages line and
  nothing else** — the number/eyebrow scaffold comes free from the section shell (CSS
  counter), the name layer gains its 6th row by markup alone (name.js is row-count agnostic).

## 2026-10-19 — ticket 122 (hero correction) — decisions recorded during implementation

- **The hero leaves the table.** `#hero` drops `.section`: no 1280 column, side borders, index
  bar or counter increment; `section.hero` is full-bleed and `.hero__column` re-establishes the
  1280 + 2rem frame. The counter therefore starts at About (`01`), and the names layer loses its
  Home row — the nav brand remains the home affordance. The hero's bottom rule is full-bleed
  like every table divider; the ticker starts at the fold.
- **The intro lives in the hero's title space**, not over the screen: the stage is
  `position:absolute; inset:0` inside `#hero`, paints no background, ignores pointers, and only
  the hero's own content is gated. The nav, ruler and names layer stay visible throughout.
- **One gate element, many opacity states.** `html[data-intro="run"]` withholds the tagline,
  CTA row, meta, cue, backdrop and ticker; the `<h1>` itself is deliberately NOT parent-opacity
  gated, because that would mask the per-character fade and the K/B cross-fade. The name is
  hidden by JS-stamped `.is-pending` before the bind and `.is-split` per character afterwards.
  `data-intro="bloom"` releases the rest; `settle()` removes the attribute and the stage.
- **The mark is cap-height sized**, not line-box sized: it reads as the word's placeholder, and
  the two letterforms leave it at their real size with no scale change mid-drag.
- **The K/B destinations are measured ink boxes** — canvas `actualBoundingBox*` metrics plus the
  span's own rect — while their starts are translated onto the mark's left/right seats. Each
  glyph is one uniform eased translate; nothing is modelled from a glyph table and the text is
  never duplicated. The remaining characters stagger in reading order from the landing frame.
- **No `innerHTML`:** the stage's three `<use>` pieces are built with `createElement(NS)`, and
  the stage stays `visibility:hidden` until its measured boxes are written (`.is-ready`), so a
  default-sized SVG cannot flash during the dictionary await.
- **Abort is one helper:** `main.js`'s `abortIntro()` clears `data-intro`, removes the stage and
  strips `.is-pending`/`.is-split`, so a throw at either boot seam leaves the settled name
  readable. The 3s head failsafe still covers the pre-mount window.
- **Review findings applied:** shared `readTimeToken` moved into `motion/tokens.js`; local
  `--z-hero-*` tiers replace the stage/content/backdrop literals; `.intro__char` joins the BEM
  family; timings/landed-at renamed away from "beats"; the ticket's line-height wording was
  corrected to the cap-height decision.

## 2026-10-19 — ticket 123 (hero orbit) — decisions recorded during implementation

- **The chips carry their tools' own colours.** Each glyph's `background-color` is its official
  simple-icons brand hex, held in `--chip-color-<name>`; the old per-chip ink alpha becomes one of
  three element `opacity` tiers (`--chip-opacity-soft/mid/bright`), so the depth ordering survives
  the recolour. GitHub (`#181717`) and Flask (`#000000`) are near-black — invisible on our ground —
  so both take the site ink; that is the only exception, and it is deliberate.
- **The wheel is one transform, not per-chip orbits.** `.hero__orbit` (a new inner wrapper, so the
  backdrop keeps its axis-aligned `overflow: clip`) rotates the whole ring + chip group about the
  head's optical centre (`--hero-ring-cx/cy`) at `--hero-orbit-spin` degrees per scroll pixel; a
  chip's arc radius is therefore its distance from that centre, so edge chips swing wide and the
  centre pair barely moves. Each chip counter-rotates by the same angle about its own centre, which
  keeps its glyph upright. This is the closest cheap analogue to the reference's cards riding the
  rings.
- **Rings get their own spin, and the band must fade.** A circle centred on the pivot shows no
  motion when turned, so each ring's conic mask fades the hairline out over its last 40°
  (`--hero-ring-solid-angle/fade-angle`) and each ring adds a `--hero-ring-spin-N` rate. The visible
  sweep is the *sum* of the wheel and the ring's own rate — the first pass had ring 2 at `−0.03`
  against a `+0.03` wheel (net zero: a still ring); the review caught it and it is now `−0.06`. The
  mask is applied to the border rather than to a masked background band, so the hairline keeps its
  anti-aliasing; its opaque stop is `var(--color-text)` — a matte, not paint.
- **Scroll-linked, no time term.** `hero.js` still publishes only the single `--hero-scroll` counter
  (no JS change); every angle is CSS `calc()`. Reduced motion / no JS leave the counter unwritten,
  so all transforms sit at their 0 fallback. Because the ring band's arc is always present, the
  settled look changes in two ways versus 122 — the chip colours and the rings' fading arc — not one.
