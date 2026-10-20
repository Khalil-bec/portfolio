/**
 * Smooth scroll — Lenis foundation (ticket 002).
 *
 * Owns the page's scroll feel: Lenis smooth scrolling with anchor handling,
 * the `prefers-reduced-motion` kill-switch, and sensible focus moves on anchor
 * jumps. This module no longer runs its own frame loop: ticket 003's GSAP
 * bridge (src/motion/gsap-bridge.js) drives `lenis.raf` from `gsap.ticker`, so
 * there is a single loop. The `lenis` instance returned here is what the bridge
 * consumes.
 *
 * Lenis is a vendored classic script (UMD) that exposes `window.Lenis`; it is
 * deferred so it has run before this module executes.
 */

/** Calm pacing per the spec (lerp ~0.12). Tuning value, not a CSS token. */
const LERP = 0.12;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}

/** A load-time landing (a `#hash` deep link) keeps its focus but must not draw
 * the global ring around the whole target — a section, the footer, any hash
 * target — on every refresh (ticket 124). The marker lasts only while the
 * element holds focus: moving away (Tab, a click elsewhere) restores the
 * normal ring behaviour. */
function silenceLandingRing(target) {
  target.classList.add("is-silent-landing");
  target.addEventListener(
    "blur",
    () => target.classList.remove("is-silent-landing"),
    { once: true },
  );
}

/** Move DOM focus to an anchor target without fighting Lenis' own scrolling.
 *
 * `silent` marks a load-time landing (a `#hash` deep link): focus still moves,
 * so the browser's sequential-focus starting point continues *inside* the
 * target and the first Tab is not thrown back to the top of the document — but
 * the target's ring is suppressed while it holds that focus. A
 * keyboard-activated jump is not silent and keeps its ring. */
function focusAnchorTarget(hash, silent = false) {
  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return;
  }
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
  if (silent) silenceLandingRing(target);
}

/** Delegate anchor clicks: let Lenis scroll, then move focus to the target. */
function onDocumentClick(event) {
  const link = event.target.closest?.('a[href^="#"]');
  if (!link) return;

  const hash = link.getAttribute("href");
  if (!hash || hash === "#") return;

  // A rAF lets Lenis' own click handler start the scroll first.
  requestAnimationFrame(() => focusAnchorTarget(hash));
}

/**
 * Initialise the smooth-scroll foundation.
 *
 * Returns `{ lenis, reducedMotion }` so later tickets can add the ScrollTrigger
 * bridge without re-plumbing vendor loading. When reduced motion is requested
 * (or Lenis failed to load) Lenis is never constructed: anchor jumps stay
 * instant and the CSS fallback in base.css holds.
 *
 * `prefers-reduced-motion` is read once, at init. A user who loads with reduce
 * on and later turns it off keeps instant jumps until reload; the reverse
 * direction is covered by Lenis' own `respectReducedMotion` default. Fail-safe
 * by design (deliberate, logged in doc/idea-v1-decisions.md).
 */
export function initSmoothScroll() {
  // Anchor focus is independent of Lenis: it must work on the reduced-motion
  // path too, where jumps are instant but still deserve sensible focus.
  document.addEventListener("click", onDocumentClick);

  // A deep link (`/#contact`) lands with the viewport at the target and
  // <body> focused: move focus there silently, so keyboard users continue from
  // where they are. Silent = no ring around the target on every load and
  // reload of a hash URL (ticket 124); the target is `tabindex="-1"` and the
  // exemption lasts only while it holds focus.
  // Back/forward history navigation is deliberately out of scope: Lenis does
  // not restore scroll on it, so focusing the target then would point
  // off-screen (deferred from ticket 002; logged in doc/idea-v1-decisions.md).
  if (window.location.hash && window.location.hash !== "#") {
    requestAnimationFrame(() => focusAnchorTarget(window.location.hash, true));
  }

  if (prefersReducedMotion() || typeof window.Lenis !== "function") {
    return { lenis: null, reducedMotion: prefersReducedMotion() };
  }

  const lenis = new window.Lenis({
    lerp: LERP,
    anchors: true,
  });

  return { lenis, reducedMotion: false };
}
