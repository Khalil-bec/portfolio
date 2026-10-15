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

/** Move DOM focus to an anchor target without fighting Lenis' own scrolling. */
function focusAnchorTarget(hash) {
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

  if (prefersReducedMotion() || typeof window.Lenis !== "function") {
    return { lenis: null, reducedMotion: prefersReducedMotion() };
  }

  const lenis = new window.Lenis({
    lerp: LERP,
    anchors: true,
  });

  return { lenis, reducedMotion: false };
}
