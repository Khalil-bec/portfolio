# 002: Motion foundation (Lenis + anchors + kill-switch + focus)

**What to build:** The scroll feel an expert notices in the first seconds: buttery smooth in-page navigation that instantly collapses to plain jumps when reduced motion is requested, fully keyboard-reachable.

**Blocked by:** 001 (needs the anchored skeleton).

**Status:** ready-for-agent

- [ ] Lenis smooth scroll enabled with calm pacing (lerp ~0.12) and anchor handling on
- [ ] Anchor navigation reaches `#hero`, `#projects`, `#skills`, `#education`, `#contact` via smooth scroll; focus moves sensibly on jump
- [ ] `prefers-reduced-motion` kill-switch disables Lenis entirely (instant jumps, no smoothing) and all content stays readable
- [ ] Anchors and interactive controls reachable keyboard-only with visible focus from the start
- [ ] Verifiable on placeholder sections alone, before real copy lands
