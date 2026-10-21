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
 *
 * Ticket 126 splits the boot into a critical path and a motion path. The hero
 * copy is the LCP element; before this, the module graph and the deferred
 * vendor scripts (GSAP/ScrollTrigger/Lenis, ~140 KiB) both had to finish before
 * the dictionaries could bind, pushing the first text paint past 3.8 s on
 * throttled mobile. Now this module's only static import is the i18n engine:
 * bind the copy, then load the intro and the motion shell.
 */

import { initI18n } from "./i18n/i18n.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rescue a dead intro: drop every gate it may have stamped, so the settled
 * hero is always readable even when the boot pipeline fails mid-way. */
function abortIntro() {
  document.documentElement.removeAttribute("data-intro");
  document.querySelector(".intro")?.remove();
  document.querySelector(".hero__name")?.classList.remove("is-pending", "is-split");
}

/** Insert a classic vendor script after the critical paint. Resolves on both
 * load and error: a failed vendor is a supported fallback, never a hang.
 * Dynamically inserted scripts are async; the GSAP -> ScrollTrigger promise
 * chain below is what enforces their order. */
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", resolve, { once: true });
    document.head.append(script);
  });
}

/** GSAP before its plugin; Lenis independent of both, so it loads alongside. */
function loadVendors() {
  return Promise.all([
    loadScript("vendor/gsap-3.15.0.min.js").then(() =>
      loadScript("vendor/ScrollTrigger-3.15.0.min.js"),
    ),
    loadScript("vendor/lenis-1.3.27.min.js"),
  ]);
}

// ---- critical path: dictionaries -> hero copy -----------------------------

await initI18n();

// Yield through two frames so the just-bound copy can paint before any
// post-critical request starts. Without this, the intro/motion imports are
// issued in the same task as the bind and share the connection with the LCP
// text on a throttled phone; Lighthouse's simulation then charges the first
// text paint for the whole motion shell.
await new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

// The intro is a desktop-only gate (index.html boot guard). Mount it right
// after the bind so the guard's 3 s rescue only fires when the bind itself
// stalls; phones skip the import entirely. The CSS gate holds the name hidden
// until the split, so moving the mount later cannot flash it.
if (document.documentElement.getAttribute("data-intro") === "run") {
  try {
    const { initIntro } = await import("./intro/intro.js");
    initIntro(reducedMotion)?.start();
  } catch {
    abortIntro();
  }
}

// ---- motion path: vendors + modules, only after the copy has painted ------

const vendorsReady = loadVendors();
const motionReady = Promise.allSettled([
  import("./motion/smooth-scroll.js"),
  import("./motion/gsap-bridge.js"),
  import("./motion/scroll-driver.js"),
  import("./motion/reveals.js"),
  import("./motion/eyebrows.js"),
  import("./motion/ticker.js"),
  import("./ruler/ruler.js"),
  import("./names/name.js"),
  import("./nav/nav.js"),
  import("./sections/hero/hero.js"),
]);

/** A module that failed to load, or whose init threw, must not take the rest
 * of the page down: the critical path has already painted the copy, so a
 * broken motion module degrades to "that feature is absent", never to a blank
 * or broken page. */
function safely(label, run, fallback = null) {
  try {
    const value = run();
    return value === undefined ? fallback : value;
  } catch (error) {
    console.error(`[portfolio] ${label} failed:`, error);
    return fallback;
  }
}

/** The settled module namespace, or null when its import rejected. */
function loaded(index) {
  const result = modules[index];
  return result.status === "fulfilled" ? result.value : null;
}

const modules = await motionReady;
await vendorsReady;

const scroll = safely("smooth-scroll", () => loaded(0)?.initSmoothScroll());
const lenis = scroll?.lenis ?? null;

// The scroll driver owns scroll position and keyboard scrolling (ticket 102);
// its chrome frame rides the bridge loop when Lenis runs, or its own minimal
// rAF when Lenis is absent (reduced motion / load failure) — exactly one loop
// either way, started only when nothing else frames.
const driver = safely(
  "scroll-driver",
  () => loaded(2)?.initScrollDriver({ lenis, reducedMotion }),
);

const motion = safely("gsap-bridge", () =>
  loaded(1)?.initGsapBridge(lenis, reducedMotion, () => driver?.frame()),
);

if (!lenis) driver?.startLoop();

if (motion) {
  safely("reveals", () => loaded(3)?.initReveals(motion.gsap, motion.ScrollTrigger));
}

safely("ticker", () => loaded(5)?.initTicker(reducedMotion));
safely("eyebrows", () => loaded(4)?.initEyebrows());
safely("ruler", () => loaded(6)?.initRuler(driver));
// The names layer rides the same driver frame (114): it reads scrollY per
// render and publishes state counters only; 115's letter travel respects the
// same reduced-motion kill-switch (the initTicker precedent).
safely("names", () => loaded(7)?.initNames(driver, reducedMotion));
// 118 joins the same frame for the hero backdrop's drift counter
// (--hero-scroll; CSS owns the per-chip math, this only publishes).
safely("hero", () => loaded(9)?.initHero(driver, reducedMotion));
safely("nav", () => loaded(8)?.initNav());
