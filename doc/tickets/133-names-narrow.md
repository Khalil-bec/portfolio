# 133: Names on phones — the reached title rides the narrow ruler

**Status:** `done` (2026-11-08) — `690419b`. Reviewed, approved.

**Why (phone pass, 2026-11-08):**

> "the ruler doesnt have the section texts"

At ≤768 the names layer is unmounted (`--names-display: none`, ticket 114) and
the ruler's readout is retired (`--ruler-readout-display: none`, 113): the
narrow keeper is ticks and grades only. Both followed the reference, which
mounts neither below 640. On a phone the ruler therefore says *how far* but
never *where*.

**Decision (user, 2026-11-08):** show the **current section only** — one label
on the narrow ruler naming the section you have reached. No five-row list, no
letter travel, no jump targets. See `doc/idea-v3-decisions.md` (2026-11-08
phone pass); this amends 114's narrow switch, not its desktop layer.

**What to build:**

- **Rule — reuse, do not reinvent:** the label names `currentSection()` from
  `src/names/name.js` (130's **reached** rule: the last section whose top has
  crossed the viewport's bottom edge). The same `measureBands()` input, the
  same "missing section drops out" contract, the same keys the desktop rows
  bind. The hero is uncounted (122): while no named section is reached the
  label is empty / hidden.
- **Form:** an **upright letter column** in the 2rem narrow lane — one letter
  per `--name-transit-cell`, first letter on top (the 115/124 train's reading
  order and 109's upright-glyph rule; nothing in the chrome reads sideways).
  Pinned at the top of the lane, under the nav bar, at `--name-stack-top`
  depth or a new narrow token. Mono uppercase, the current-word ink.
- **Collisions:** the column sits over the ruler's grades. Give it the lane's
  ground as a backing so grades pass beneath it, the way 113's readout row did;
  the travelling rule may pass behind it. Measure the longest word in both
  languages (FR is the longer set) against the shortest supported viewport
  (iPhone SE 375×667 and landscape phones) — if the column does not fit, it
  steps the cell down; record the numbers.
- **Handover:** a short cross-fade on the swap (≤ 200 ms, a token); reduced
  motion swaps instantly. No per-letter flights at narrow widths.
- **Mounting:** `name.js` gains a narrow branch keyed on
  `matchMedia("(max-width: 768px)")` with a `change` listener, so rotating or
  resizing across 768 swaps desktop layer ↔ narrow label without a reload and
  without leaving stale state either way. The desktop layer's behaviour above
  768 is untouched. The label rides the same driver frame (one loop, 102).
- **Semantics:** `aria-hidden="true"`, no pointer events — it is a visual
  locator; the section headings and the 132 menu carry navigation and
  structure.
- **Stacking:** below the 132 panel and the nav bar (`--z-*` tokens), above
  content.
- **Tokens** (`tokens.css` narrow block): `--names-display` stays `none` for
  the desktop layer; a new `--names-narrow-display` (and position/fade tokens)
  owns the label.

**What was built:**

- **Markup** (`index.html`): `<div class="names-narrow" data-names-narrow
  aria-hidden="true" hidden>` with one empty word span, after the names layer.
  No copy: `name.js` fills it from the rows' bound `aria-label`s.
- **Rule** (`name.js`): `currentSection()` unchanged; a pure
  `reachedSection()` wraps it and drops the stand-in — the label is empty
  until a section's top has entered the viewport (the desktop layer keeps its
  first-row stand-in on the hero). It runs every driver frame *before* the
  layer's early return, because the hero's stand-in row becoming the reached
  one changes the label but not `current`.
- **Swap** (`createNarrowLabel()`): out → swap the word → in, one
  `--names-narrow-fade` (150 ms) each way; instant from empty, and instant
  under reduced motion. `refreshNames()` re-reads the word after a language
  switch.
- **Mounting — no media listener needed:** the label is driven at every width
  and CSS alone decides which surface renders (`--names-display` /
  `--names-narrow-display`, both in the narrow block). Rotating or resizing
  across 768 therefore has no swap code and no stale state (planned as a
  `matchMedia` branch; this is simpler and the swap check proves it).
- **Form** (`src/names/name-narrow.css`): fixed in the lane under the nav
  (`--names-narrow-top`), the lane's full width on the page ground so ticks,
  grades and the travelling rule pass beneath; the word is an upright column
  (`writing-mode: vertical-rl; text-orientation: upright`) at one 20 px
  `--name-transit-cell` per letter (1em glyph + `--names-narrow-tracking`),
  the desktop letters' sans semibold uppercase in the current-word ink.
  `--z-names-narrow: 170` — over the ruler (160), under the nav (180); the
  132 panel is in the top layer above both.
- **Longest word:** COMPÉTENCES (FR, 11 letters) is 228 px tall, bottom at
  y = 287 — inside the shortest phone viewport checked (iPhone SE 375×667).
  No step-down was needed. Landscape phones (844×390) are wider than 768, so
  they get the desktop layer, as before this ticket; the narrow column never
  applies there.

**Finding — the label's CSS cost first paint a round trip:** the first full
run held CLS and LCP but mobile performance fell 97 → **96** in all three
runs. The metric breakdown: FCP 1816 → **1958 ms**, everything else level.
Bisected file by file against HEAD: only `name.css` moved it, and padding
HEAD's `name.css` (4,074 bytes) with a 1.2 KB comment reproduced it exactly —
render-blocking bytes crossing a step in Lighthouse's simulated transfer, not
the rules. Since the label is never visible before `name.js` runs, its rules
moved to their own sheet, `src/names/name-narrow.css`, which `name.js`
inserts on the motion path after first paint (126's split); the element
ships `hidden` until the sheet's `display` takes over. `name.css` is
byte-identical to HEAD; FCP back to 1816 ms, performance 97. The new
`names.narrow-sheet-deferred` check fails if the sheet becomes a `<link>` or
the label loses `hidden`.

**Deviation from the plan:** "Mono uppercase" in the Form bullet — the
column uses the desktop names' sans semibold instead, so the phone word is
the same face as the desktop word it stands in for.

**Evidence (fresh, 2026-11-08):**

- `npm run verify`: **224 passed, 0 failed** (204 before + 20).
- `names.narrow-{375,390}-{en,fr}`: 12 depths each — the hero (empty), each
  section's boundary pixel and the pixel before it, and the page end — the
  label names exactly the reached section; `names.narrow-lane-*`: inside the
  lane, below the nav, every time.
- `names.narrow-swap`: 1440 → 375 → 769 → 768 → 1440, one surface each step.
- The desktop names checks, `flip.contact` and the letter-travel regressions
  green.
- Language switch while shown: SKILLS → COMPÉTENCES at once. Reduced motion:
  instant swaps; with motion, mid-fade 60 ms after a jump.
- Mobile Lighthouse **97 / 97 / 97**, LCP **2259 / 2261 / 2259 ms**, CLS
  **0.053**, a11y **100**. Desktop **99**, a11y **100**, CLS **0.009**.
- Screenshots: iPhone 13 EN/FR at the hero and every section, the 132 panel
  open over the label, 430 EN, 768 FR, Pixel 7 FR, iPhone SE FR — readable,
  no collision with nav, panel, grades or content, no horizontal scroll.

**Review (self):** two findings, applied — a raw `1em` in the CSS
(`tokens.no-literals`; now `--names-narrow-tracking`), and the harness first
read the label at 260 ms, inside the 300 ms out-and-in cross-fade (now
450 ms). Noted, by design: the label follows 130's discovery moment, so it
can name the next section while the sticky eyebrow still shows the previous
one (e.g. SKILLS under "02 / PROJECTS").

**Out of scope:** tap-to-open list, letter travel at narrow widths, the %
readout (stays retired), desktop names behaviour.

**Blocked by:** 132 (z-order against the open panel, and the bar height the
label pins under).

**Scope:**

- [x] `name.js`: narrow branch reusing `currentSection()`; media-change swap.
- [x] `name.css` + `tokens.css`: the narrow label, its tokens, its backing.
- [x] i18n: no new keys expected (reuses the rows' keys); language switch
      rebinds the label.
- [x] Harness: `names.narrow-{en,fr}` at 375 and 390 — label empty in the
      hero; at each band boundary (top crossing the bottom edge, ±1 px) it
      names the reached section; it never trails or leads by a section.
      `names.narrow-swap` — resize 1440 → 375 → 1440 leaves exactly one
      surface mounted. The existing desktop `names.*` checks stay green.
- [x] Decisions entry: the form, the longest-word measurement, the fade
      duration.

**Verify** (`.opencode/skills/visual-qa`, `.opencode/skills/scroll-motion`):

- [x] `npm ci && npm run verify` green, including `qa-124`-style letter-travel
      and `flip.contact` regressions on desktop.
- [x] Screenshots 375 / 390 / 430 / 768 EN + FR at hero, each section's
      handover, and the footer, plus device-emulated iPhone 13 and Pixel 7:
      the label readable, no collision with grades, nav, panel or content,
      no horizontal scroll.
- [x] Landscape phone (e.g. 844×390): the column fits or steps down.
- [x] Reduced motion at 375: instant swaps.
- [x] 1440 names layer unchanged.
- [x] Mobile Lighthouse median ≥ 90, LCP < 2.5 s, CLS ≤ 0.056, a11y 100
      (`name.js` loads on the motion path, after the paint — 126).
