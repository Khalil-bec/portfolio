# 131: Hero chips step down on phones

**Status:** `in-review` (2026-11-08) — implemented, screenshot-checked, self-reviewed;
awaiting the user's cap pick and commit approval.

**Why (phone pass, 2026-11-08):**

> "the hero thing, yes the logos are really big but they remain in the
> background and doesnt cover any text"

The live site was loaded under Playwright **device emulation** (Pixel 7 412×839
@2.625, iPhone 13 390×664 @3 — `isMobile`, `hasTouch`). The 13 brand chips
(118/123) dominate the first screen: Docker, Nginx, Tux and Ansible each reach
~22 % of the viewport width and sit right against the name, the tagline, the
meta line and the scroll cue. On the user's phone they stay *behind* the type,
so this is a **scale** defect, not a stacking one; the z-order is correct and
stays as is.

The cause is the narrow clamp: chip sizes are `min(--chip-<name>-size,
--chip-size-cap)` (`hero.css:124`) and `--chip-size-cap: 22vw` lets a chip
render at 83 px at 375 — the largest chips are 10–12 % of the width on 1440,
22 % on a phone.

**Decision (user, 2026-11-08):** smaller only. All 13 chips stay, the same
anchors, colours, opacity tiers, blur and orbit. No chip is hidden. See
`doc/idea-v3-decisions.md` (2026-11-08 phone pass).

**Measured before the change (2026-11-08, 375 / 390 / 430):**

- **Every chip already clamps to the cap** at phone widths (all 83 px at 375,
  86 at 390, 95 at 430; flask 80 / terraform 88 sit just under). The desktop
  size hierarchy (80–176 px) is already flattened on phones; lowering the cap
  keeps it flat, it does not newly lose it.
- **Chips cross the hero's inline edge by design**, at every width:
  kubernetes and python reach x = 1453 / 1456 at 1440, and the document never
  scrolls sideways. The planned "no chip box past the hero's edges" check was
  therefore wrong; it became "the document never scrolls sideways"
  (`hero.no-overflow-*`).

**What was built:**

- `src/styles/tokens.css`, inside the narrow `@media (max-width: 768px)`
  block: `--chip-size-cap: 14vw` (22vw stays the desktop value). The anchors
  are percentages, so the composition keeps its shape. At 768 the cap is
  107.5 px (tablets step down with phones — one boundary, 111); at 769 it is
  back to 169.2 px. No JS, no `hero.css` change.
- `tools/qa/verify.mjs`:
  - `openPage({ device })` — a named Playwright device profile (isMobile,
    hasTouch, DPR, UA); its WebKit browser hint is dropped since the harness
    drives Chromium.
  - `heroChipAudits()` — `hero.chip-cap-{375,390,430,768,769,1440}`: the live
    cap equals the expected vw ratio (±0.5 px), there are 13 chips, and none
    exceeds the cap (`offsetWidth`, which the orbit's rotation never changes);
    `hero.no-overflow-*` at the same widths.
  - Screenshot pass adds `iphone13-en` and `pixel7-fr` (device profiles) to the
    resized 375 shots.

**The cap value (user pick pending):** 13 / 14 / 15vw were rendered at 375,
390 and 430 next to today's 22vw. All three clear the name, tagline, CTA and
meta line; 14vw is the shipped default (52.5 px at 375, 60.2 at 430) — the
glyphs stay legible as brands without crowding. Changing it is one token plus
`NARROW_CAP` in `verify.mjs`.

**Evidence (fresh, 2026-11-08):**

- `npm run verify`: **176 passed, 0 failed** (162 before + 8 chip checks + 6
  device-screenshot settles); after the review fixes `verify:fast` **170 / 0**
  (the boundary pair adds 4).
- Mobile Lighthouse **97 / 97 / 97**, LCP **2257 / 2260 / 2255 ms**, CLS
  **0.056**, a11y **100**. Desktop **98**, a11y **100** — the 126 baseline,
  unchanged.
- Screenshots (iPhone 13 profile) 375 / 390 / 430 EN + FR at rest and
  mid-orbit (scrollY 300), 375 EN/FR reduced motion: chips read as
  background; the type stays above them (Ansible passes *behind* "PAU,
  FRANCE" mid-orbit — zoomed check); reduced motion shows the small chips,
  settled.
- 1440: cap 316.8 px = 22vw (`hero.chip-cap-1440`, `-769`); the token change
  is confined to the narrow block.

**Review (self, both axes):** two findings, applied — the token comment's
"~10 %" figure was wrong (largest desktop chips are 10–12 %), and the cap's
768/769 boundary was unchecked (now pinned). Noted, kept:
`hero.no-overflow-375` overlaps the existing `overflow.375-en`; it stays
because 390/430 had no overflow check.

**Out of scope:** chip count, anchors, colours, the ring geometry, desktop,
the flattened size hierarchy at phone widths (pre-existing; a per-chip narrow
scale would be its own ticket).

**Scope:**

- [x] `tokens.css`: narrow `--chip-size-cap` override, with a comment naming
      this ticket and the measured reason.
- [x] Harness: `hero.chip-cap-*` + `hero.no-overflow-*` (the edge rule
      corrected, above).
- [x] Harness: device descriptors in the screenshot pass.
- [x] Decisions entry: the shipped cap and why (the user's pick still to
      confirm).

**Verify** (`.opencode/skills/visual-qa`):

- [x] `npm run verify` green; the existing hero/orbit checks unchanged.
- [x] Screenshots 375 / 390 / 430 EN + FR, rest and mid-orbit.
- [x] Desktop untouched (cap pinned at 769 and 1440).
- [x] Reduced motion at 375.
- [x] Mobile Lighthouse median ≥ 90, LCP < 2.5 s, CLS ≤ 0.056, a11y 100.
