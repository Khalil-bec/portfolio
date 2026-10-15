# 003: Reveals + numbered sections + ticker shell

**What to build:** The motion identity on top of the smooth shell: calm row reveals on scroll, numbered-section rhythm, and a marquee ticker scrolling the tagline — all dead still under reduced motion.

**Blocked by:** 002 (needs the Lenis foundation + kill-switch pattern).

**Status:** ready-for-agent

- [ ] GSAP ScrollTrigger row reveals run with calm pacing on placeholder rows
- [ ] Numbered-section scaffold renders in fixed section order
- [ ] Ticker shell scrolls the active-language tagline (placeholder key only; real copy arrives with i18n/content tickets, zero new copy)
- [ ] With `prefers-reduced-motion`: no reveals, no ticker motion; all content fully readable without animation
- [ ] Respects reduced-motion from the start; no reference code or assets copied
