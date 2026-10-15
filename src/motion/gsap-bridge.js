/**
 * GSAP <-> Lenis bridge (ticket 003).
 *
 * ScrollTrigger has to know when Lenis moves the page, and Lenis needs frames.
 * Ticket 002 ran its own requestAnimationFrame loop; 003 retires it and lets
 * GSAP's ticker drive Lenis instead, so there is exactly one frame loop.
 * gsap.ticker time is in seconds while Lenis.raf expects milliseconds, hence the
 * `* 1000`.
 *
 * GSAP and ScrollTrigger are vendored classic scripts (UMD globals) loaded,
 * deferred, before the single ES-module entry, so `window.gsap` and
 * `window.ScrollTrigger` exist by the time this runs.
 */

/**
 * Minimal frame loop used only if the vendor globals are missing. Lenis
 * preventDefaults wheel/touch scroll while it is active, so it must be driven
 * even when GSAP failed to load — otherwise the page would freeze.
 */
function driveLenis(lenis) {
  const step = (time) => {
    lenis.raf(time);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Wire Lenis into ScrollTrigger and hand the frame loop to GSAP.
 *
 * Returns `{ gsap, ScrollTrigger, lenis }` for the reveal module, or `null`
 * under reduced motion / when the vendor globals are absent. In the latter case
 * Lenis is still driven by a fallback rAF and no animation is set up, so the
 * page stays static but scrollable and readable.
 */
export function initGsapBridge(lenis, reducedMotion) {
  if (reducedMotion) {
    return null;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) {
    if (lenis) driveLenis(lenis);
    return null;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  return { gsap, ScrollTrigger, lenis };
}
