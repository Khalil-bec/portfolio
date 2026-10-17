# 108: Rail settle dynamics (grayish undiscovered → settle)

**What to build:** The "section list dynamics" mechanism the user named — our side rail (ticket 103) currently snaps between two colors with no sense of progress. Reimplemented behaviour, in our own words: rail entries for sections **not yet reached read gray and sit a step out toward the edge**; when their section is reached they **settle** — easing inward to their resting spot and brightening one step. The current section stays the brightest.

**Blocked by:** 107 (committed `e95a415`).

**Measured reference (getartcraft.com, 1440x900, dark):** their gutter/label system renders section words as per-letter spans that are individually transformed and gray (`color(srgb 0.617 0.614 0.607)` = warm gray) until reached, then settle to their final position/colour (JS-driven, `transition: all 0s` — frames, not CSS). Their sticky brow is `sticky top-12` with `bg-bg/60 backdrop-blur-md` — i.e. instant pinning, no settle there, so this ticket is rail-only. We reimplement the *behaviour* with CSS transitions, not their code.

**States + tokens (AA holds on every step; measured by compositing the ink alphas over `#121316`):**
- undiscovered → `--color-text-subtle` (5.6:1) and shifted toward the edge
- discovered → `--color-text-bright` (8.4:1, new step), at rest
- current → `--color-accent` (ink, 16:1), unchanged; `aria-current` keeps carrying the real state

The ramp stops at `--color-text-subtle`: a dimmer "undiscovered" step composites at ~4.8:1 — the same marginal zone ticket 007 already raised once (its `#767f8f` measured 4.85:1 on the v1 bg) — so it is not re-introduced. The ramp therefore widens *upward* with one new text step (`--color-text-bright`, 0.7 ink), and the `--space-xs` shift carries the rest of the "not reached yet" read. Screenshot-compared against the shipped `muted`-for-discovered version (`/tmp/opencode/108-{var,v,w,x,y}-*.png`): with two neighbouring grays the state change was nearly invisible, with three tiers the rail reads as a progress list.

**Status:** in-review

- [ ] Rail entries render `--color-text-subtle`, shifted `--space-xs` toward the edge, until their section is reached
- [ ] Reaching a section settles its entry inward to rest + `--color-text-bright` via a CSS transition (`--duration-base` / `--ease-standard`); the current entry is `--color-accent`
- [ ] Discovery is **monotonic**: a section never re-grays when scrolling back up; on a mid-page load/deep link everything at or above the current section starts settled
- [ ] Reduced motion: states swap instantly (existing global kill-switch covers the new transition) — no movement
- [ ] Mobile icon mode: dots follow the same ramp (`currentColor`)
- [ ] No copy, no markup, no new keys; `aria-current` unchanged; token gate clean; zero overflow/errors at 375/1440 EN/FR
- [ ] Keyboard walk unchanged (19 stops, measured on the four non-deep-link configs — the `#contact` load leaves focus on the target, so Chromium's walk starts mid-document there and that config measures load state only)
