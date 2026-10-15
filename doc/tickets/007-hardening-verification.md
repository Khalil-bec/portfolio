# 007: Hardening + verification

**What to build:** The v1 done-gate: proof the static site is fast, readable for everyone, and clean of hardcoded copy, stray deps, or copied reference code.

**Blocked by:** 002, 003, 004, 005, 006 (needs the full assembled site).

**Status:** ready-for-agent

- [ ] Lighthouse performance > 90
- [ ] Screenshot checks pass at 375px and 1440px (no overflow, no broken layout)
- [ ] Reduced-motion pass: no Lenis smoothing, no reveals/ticker motion, all content readable
- [ ] Keyboard-only pass: switch, anchors, all links reachable with visible focus; anchor jumps move focus sensibly
- [ ] Repo hygiene: tokens only in `tokens.css`, one section per `src/sections/<name>/`, vanilla ES modules with no build step, libraries only from `/vendor`, no reference code or assets, no hosting/deployment work
