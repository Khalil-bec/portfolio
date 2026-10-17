/**
 * Single module entry for the portfolio.
 *
 * Ticket 001 shipped the scaffold; 002 added the smooth-scroll foundation; 003
 * added the motion shell on top (the GSAP <-> Lenis bridge, the row reveals and
 * the marquee ticker). Ticket 004 adds the i18n bootstrap and the persistent
 * nav: dictionaries are loaded and bound *before* the ticker/reveals are
 * measured, so the refreshed copy (tagline length included) is what gets
 * measured. After a language switch the i18n engine calls the motion hooks.
 * Ticket 102 adds the scroll-driver seam (ruler readout/driver + keyboard
 * scrolling) between the bridge and the dictionaries.
 */

import { initSmoothScroll } from "./motion/smooth-scroll.js";
import { initGsapBridge } from "./motion/gsap-bridge.js";
import { initScrollDriver } from "./motion/scroll-driver.js";
import { initReveals } from "./motion/reveals.js";
import { initEyebrows } from "./motion/eyebrows.js";
import { initTicker } from "./motion/ticker.js";
import { initRuler } from "./ruler/ruler.js";
import { initRail } from "./rail/rail.js";
import { initI18n } from "./i18n/i18n.js";
import { initNav } from "./nav/nav.js";

const { lenis, reducedMotion } = initSmoothScroll();

// The scroll driver owns scroll position and keyboard scrolling (ticket 102);
// its chrome frame rides the bridge loop when Lenis runs, or its own minimal
// rAF when Lenis is absent (reduced motion / load failure) — exactly one loop
// either way, started only when nothing else frames.
const driver = initScrollDriver({ lenis, reducedMotion });

const motion = initGsapBridge(lenis, reducedMotion, () => driver.frame());

if (!lenis) driver.startLoop();

// Bind the dictionaries first: the ticker source and the reveal rows then carry
// their real text before either is measured.
await initI18n();

if (motion) {
  initReveals(motion.gsap, motion.ScrollTrigger);
}

initTicker(reducedMotion);
initEyebrows();
initRuler(driver);
initRail();
initNav();
