# 121: Footer — bar-divided grid + made-by credits; contact flip lands

**What to build:** the new `#footer` after `#contact` in the approved board's shape: a full-bleed
inner frame split into bar-separated cells — a wide brand cell (decorative mark, `hero.tagline`,
mono mailto) and two labelled NAVIGATION / ELSEWHERE columns — followed by a full-width bottom bar
(`© 2026 <name>` left, made-by credits right). The added page height finally puts the contact flip
inside `maxScroll`.

**Blocked by:** 120 (page height + geometry final; the flip verification closes the arc).

**Decisions taken:**

- Partial `src/sections/footer/footer.{html,css}` + index.html inline; NOT a centred column
  member: the inspiration's footer bleeds full width with its own 1280 content column inside;
  the ruler lane overlays its right edge as everywhere (its bottom band stops before the page's
  true end — the names-layer bottom stack region).
- **Bar grid (2026-10-19 revision, matching the reference):** the 1280 inner frame carries the
  two outer side rules; `.footer__grid` uses a 1px gap over `--color-border`, and every cell paints
  `--color-bg` over it, so only the gutters show — vertical bars between the three desktop cells,
  horizontal bars between stacked rows at narrow widths. `--footer-grid-columns` switches
  `2fr 1fr 1fr` → `1fr` in the existing 768px query (no new media condition).
- **Brand cell:** the decorative `#brand-mark`, `hero.tagline` as the short description (reusing the
  hero sentence, rich binding keeps `DevOps & Infrastructure` bold), and the bare mono mailto. The
  mark is not a link: the nav already owns the home affordance.
- **Copy sources:** `NAVIGATION` / `ELSEWHERE` headers reuse the existing `footer.navigation` /
  `footer.elsewhere` keys; column items reuse `nav.*` and `contact.githubLabel/linkedinLabel`;
  the bottom bar reuses `hero.name` plus the new `footer.madeBy` prefix (Made by / Fait par).
  External links keep the 005 contract (`_blank` + `noopener noreferrer` + `a11y.newTab`); the
  email stays a bare same-tab mailto.
- **Bottom bar:** `© 2026 <hero.name>` left; `footer.madeBy <hero.name>` right. `hero.role` now
  appears only inside the brand tagline; the 005 static-year precedent still applies to `2026`.
- **Footer is not a name-layer row and not a numbered cell:** the names layer's bottom stack lists
  `#contact` last; the footer is chrome. The ruler's document scale still includes it.
- **Height:** desktop cells use `--footer-cell-pad-block` (`--space-3xl`) at the top and the larger
  `--footer-cell-pad-end` (`--space-4xl`) below the content, so the credits rule sits well clear of
  the links; the grid keeps a `--footer-grid-min-block` 28rem floor. The narrow query drops the
  floor to auto and uses `--space-lg` / `--space-xl` for the cell's top/bottom padding. Final
  footer height: 517 at 1440/1024, 658 at 768 (stacked), 731 at 375.
- **The contact flip lands:** the footer's added height raises `maxScroll` by 140px at 1440 and
  212px at 375 (measured before this revision: 377 / 519px footers). The added scroll room makes
  `#contact` the names layer's current row before the page end in every config; numbers below.

**Scope:**

- [x] Footer partial + css + index.html inline; stylesheet order updated (about.css neighbor).
- [x] Dicts: `footer.navigation`, `footer.elsewhere`, `footer.madeBy` (EN/FR); `hero.tagline`
  and `hero.name` consumed again.
- [x] Geometry: post-build measure of tops/docH/maxScroll; live contact-flip check at 1440 +
  375 (the flip must land ≤ maxScroll, the sticky bar + names layer behaving at the end).
- [x] Bar-grid revision: cells render as the reference's bar-divided footer (3 columns desktop,
  1 column ≤768), the bottom strip carries the made-by credits, and the taller band widens the
  contact-flip margin.
- [x] Keyboard/copy audits: the new links keyboard-reachable, aria labels right EN/FR.
- [x] Baseline harness + footer checks green; screenshots 375/1440 EN/FR + reduced;
  token gate clean; code review; status row.

**Not in scope:** ruler/name-layer machinery changes; dictionary relocations (119 done).

## Verification (2026-10-19)

- **Harness:** `/tmp/opencode/qa-121.mjs` + `/tmp/opencode/qa-121-out.json` (not committed),
  Playwright 1.64.1 `chromium-1248` against `python3 -m http.server 8125`. **246 checks green**
  at 1440/1024/768/375 EN, 1440+375 FR, 1440+375 reduced, plus a 45-step keyboard sweep and
  source-level checks (partial inline sync, stylesheet order, dict keys).
