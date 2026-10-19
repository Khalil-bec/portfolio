# 122: Hero correction — full-bleed, uncounted, logo→title intro in the title space

**What to build (user's correction, 2026-10-19):** the hero is a full-width band, not one of the
bordered sections, and it does not take a section number (About stays `01`). The load intro
happens in the hero's title space — not across the whole screen — and the K/B do not teleport
apart: the mark splits, then each letter is dragged continuously to its own position inside the
name, and only then do the remaining letters appear to complete it. The nav mark also steps down
to the mock-up's size.

**Blocked by:** 120 (the first intro pass — amended here, not discarded).

**Decisions taken:**

- `#hero` drops `.section`: no 1280 column, no side cell borders, no `.section__index`, no
  counter increment. It becomes a full-bleed `section.hero` whose inner `.hero__column` keeps
  the 1280 + 2rem content frame. The CSS counter then starts at About (`01`), and the names
  layer loses its Home row (the nav mark is the home affordance).
- The hero's height is `calc(100svh - var(--eyebrow-top))` so the ticker band starts at the
  fold. `--hero-index-h` (119's measured seam) retires with the index bar.
- Intro overlay becomes an **in-hero stage**: `position:absolute; inset:0` inside `#hero`, no
  cover, no full-screen background, `pointer-events:none`. The nav and page chrome stay
  visible; only the hero's own content is gated. This is the user's "not the entire screen".
- Choreography (all measured, no modelled glyph metrics): the composite mark appears at the
  hero name's optical centre at the title's cap height (the mark is the word's placeholder, not
  a line-box-sized logo, so the K/B can leave it at their real size with no scale change) → the
  mark fades while the stylized K and B
  appear at the mark's own left/right seats → each glyph is **dragged** (one continuous
  transform, eased) to the exact rect of its character in the real `<h1>` (Range/span rects) →
  the rest of the name's characters fade in around them while the glyphs cross-fade into the
  text → tagline/CTA/meta/cue/backdrop/ticker bloom. The letters land on the name's own K and B
  (the `K` of Khalil, the `B` of BECHEIKH), so the split reads as the name assembling, not a
  logo flying off.
- The real `<h1>` is split into per-character spans at intro start (chrome spans, text
  preserved for AT); non-K/B spans start transparent and reveal with a small stagger. On a
  language switch mid-intro the engine replaces the spans; the module detects the detached
  spans, skips the per-letter step and finishes cleanly.
- Durations live in `--intro-*` tokens (read by intro.js with `readTimeToken`), so pacing has
  one source. Reduced motion / no JS never split, never mount the stage (the boot guard is
  unchanged).
- Nav mark: `--nav-brand-size` steps down to 1.25rem (20px) desktop / 1.125rem (18px) narrow —
  the mock-up's optical weight next to the 11–12px mono links, not the 22px it shipped at.

**Scope:**

- [x] hero partial + index inline: `.hero` / `.hero__column`, no index, no `.section`; hero.css
      full-bleed + bottom rule; hero.js drops the index measurement.
- [x] intro.js/css rewritten: in-hero stage, measured K/B drag, per-character name reveal,
      staggered bloom, resize/abort paths.
- [x] names layer: Home row removed (About becomes the first row); nav brand stays the home link.
- [x] tokens: intro timings/geometry; `--nav-brand-size` step-down; retire `--hero-index-h`.
- [x] Verify: About index = 01, hero full-bleed at 1440/375, no horizontal overflow, intro beats
      captured (mark, split, drag, name), reduced + no-JS settled, zero console errors.
- [x] Token gate clean; code review; status row.

**Not in scope:** footer (121), rotating hero imagery (123), ticker content.

**Status:** done (`cdf92ee`).
