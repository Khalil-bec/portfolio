# 123: Hero orbit — brand-coloured logos on a scroll-turned wheel

**What to build (user's ask, 2026-10-19):** the hero's floating logos are coloured (each
carries its own tool's mark), and as the page scrolls they move in a circular way — and the
circular lines behind them move too.

**Blocked by:** 122 (the hero correction; 123 lands in the same uncommitted tree).

**Decisions taken:**

- Chips carry their **official simple-icons brand colour**, one token per glyph
  (`--chip-color-<name>`), at one of three opacity tiers (`--chip-opacity-soft/mid/bright`)
  that replace the old ink-alpha tiers. GitHub and Flask both ship near-black marks —
  invisible on the ink-dark ground — so each takes the site ink; that is the only exception.
- The motion is **one wheel, not per-chip orbits**: an inner `.hero__orbit` wrapper turns the
  whole ring + chip group about the head's optical centre (`--hero-ring-cx/cy`) as the page
  scrolls, at `--hero-orbit-spin` degrees per scroll pixel. Every chip therefore travels a
  circular arc whose radius is its own distance from the centre (edge chips swing widest,
  centre chips barely) — the reference's cards-follow-the-ring behaviour. Each chip
  counter-rotates by the same angle so its glyph stays upright.
- A ring that is a circle centred on the pivot would show no motion when turned, so each ring adds its
  **own** spin (`--hero-ring-spin-1/2/3`) and is drawn as a hairline border under a conic mask: the
  line runs unbroken for most of its arc, then fades out over the last 40°
  (`--hero-ring-solid-angle/fade-angle`). The arcs therefore sweep visibly against the chips. The
  visible sweep is the wheel's rate *plus* the ring's own, so no `--hero-ring-spin-N` may equal the
  wheel's negated value — that ring would stand still (the review caught exactly that in the first
  pass).
- Scroll-linked, no time term (the 115/118 stance). Reduced motion or no JS never publishes
  `--hero-scroll`; the calc rests at its 0 fallback and the *motion* is absent. The settled look
  changes in exactly two ways: the chips carry colour, and each ring's arc fades out over its last
  40°.

**Scope:**

- [x] tokens.css: per-chip brand colours + opacity tiers; orbit + per-ring spin + ring-band
      tokens; retire the chip ink/drift and ring-drift tokens.
- [x] hero.css: `.hero__orbit` wheel; the ring drawn as a hairline border under a conic mask with
      its own spin; chips brand-coloured and counter-rotated; per-chip mapping updated.
- [x] hero.html + index.html inline: `.hero__orbit` wrapper; comments refreshed.
- [x] Verify: 1440/375 EN, 1440 FR, reduced motion, no-JS — colours right, chips travel
      circular arcs on scroll, rings sweep, no overflow, zero console errors; the settled
      composition holds the 122 layout with colour and the rings' fading arc as the only static
      changes.
- [x] Token gate clean; code review; status row.

**Verification (measured):** wheel `0.03°/px` (9° at scrollY 300, 18.6° at 620); ring net sweeps
+0.06/−0.03/+0.045°/px; chips counter-rotate exactly (`−18.6°` at 620) so glyphs stay upright;
chip travel 65–225 px along arcs by scrollY 620; brand colours resolve (docker `rgb(36,150,237)`,
linux `rgb(252,198,36)`, …), GitHub/Flask on site ink; reduced motion publishes nothing and every
transform is identity; no-JS settles static; zero errors and zero overflow at 1440/375 EN, 1440 FR.

**Review findings applied:** ring 2's own spin originally cancelled the wheel exactly
(`−0.03` vs `+0.03`), leaving that arc static — respun to `−0.06` (net `−0.03`); the ring band
moved from a masked conic background back to a hairline border under a conic mask, which keeps
the border's anti-aliasing; the mask's opaque stop became the tokenized ink rather than a raw
`black` keyword.

**Not in scope:** the intro (122), the footer (121), the moving bar, copy changes.

**Status:** done (`cdf92ee`).
