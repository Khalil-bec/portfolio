/**
 * Single module entry for the portfolio.
 *
 * Ticket 001 shipped the scaffold; 002 added the smooth-scroll foundation; 003
 * adds the motion shell on top: the GSAP <-> Lenis bridge, the row reveals, and
 * the marquee ticker. Each init is a no-op under reduced motion, so the page
 * stays static and fully readable. Ticket 004 adds the i18n bootstrap, which
 * will call `refreshReveals()` / `refreshTicker()` after a language switch.
 */

import { initSmoothScroll } from "./motion/smooth-scroll.js";
import { initGsapBridge } from "./motion/gsap-bridge.js";
import { initReveals } from "./motion/reveals.js";
import { initTicker } from "./motion/ticker.js";

const { lenis, reducedMotion } = initSmoothScroll();

const motion = initGsapBridge(lenis, reducedMotion);
if (motion) {
  initReveals(motion.gsap, motion.ScrollTrigger);
}

initTicker(reducedMotion);
