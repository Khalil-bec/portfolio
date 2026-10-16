/**
 * Row reveals (ticket 003).
 *
 * Calm scroll-in reveals for rows marked `[data-reveal]`, driven by GSAP +
 * ScrollTrigger. The hidden start state is applied in JavaScript only, so a
 * failed script (or reduced motion, where this is never called) leaves every
 * row fully visible — content is never hidden by CSS alone.
 *
 * The start state hides with `opacity`, not `autoAlpha`: `autoAlpha` also sets
 * `visibility: hidden`, which removes the row from the tab order and the
 * accessibility tree, so a keyboard user tabbing from the top could never reach
 * the repo/contact links inside an unrevealed row (ticket 007). Opacity keeps
 * them reachable; a `focusin` fallback snaps a focused row visible so the focus
 * ring is never painted on transparent content.
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
/** The revealed end-state, shared by the batch tween and the focusin fallback. */
const REVEALED = Object.freeze({ opacity: 1, y: 0 });

let scrollTrigger = null;
let initialized = false;

/**
 * Reveal `[data-reveal]` rows as they enter the viewport.
 *
 * `gsap` / `ScrollTrigger` come from the bridge; when they are absent (reduced
 * motion) this is not called and rows stay visible.
 */
export function initReveals(gsap, ScrollTrigger) {
  if (!gsap || !ScrollTrigger || initialized) return;

  scrollTrigger = ScrollTrigger;

  const rows = gsap.utils.toArray(REVEAL_SELECTOR);
  if (rows.length === 0) return;

  // Latch only once there is something to wire up, so a zero-row call (content
  // not yet bound) is retried by a later one instead of no-opping forever.
  initialized = true;

  const duration = readNumberToken("--reveal-duration", 0.7);
  const distance = readNumberToken("--reveal-distance", 24);
  const stagger = readNumberToken("--reveal-stagger", 0.08);

  gsap.set(rows, { opacity: 0, y: distance });

  ScrollTrigger.batch(REVEAL_SELECTOR, {
    start: REVEAL_START,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        ...REVEALED,
        duration,
        ease: REVEAL_EASE,
        stagger,
        overwrite: true,
      }),
  });

  // Keyboard fallback: reveal the row a focused control sits in, in case moving
  // focus there does not also scroll it into ScrollTrigger's range.
  document.addEventListener("focusin", (event) => {
    const row = event.target instanceof Element ? event.target.closest(REVEAL_SELECTOR) : null;
    if (row) gsap.set(row, REVEALED);
  });
}

/** Re-measure after content or language changes (called by later tickets). */
export function refreshReveals() {
  scrollTrigger?.refresh();
}
