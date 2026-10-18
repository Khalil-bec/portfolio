# 118: Hero reload — rings, skill chips, name/CTA/meta, skills ticker

**What to build:** the first viewport as the approved board: full-bleed headset backdrop (thin
concentric rings + 13 floating skill-logo chips with edge/blur/parallax), name + tagline + the
GitHub CTA + mono meta row in the centred column, ticker bound to the skill names.

**Blocked by:** 117 (brand symbol + nav shape settled); measured refs from the probes of
2026-10-18 (`probe-hero.mjs`).

**Decisions taken:**

- Backdrop wrapper `hero__backdrop` (`absolute inset-0`, `aria-hidden`, behind the column):
  (a) rings — 3 concentric hairline circles centred on the column (border `--color-border`,
  sizes as tokens, opacity stepped), (b) chips — the simple-icons glyph paths inlined per chip
  element (13 files under `src/sections/hero/assets/`, each `<use>`-less since per-file; one
  `<img>`? No — `mask-image` on a span, `background: currentColor`-tinted ink at tokenised
  alphas), sized/blurred per the measured tiers: edge chips big/sharp, centre chips small +
  `filter: blur(...)` with tokenised radii. Positions = percentage tokens (one per chip, keyed
  by name — declared in tokens.css as a block; the chip count stays a dict-free constant
  list in the partial).
- Parallax: the whole backdrop wrapper is `position: sticky`-less — a JS translate like 115:
  chips move by `scrollY * Δ` with per-chip factors (`--chip-drift-*` small ±, measured ~0.1–0.2
  on theirs), rings ~0.05. CSS owns the geometry; hero.js publishes one unitless depth counter
  (`--hero-scroll`) per frame via the driver's view list, CSS computes each chip offset —
  zero px math in JS, matching the 114/115 seam. `prefers-reduced-motion` → no drift (static).
- Chips stay decorative (`aria-hidden`); the skill names appear in the ticker + skills section.
- Content column: unchanged frame; the name keeps `--font-size-2xl`; tagline stays; new CTA row
  (filled-ink button: `background: var(--color-accent)`, text `--color-accent-contrast`,
  mono uppercase, `href="https://github.com/Khalil-bec"` + the `a11y.newTab` visually-hidden
  announce) + the meta line (`contact.location · hero.role`, mono, muted). The meta row =
  `hero__meta`; the cue chevron stays inside `hero__head`.
- Ticker: `data-ticker-source` binding switches from `hero.tagline` (text mode) to the new
  `skills.all[]` array (i18n arrays mode — the about-paragraph array precedent); the ticker
  engine renders N items then marquee-clones; ARIA unchanged.
- Dicts: `hero.role` = "DevOps & Infrastructure" (EN+FR identical string, new key);
  `skills.all` = the flattened tier items (EN/FR accordingly). `hero.tagline` stays static under
  the name (its 003 text-mode ticker use retired).
- Portrait slot: still inside the below-fold hero block — remove it in 119 with the promotion
  (not here), so 118 keeps the hero's below-fold block as-is except markup untouched.

**Scope:**

- [ ] 13 chip assets fetched → committed under `src/sections/hero/assets/` (simple-icons paths,
      zero-runtime external requests); hero.html partial + inlined copy in index.html.
- [ ] tokens.css: rings/chips/parallax/Cta tokens block; hero.css: the new backdrop + content
      styles, all through `var()`.
- [ ] hero.js: `--hero-scroll` publisher via the driver view list + reduced-motion gate.
- [ ] i18n en/fr: `hero.role`, `skills.all`; nav untouched.
- [ ] Baseline harness + new hero checks (rings presence/chips count/CTA href/ticker items)
      green; screenshots 375/1440 EN + FR + reduced; token gate clean; zero console errors.
- [ ] Code review; status row.

**Not in scope:** the intro overlay (120); the about promotion (119); the footer (121); the
nav (117 done).

**Status:** todo.