- **Footer checks:** full-bleed band (`x:0`, width = viewport) with the shared 1280 + 2rem
  content frame (text at 113 @1440, aligned with the section content at 113); three cells
  separated by exactly one-pixel bars at desktop and three stacked rows separated the same way
  at 375; the bottom bar starts flush under the grid. Brand cell carries the decorative
  `#brand-mark`, the bound `hero.tagline`, and the bare same-tab mailto; NAVIGATION has the five
  `nav.*` stops, ELSEWHERE has GitHub/LinkedIn; both are separately labelled `<nav>` landmarks.
  The bottom bar carries `© 2026` + `hero.name` left and `footer.madeBy` + `hero.name` right.
  Every new link is keyboard-reachable/focus-visible, EN↔FR flips every string, and `<html lang>`
  follows.
- **Geometry (trigger = maxScroll + 0.25·vh; margin = trigger − contact top):**
  - **Superseded in part by 129 (2026-10-21):** the trigger above came from 114's
    `TRIGGER = 0.25` (a section became current once its top reached the top
    quarter of the viewport), so the footer had to be long enough for
    `contact.top ≤ maxScroll + 0.25·vh` for the contact flip to land. Under
    129's occupancy rule the requirement **relaxes**: at max scroll the named
    bands measure education **0 px** and contact **383 / 383 / 242 / 81 px**
    (1440 / 1024 / 768 / 375 — the gap is the footer's height below the
    viewport), so contact is the only named band on screen and is current at
    every width. The footer's height now only has to stay **shorter than the
    viewport**; its measured 517 / 517 / 658 / 731 px all do. The footer was
    also sized for its own reasons (the bar-divided shape + credits), which
    this ticket did not change.
  - **Superseded in part by 130 (2026-10-21):** the trigger moved again — the
    live rule is now the **reached** rule (the last section whose top has
    entered the viewport), so contact becomes current at `contact.top − vh`
    rather than at the midpoint of its band. The requirement relaxes further
    and the measurements above are unchanged: at max scroll education
    measures **0 px** and contact **383 / 383 / 242 / 81 px** (1440 / 1024 /
    768 / 375), so contact is the only named band on screen and is current at
    every width.
  | View | contact top | footer top | docH | maxScroll | trigger | margin |
  | --- | --- | --- | --- | --- | --- | --- |
  | 1440×900 EN | 4526 | 4982 | 5499 | 4599 | 4824 | 298 |
  | 1440×900 FR | 4755 | 5211 | 5728 | 4828 | 5053 | 298 |
  | 1440×900 reduced | 4552 | 5008 | 5525 | 4625 | 4850 | 298 |
  | 1024×900 EN | 5192 | 5642 | 6159 | 5259 | 5484 | 292 |
  | 768×900 EN | 5199 | 5649 | 6307 | 5407 | 5632 | 433 |
  | 375×812 EN | 6451 | 6961 | 7692 | 6880 | 7083 | 632 |
  | 375×812 FR | 6729 | 7239 | 7970 | 7158 | 7361 | 632 |
  | 375×812 reduced | 6611 | 7121 | 7852 | 7040 | 7243 | 632 |
  The names layer reaches `#contact` at max scroll in every config (four rows passed), and a live
  scroll crosses `#education` → `#contact` in every config. The ruler reaches `100` with
  `--scale-offset = -scrollY` (the footer is inside the document scale).
- **Visual:** `/tmp/opencode/rev-1440-{en,fr,reduced}-footer.png`,
  `/tmp/opencode/rev-375-{en,fr}-footer.png` (+ live-switch and max-scroll shots) and
  `/tmp/opencode/qa-121/*.png`; no overflow, zero console/page errors at every size. The live
  FR switch updates the tagline, headings, links and credits; the reduced-motion render is
  identical to the settled footer.
- **Token gate:** `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|[0-9]*\.?[0-9]+(px|rem|em|ms|vh|vw|svh|ch)\b' src/sections/footer/footer.css` prints nothing;
  `--footer-mark-size`, `--footer-grid-columns`, `--footer-grid-min-block`,
  `--footer-cell-pad-block` and `--footer-cell-pad-end` are declared only in `tokens.css`.
- **Review fixes applied (earlier pass):** footer text moved from the table border edge to the
  section content edge; the two columns split into separately labelled `<nav>` landmarks; the
  email gained the same `:focus-visible` ink step as its hover; the mono micro-type is one shared
  rule instead of four copies.
- **Review judgement calls recorded:** NAVIGATION keeps all five `nav.*` stops (the board shows
  three for space; `nav.about`/`nav.education` make the complete set); the board's ↗ arrows are
  not reproduced (the localized announcement carries the meaning); no `footer.js` (HTML+CSS,
  the 119 about precedent); the year stays static data with an inline comment. The bar-grid
  revision keeps the reference's structure, not its light palette or type.

**Status:** done (d04fa77).
