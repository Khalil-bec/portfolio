---
name: scroll-motion
description: Use when adding or changing smooth scrolling, scroll reveals, pinning or marquee animation.
---
- Initialize Lenis once in src/js/scroll.js: `new Lenis({ lerp: 0.12, anchors: true })`.
- Sync with GSAP exactly like this:
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
- Register ScrollTrigger once; each section exports an `init()` that builds its own triggers.
- Reveals: opacity + translateY only (no layout-affecting properties), duration ~0.8, ease "power3.out".
- Videos: play/pause via IntersectionObserver, preload="none".
- If prefers-reduced-motion: do not create Lenis, skip tweens, show final state.
- Check Context7 for current Lenis/GSAP APIs before writing code.