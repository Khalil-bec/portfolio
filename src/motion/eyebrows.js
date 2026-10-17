/**
 * Keep the sticky eyebrow bars pinned flush under the nav (ticket 106).
 *
 * The bar's `top` offset is the nav's bottom edge. The nav reflows — it wraps
 * onto several rows on narrow screens, and language switches change label
 * widths — so the offset is measured from the live element and written to a CSS
 * custom property (`--eyebrow-top`, tokens.css keeps only the no-JS fallback)
 * instead of being hard-coded. Same layout-parameter pattern as the ticker's
 * measured loop width and the driver's LERP constants: a runtime-measured
 * number, not a design token. A ResizeObserver re-syncs whenever the nav's own
 * size changes; a passive-scroll observer is unnecessary because sticky
 * positioning follows scroll by itself.
 *
 * @returns {() => void} disconnect fn (symmetry with the other init modules).
 */
export function initEyebrows() {
  const nav = document.querySelector(".nav");
  const root = document.documentElement;
  if (!nav) return () => {};

  const sync = () => {
    // Round up so the bar never slides a sub-pixel under the nav's hairline.
    const height = Math.ceil(nav.getBoundingClientRect().height);
    root.style.setProperty("--eyebrow-top", `${height}px`);
  };

  sync();
  const observer = new ResizeObserver(sync);
  observer.observe(nav);
  return () => observer.disconnect();
}
