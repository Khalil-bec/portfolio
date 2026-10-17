# 107: Nav restyle (height, blur band, mono labels, boxed hover)

**What to build:** The §4 nav pass from `doc/inspo-vs-product-colors-borders.md`: bar height toward the inspiration's ~48px (ours was 63px), translucent blurred background (same analytically-AA band formula as the 106 brows), mono uppercase link labels, and a boxed inverted hover affordance on links. Full-bleed geometry, keyboard order, copy, and the lang switch's existing inverted active pill stay as-is. No scroll-spy (the nav has no current-section state; that would be new behavior, not a restyle).

**Blocked by:** 106 (committed `12c783f`).

**Status:** ready-for-agent

- [ ] Bar measures ~47-49px tall at 1440 (was 63px); wraps handled by the existing mechanism; `--eyebrow-top` re-syncs automatically to the shorter nav
- [ ] Nav background is the translucent blurred band (`backdrop-filter: blur`), shared token with the brows (renamed `--overlay-bg`), over-scrolled-content readable (muted ≥4.5:1 worst-case)
- [ ] Link labels mono + uppercase at the xs size; hover draws the inverted box (white bg, dark text) without shifting layout (padding + negative margin trick)
- [ ] Token gate clean; zero copy changes; reduced motion + keyboard pass unchanged (19 stops); no overflow at 375/768/1440 EN/FR; zero console errors
