# 104: v2 hardening + verification

**What to build:** The v2 done-gate: proof the restyled static site is fast, readable for everyone, and clean of hardcoded copy, stray deps, or copied reference code.

**Blocked by:** 100, 101, 102, 103 (needs the full restyled site).

**Status:** ready-for-agent

- [ ] Lighthouse performance > 90
- [ ] Screenshot checks pass at 375px and 1440px in EN and FR (no overflow, no broken layout, no overlapping ruler/rail)
- [ ] Reduced-motion pass: no smoothing, no reveals/ticker motion, ruler instant, all content readable
- [ ] Keyboard-only pass: nav, rail, ruler, switch, and all links reachable with visible focus; jumps move focus sensibly
- [ ] Repo hygiene: tokens only in the token store, one section per section directory, vanilla modules with no build step, vendored libraries only, no reference code or assets, no hosting/deployment work
