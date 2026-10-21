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

## 2026-10-19 — ticket 121 (footer) — decisions recorded during implementation

- **Shape: full-bleed band, inner 1280 + 2rem frame.** The footer is a `<footer>` landmark outside
  `<main>` (after `#contact`), not a `.section`: it takes no table side borders, no counter
  increment and no name-layer row (the ruler's document scale still includes it). The full-bleed
  band's inner box re-establishes the shared content frame with `max-inline-size:
  var(--container-max)` + `padding-inline: var(--container-pad)` **inside** the box (the hero's
  pattern, not the section's border-box frame) — the first pass put the padding on the band, which
  lined the footer up with the table border 33px outside every section's text; the review caught it.
  At 1440 the footer text starts at 112 (section text 113, the cell's 1px border) and at 375 at 32.
- **Mark + email left.** The composite `#brand-mark` symbol is decorative (`aria-hidden`,
  `focusable="false"`) and takes the `--footer-mark-size` 42px height with the artwork's 923:687
  aspect (the nav mark's 1.344 completion). It is not a link: the nav already owns the home
  affordance, and the ticket asks for brand identity, not a second home target. The mailto is the
  005 data pattern — bare, same-tab, parameter-free — in mono with the underline-on-hover/focus
  step.
- **Two labelled columns.** `NAVIGATION` reuses all five `nav.*` keys (About → Contact) and
  `ELSEWHERE` reuses `contact.githubLabel` / `contact.linkedinLabel`. The board abbreviated the
  navigation column to three items for space; the ticket's "column items reuse `nav.*`" plus the
  complete section set wins, so About and Education are present too. Each column is its own
  `<nav aria-labelledby>` landmark (the first pass wrapped both in one nav labelled
  "Navigation", which put the external profiles under the wrong landmark — both review axes
  flagged it). External links keep the 005 contract (`_blank` + `noopener noreferrer` + the
  localized visually-hidden announcement); the board's ↗ arrows are not reproduced because the
  announcement already carries the semantics.
- **Only two new dictionary keys:** `footer.navigation` (Navigation / Navigation) and
  `footer.elsewhere` (Elsewhere / Ailleurs). The © bar reuses `hero.name` and `hero.role`; the
  year is static `2026` data with an inline comment (the 005 favicon-comment precedent), not copy.
  No `footer.js`: HTML + CSS only, the 119 about precedent.
- **The contact flip finally lands.** `name.js` claims a section when its top crosses
  `scrollY + 0.25·vh`; at max scroll that is `contact.top <= maxScroll + 0.25·vh`, equivalently
  `docH >= contact.top + 0.75·vh`. Before 121 the page was 456px too short at 1440×900 (contact
  4526, maxScroll 4082 → the layer stopped on Education). The footer's 377px (1440/1024/768) /
  519px (375) clears it with margin: 1440 EN contact 4526 / maxScroll 4459 / trigger 4684;
  1440 FR 4755 / 4688 / 4913; 375 EN 6451 / 6667 / 6870; 375 FR 6729 / 6945 / 7148. A live scroll
  crosses `#education` → `#contact` in every config, and the ruler reports 100 at max with
  `--scale-offset = -scrollY`.
- **QA:** `/tmp/opencode/qa-121.mjs` — 198 checks green (1440/1024/768/375 EN, 1440+375 FR,
  1440+375 reduced, keyboard sweep, partial-sync/stylesheet/dict source checks). No overflow or
  console/page errors. Screenshots `/tmp/opencode/121-*-footer.png`.

## 2026-10-19 — ticket 121 (footer) — bar-grid revision

- **The user's reference wins over the first footer pass.** The reference footer is divided by
  one-pixel bars: a bordered 1280 frame, then cells separated by the grid gutter, with a full-width
  bottom strip. Our pass had the content but no bars, so the footer read as two loose columns. The
  revision keeps our dark tokens and reimplements the structure: `.footer__inner` carries the two
  outer rules; `.footer__grid` has `gap: var(--border-width)` over a `--color-border` background;
  each `.footer__cell` paints `--color-bg` over it. Three columns at desktop
  (`2fr 1fr 1fr`), one column below 768 via `--footer-grid-columns`; the gutters become horizontal
  bars when the cells stack.
- **Brand cell content:** the decorative composite mark, `hero.tagline` (the hero's own sentence,
  rich binding keeps the role bold), and the bare mailto. This matches the reference's
  logo + description + email stack without adding another copy key. The bottom bar then carries
  the "made by" credit the user asked for: `footer.madeBy` + `hero.name` on the right, with
  `© 2026` + `hero.name` on the left. `hero.role` is no longer repeated in the bar; it is already
  the bold phrase in the tagline.
- **One new dictionary key:** `footer.madeBy` (Made by / Fait par), alongside the first pass's
  `footer.navigation` and `footer.elsewhere`. The © year stays static data with its inline
  comment. No `footer.js`.
- **Height is part of the ticket, not a spacer.** The follow-up request ("a bit more space in
  length … between the link and the line above the credits") is answered with cell padding, not
  a gap: desktop cells take the 6rem `--footer-cell-pad-block` at the top and the larger 9rem
  `--footer-cell-pad-end` below the content, and the grid keeps a 28rem floor. The narrow query
  drops the floor to auto and uses 1.5rem / 2.5rem for the cell's top/bottom padding, so the
  stacked rows also get more air before the credits rule. Measured footer height: 517 at
  1440/1024, 658 at 768 (stacked), 731 at 375 — versus 377 / 519 before. The extra document
  height raises `maxScroll` by 140 at 1440 and 212 at 375, widening the contact-flip margin from
  158 to 298 at 1440 and from 419 to 632 at 375 (trigger = maxScroll + 0.25·vh).
- **Alignment survives the bars.** The inner frame's 1px side rules + 2rem cell padding put the
  footer text at x=113 @1440 and x=33 @375, exactly the section content edge (the section's own
  1px border included). The bottom bar shares that padding, so the credit line sits on the same
  edge as the brand and nav cells.
- **QA:** `/tmp/opencode/qa-121.mjs` — **246 checks green** (8 configs + keyboard + source-level
  structure checks), including cell-gap geometry, bottom-bar placement, made-by copy, live EN→FR
  switch, reduced motion, zero overflow/errors. Token gate on `footer.css` prints nothing.
  Screenshots `/tmp/opencode/rev-*` (element + max-scroll + live-switch).

## 2026-10-20 — final verification gate (tickets 125–128)

- **The harness becomes repo tooling, not `/tmp` folklore.** The v3 per-ticket scripts were
  mostly gone; the gate now lives in `tools/qa` behind `npm ci && npm run verify` (dev-only
  Playwright 1.64.1 + Lighthouse 13.5.0). Nothing under `src/` imports it and no runtime
  dependency ships. Red baseline: 7 failures / 99 passes; final: **106 / 0**.
- **Mobile performance is not an intro-only problem.** Skipping the intro ≤768 (user call)
  lifted the median to 76–81, not over 90. The LCP element is JS-bound text; Lighthouse's
  *observed* LCP was 135 ms but its simulated LCP was 3.5 s, because the simulation charged
  the bind for the full module + vendor path. Three fixes, all measured:
  1. **Critical path split** — `main.js` statically imports only i18n; the intro, motion
     modules and vendor scripts load after the bind. `modulepreload` only covers `main.js` +
     `i18n.js`. Language-switch motion refreshes are dynamic imports (already cached).
  2. **Language-invariant `<h1>` fallback** — the name is identical in EN and FR, so the
     initial HTML can carry it without a language flash; i18n still rebinds `hero.name`.
     This is the one copy-rule exception, recorded in `AGENTS.md`, ticket 126 and here.
  3. **Pre-paint space reservation** — the ticker band reserves its live height through
     `data-motion`, and the wrapped nav list reserves its measured 2/3/4-row height
     (`--nav-list-h-2/3/4`) from the first frame. The boot guard also publishes an early
     `lang` hint so the FR nav height is right before the dictionary binds.
  Final mobile: **97/97/97**, LCP 2259 ms, CLS 0.056; desktop **98**, a11y **100**.
- **Names target size is a real AA fix, not an audit waiver.** Pitch 20 → 24 px
  (`--name-pitch: 1.5rem`); no stack retune was needed. `minGap=0`, rows 24 px, desktop
  a11y 100, `qa-124` 69/69 travel regression green.
- **The final gate keeps the v1 thresholds.** Mobile performance > 90 and LCP < 2.5 s,
  desktop perf ≥ 95, both a11y 100; three mobile runs, median used. The reproducible
  command, the report and the screenshots are the evidence; `doc/acceptance-criteria.md`
  maps every v1 item (including the v3 amendments and the fallback exception).
- **Token gate amendment:** `@media` prelude lengths are not tokenizable (custom properties
  are illegal in media queries), so they are stripped before the literal scan. Everything
  else still has to come from `tokens.css`.


## 2026-10-21 — the names layer's current title follows the section in view (ticket 129)

- **The report:** the vertical titles in the ruler lane trailed the page by one
  section — the ruler showed **education** while the contact section was
  already on screen, and **contact** only once the footer was in view. The
  user's call: "i want all the titles proportional to when you reach its
  section", and **no footer row** — contact holds through the footer.
- **The cause was one fixed viewport offset.** 114's `TRIGGER = 0.25` made a
  section current only once its **top** had risen into the top quarter of the
  viewport. A section's top enters the viewport a whole viewport before that
  line, so every title trailed the content by up to a quarter screen — and the
  short end sections (education 450 px, contact 456 px) could not catch up
  before the footer. Measured: `education @ fully-in-view` (scrollY 3626)
  showed skills; `contact @ fully-in-view` (4082) showed education.
- **The rule is now occupancy, not an offset:** the current row is the section
  whose band covers **the most of the screen**; a tie goes to the **later
  section in document order** (the one being scrolled into on the way down),
  so the handover lands at the halfway point. Before the first named section
  is on screen (the hero, which has no row of its own since 119) the first row
  stays current — the layer's behaviour since 114, unchanged here.
  `measureTops` became `measureBands` (top *and* bottom, whole-px, re-measured
  on resize / font load / language switch).
- **Why occupancy and not a different offset.** Any fixed line trades one
  error for the other: a lower line makes the title trail (the reported bug),
  a higher one makes it announce a section that is only peeking in at the
  bottom edge. Occupancy ties the title to what is actually on the screen, and
  that is what "proportional to when you reach its section" means in practice.
  The hero is the one place no named section is on screen, and it has no row
  of its own to name. Occupancy also fixed the end of the page: contact now
  holds from scrollY 4076 to the end (4599), covering the footer with no
  footer row.
- **The 115 travel is untouched** — it still spawns at the state flip and
  still rides 1:1 with scroll. The handover happens 225 px earlier in the
  scroll: the contact handover moves from scrollY 4301 to 4076, so the
  distance from the handover to the page's end grows from **298 px to 523 px**
  (max scroll 4599) — more scroll in which a train can finish its exit. The
  exit geometry itself is unchanged (the 0.4·vh line, viewport-relative).
  Measured: 16 letters airborne on the downward education → contact handover
  (scrollY 4095).
- **The rule became a pure seam.** `currentSection(bands, scrollY, vh)` —
  bands in, index out — so the selection rule is reasoned about on its own
  instead of living inline in the render callback. `measureTops` became
  `measureBands` to feed it. The QA harness re-implements the rule
  independently — it asserts the *documented* rule, so it is a second
  implementation, not a call into this one.
- **Two further consequences, recorded where they live.** Tickets 114 and 115
  stated the `0.25·vh` offset as the live rule and are now marked superseded
  in part. Ticket 121's **footer-length requirement** was derived from the
  same trigger (`contact.top ≤ maxScroll + 0.25·vh`, margin 298 at 1440); under
  the occupancy rule it **relaxes** — at max scroll education measures **0 px**
  and contact **383 / 383 / 242 / 81 px** (1440 / 1024 / 768 / 375), so contact
  is the only named band on screen and is current at every width, and the
  footer now only has to stay shorter than the viewport (measured 517 / 517 /
  658 / 731). 121 is marked superseded in part.
- **A harness defect surfaced and was fixed — and it invalidated the earlier
  green numbers.** `i18n.keys-resolve` required every bound key to be a
  string, but `skills.all` is an array bound with `data-i18n-mode="join"`
  (118's ticker source), so the audit could never pass against the committed
  markup. The check is now mode-aware. The defect belongs to **125's** audit,
  not to 129's logic; it is recorded in `doc/tickets/125-verification-harness.md`
  and the fix rides the same uncommitted batch (the gate cannot be green
  without it). Consequence worth stating plainly: **the 106/0 figures recorded
  for 125 and 128 are not reproducible against the harness as it now stands**
  — the harness grew from 106 checks at the 128 gate to 146 in the same
  uncommitted batch, and the mode-blind audit was added in that growth without
  its green baseline being re-run. The current green figure is **158/0** on
  the full gate (`npm run verify`), **148/0** with `verify:fast` — the 10
  Lighthouse and screenshot checks are the difference.
- **The new checks were validated against the bug, not just against the new
  code.** Restoring 114's `0.25·vh` trigger turns the gate red at exactly the
  reported depths (`#education@3626 got=#skills`, `#contact@4082 got=#education`)
  in EN and FR, at 1440 and 1024. The sampled depths are each section centred
  in the viewport **and** each section fully in view — the latter is where the
  old rule named the previous section, so a regression to the old trigger
  cannot pass. **Depth 0 is sampled too**: the hero is the one place no named
  section is on screen, and there the expected value is the *first* row (the
  layer's behaviour since 114) — asserted, not assumed.
- **Evidence:** probe sweep at 1440×900 + 1024×800 — the current row is the
  section in view at every depth (rest/about → `#about`, projects, skills,
  education, contact, footer → `#contact`); harness **158 / 0** full gate
  (148 / 0 fast) — the harness grew by **12**: eight new checks
  (`names.current-section-*` and `names.current-visible-*` at 1440 and 1024,
  ×900, × EN + FR) plus four incidental `settle.names-*` settle checks;
  Lighthouse unchanged (mobile 97/97/97, LCP 2257/2258 ms, a11y 100;
  desktop 98, a11y 100); 114's geometry invariants re-verified at 1440 + 1024
  in EN and FR. Tickets 114, 115 and 121 are marked **superseded in part by
  129** so their recorded trigger is history, not the live rule.

## 2026-10-21 — the names layer's title follows the section you have reached (ticket 130)

- **The rule changed again, and the reference settled it.** The user rejected
  129's occupancy rule — "i want the section title in the scroll ruler to
  appear just when i discover the section not at its middle" — and pointed at
  the reference. So the reference was measured directly rather than inferred.
  On getartcraft.com (1440×900, dark) the names layer is a `fixed inset-0`
  overlay; each section word is a run of per-letter spans whose `transform`
  matrix carries the state — **scale 0.4706 + warm gray** at rest, **scale 1 +
  full ink** when current, anything between while the word is in flight. The
  handover is therefore **the flight's spawn** (the moment the incoming word's
  letters leave the resting scale), not the moment the word has finished
  settling: the reference's flight is scroll-linked and long (~800 px), so its
  *visual* settle lags the *state* flip by about that much.
- **The measured spawn depths, against the sections' bands** (`hero 49–901,
  features 943–3497, ownership 3497–4152, made-with 4152–4693, start
  4693–5199`):

  | Incoming word | Flight spawns | The section's top enters the viewport | Visible at the spawn |
  | --- | --- | --- | --- |
  | FEATURES | 129 | 43 | 86 px (9.6 %) |
  | OWNERSHIP | 2644 | 2597 | 47 px (5.2 %) |
  | COMMUNITY | 3273 | 3252 | 21 px (2.3 %) |
  | GET STARTED | 3813 | 3793 | 20 px (2.2 %) |

  **The reference hands over at discovery** — 20–86 px after the section's top
  crosses the viewport's bottom edge, with the new section filling 2–10 % of
  the screen. Never at the middle, never later. (Each spawn was read from the
  word's own letter range in the overlay, so a flight in progress could not be
  mistaken for another word's.)
- **The live rule:** the current row is **the section the page has reached** —
  the last one in document order whose top has entered the viewport
  (`top ≤ scrollY + vh`). The title names a section the moment it is
  discovered, and it never trails the page. Before the first named section is
  reached (the hero, which has no row of its own since 119) the first row
  stands in — the layer's behaviour since 114, unchanged. 129's occupancy rule
  is **superseded by 130**; its reasoning and measurements stay as the record
  of what was tried.
- **A latent bug closed on the way:** `measureBands()` returned
  `{top: 0, bottom: 0}` for a section the markup does not have. Under the
  reached rule such a band satisfies `top ≤ scrollY + vh` on every frame and
  would win the state — so a missing section is now a **null** band, which the
  rule skips.
- **The travel is untouched:** 115's flight still spawns at the state flip and
  still rides 1:1 with scroll; only the flip's depth moved. Every handover
  moves **450 px earlier** than under 129 (675 px earlier than under 114's
  `0.25·vh` trigger), so the distance from the last handover to the page's end
  grows **523 px → 973 px** — more scroll in which a train can finish its
  exit. The exit geometry itself (the 0.4·vh line) is unchanged. No CSS, token
  or markup change.
- **Evidence:** the current row is the section reached at every sampled depth,
  and it flips **exactly at the boundary** — one pixel before the section's top
  crosses the viewport's bottom edge the previous section is still named, at
  that pixel the new one is. The reported failure reads correctly now: at
  scrollY 4082 (contact fully in view) the title is `#contact` — under 114's
  trigger, and under 129's occupancy rule, it was `#education`. Harness
  **148 / 0** fast; the 129 checks were rewritten for the new rule
  (`names.current-section-*` now samples **the flip boundary and the pixel
  before it**; `names.current-visible-*` became `names.current-reached-*` —
  the title must never name a section the page has not reached, the hero's
  first-row fallback being the documented exception) and were **validated
  against both old rules**: restoring 129's occupancy rule reddens the gate at
  every boundary (`#contact@3626 got=#education want=#contact`), restoring
  114's `0.25·vh` trigger reddens it at the reported depth
  (`#contact@4082 got=#education want=#contact`) — EN + FR, 1440 + 1024.
  Visual QA approved (0 failures; 1440/1024/375 × EN/FR + reduced). The
  travel still flies: 16–20 letters airborne at each handover.

## 2026-10-21 — the 125–130 batch: the review pass and what it found

- **The batch was reviewed as a whole** (the `code-review` skill, two parallel
  read-only sub-agents against `5ea37c0`: one Standards axis, one Spec axis).
  The Standards axis found no hard violation in the shipped code, but three
  comment-level stalenesses and four judgement calls; the Spec axis found the
  acceptance ledger stale, `doc/status.md` missing twelve rows, a mislabelled
  table in ticket 130, and two behaviours that looked wrong. What follows is
  what was **changed**, and why.
- **A real defect the review did not see, found by measuring.** The nav
  reservation (ticket 126) mapped the list's row count to widths that were
  never measured. EN wraps to two rows until 529 px and to four rows below
  359 px, and the reservation covered neither: the sticky bar **grew 33 px
  after the dictionary bound** at 521–529 px and at ≤358 px. The boundaries are
  now measured per language (EN 4/3/2/1 rows at 359/376/530, FR 4/3/2/1 at
  376/393/565), each edge keeping the taller reservation one pixel longer than
  measured — under-reserving moves the page, over-reserving only leaves the bar
  a row taller at that single width. The new `nav.reservation-{en,fr}` check
  measures the bar's height across the bind at every boundary and is
  **validated against the bug**: restoring the old mapping reddens the gate at
  320 px, 358 px and 529 px in EN.
- **The harness was more comfortable than the tree deserved.** `i18n.v1-survival`
  **passed vacuously** when the v1 commit was unavailable — a check that cannot
  run is not a pass, and it now fails loudly. `architecture.local-assets` only
  scanned the static `<script src>` tags, so after 126 moved the vendor scripts
  off the document it could no longer see them at all; it now reads the
  injected paths out of `main.js` and asserts each is a local file under
  `vendor/`, and it scans every `src/**/*.js` for an import of the QA tooling
  or a `node_modules` package — the "no runtime dependency ships" half of
  ticket 125's contract, which nothing asserted before.
- **The names rule's fallback could name a row that does not exist.**
  `currentSection()` fell back to row 0 even when row 0's section was missing
  from the markup, while the rule's own contract says a missing section takes
  its row out of the running. It now stands in the first row that *has* a
  section, and returns −1 when no row has one. `measureBands()` also carried a
  `bottom` field that only 129's occupancy rule ever read; the band is the
  section's **top** edge now, and the bottom edge retires with the rule that
  needed it.
- **The critical path is now fault-tolerant.** The ten motion modules were
  awaited with `Promise.all` — one rejected import left an unhandled rejection
  and none of the modules after it initialised. They are awaited with
  `Promise.allSettled`, and each module's init runs inside its own guard, so a
  module that fails to load or throws degrades to "that feature is absent" (the
  copy has already painted) instead of taking the page down.
- **The ledger was stale and the history was split.** `doc/acceptance-criteria.md`
  still said 106/0 and had no row for the names rule; it now carries the current
  figures (162/0 full, 152/0 fast) and a row for the reached rule, and it
  names the *reproducible* harness checks instead of the `/tmp` scripts that
  are gone. `doc/status.md` becomes the table alone and `doc/status-log.md`
  takes the narrative — the long history was costing every session context.
  The log is committed, not ignored: it is the only home of that history.
- **The corrections in the ticket files were corrections of the record, not of
  the code.** Ticket 130's handover table was labelled one section off (the
  pairs are projects/skills/education/contact, and **about has no handover** —
  it is the first row and stands in from scrollY 0); the "450 px earlier" and
  "675 px earlier" figures were right and are now labelled correctly.
