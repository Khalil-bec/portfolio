/**
 * Row reveals (ticket 003).
 *
 * Calm scroll-in reveals for rows marked `[data-reveal]`, driven by GSAP +
 * ScrollTrigger. The hidden start state is applied in JavaScript only, so a
 * failed script (or reduced motion, where this is never called) leaves every
 * row fully visible — content is never hidden by CSS alone.
 *
 * Timing values are design tokens (src/styles/tokens.css) read at init. The ease
 * is a named GSAP curve, the JS analogue of `--ease-standard` (GSAP cannot
 * consume a raw cubic-bezier without CustomEase).
 *
 * `refreshReveals()` is the re-measure hook later tickets (004/005/006) call
 * after content or language changes move rows around.
 */

import { readNumberToken } from "./tokens.js";

const REVEAL_SELECTOR = "[data-reveal]";
const REVEAL_EASE = "power2.out";
const REVEAL_START = "top 85%";

let scrollTrigger = null;

/**
 * Reveal `[data-reveal]` rows as they enter the viewport.
 *
 * `gsap` / `ScrollTrigger` come from the bridge; when they are absent (reduced
 * motion) this is not called and rows stay visible.
 */
export function initReveals(gsap, ScrollTrigger) {
  if (!gsap || !ScrollTrigger) return;

  scrollTrigger = ScrollTrigger;

  const rows = gsap.utils.toArray(REVEAL_SELECTOR);
  if (rows.length === 0) return;

  const duration = readNumberToken("--reveal-duration", 0.7);
  const distance = readNumberToken("--reveal-distance", 24);
  const stagger = readNumberToken("--reveal-stagger", 0.08);

  gsap.set(rows, { autoAlpha: 0, y: distance });

  ScrollTrigger.batch(REVEAL_SELECTOR, {
    start: REVEAL_START,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: REVEAL_EASE,
        stagger,
        overwrite: true,
      }),
  });
}

/** Re-measure after content or language changes (called by later tickets). */
export function refreshReveals() {
  scrollTrigger?.refresh();
}
