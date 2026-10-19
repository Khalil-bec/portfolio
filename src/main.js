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
import { initNames } from "./names/name.js";
import { initI18n } from "./i18n/i18n.js";
import { initNav } from "./nav/nav.js";
import { initHero } from "./sections/hero/hero.js";
import { initIntro } from "./intro/intro.js";


const { lenis, reducedMotion } = initSmoothScroll();

/** Rescue a dead intro: drop every gate it may have stamped, so the settled
 * hero is always readable even when the boot pipeline fails mid-way. */
function abortIntro() {
  document.documentElement.removeAttribute("data-intro");
  document.querySelector(".intro")?.remove();
  document.querySelector(".hero__name")?.classList.remove("is-pending", "is-split");
}

// The intro boots first (tickets 120 + 122): the boot guard in index.html set
// html[data-intro="run"] before first paint; mounting the in-hero stage at the
// module's first statements keeps the gated window as short as possible.
// If anything in this boot pipeline dies, the head guard's 3s failsafe
// re-reveals (see intro.css's failsafe note) — a stalled intro never wins.
let intro = null;
try {
  intro = initIntro(reducedMotion);
} catch (error) {
  abortIntro();
}

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

// The split measures the real <h1>, so the intro starts only once the name is
// bound (ticket 122). A failure here must not leave the gate on.
try {
  intro?.start();
} catch (error) {
  abortIntro();
}

if (motion) {
  initReveals(motion.gsap, motion.ScrollTrigger);
}

initTicker(reducedMotion);
initEyebrows();
initRuler(driver);
// The names layer rides the same driver frame (114): it reads scrollY per
// render and publishes state counters only; 115's letter travel respects the
// same reduced-motion kill-switch (the initTicker precedent).
initNames(driver, reducedMotion);
// 118 joins the same frame for the hero backdrop's drift counter
// (--hero-scroll; CSS owns the per-chip math, this only publishes).
initHero(driver, reducedMotion);
initNav();
