# 001: Setup project scaffold

**What to build:** An empty but loadable static skeleton that every later ticket builds on: five anchored sections in fixed order with no real copy yet, plus verified vendor libraries ready to use.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `src/` layout exists per repo rules (`src/sections/<name>/` per section with html partial + css + js, `src/styles/tokens.css`, `src/i18n/`)
- [ ] `index.html` has five empty sections in order hero → projects → skills → education → contact with anchors `#hero`, `#projects`, `#skills`, `#education`, `#contact`
- [ ] `/vendor` verified only (no re-download): Lenis 1.3.x JS+CSS and GSAP 3.15 JS + ScrollTrigger present, headers/pinned versions match; no other dependencies added
- [ ] Page loads locally with no 404s and no hardcoded visible copy (keys/placeholders only)
- [ ] Design tokens live only as CSS variables in `src/styles/tokens.css`; vanilla ES modules, no build step
