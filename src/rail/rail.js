/**
 * Side rail (ticket 103; settle dynamics since 108).
 *
 * Persistent right-side stack of the five section names in the inner edge
 * lane (between the content and the ruler). The links are real in-page anchors
 * reusing the nav labels (`nav.*` keys — zero new copy), so jumps, focus
 * moves, and language flips all ride existing machinery: Lenis `anchors` +
 * the smooth-scroll focus handler, and the i18n binder.
 *
 * The current section is tracked with an IntersectionObserver over the middle
 * viewport band (no per-frame layout reads) and surfaced twice: a visual
 * highlight plus `aria-current` on the active link.
 *
 * Since ticket 108 the rail also carries the progress of the read: every
 * section up to the furthest one reached is marked `data-discovered`, which
 * rail.css paints as "settled" (at rest, one step brighter). Entries past that
 * point stay gray and shifted. Discovery is monotonic — a section is never
 * un-marked when the reader scrolls back up — and on a mid-page load or deep
 * link the sections at or above the opening section start out settled.
 *
 * Under 768px the rail collapses to icon mode — drawn dots, with the label
 * text kept (font-size 0) so assistive tech still announces every stop.
 */

export function initRail() {
  const rail = document.querySelector("[data-rail]");
  if (!rail || typeof IntersectionObserver !== "function") return null;

  const links = [...rail.querySelectorAll('a[href^="#"]')];
  if (links.length === 0) return null;

  const byId = new Map();
  for (const link of links) {
    let id;
    try {
      id = decodeURIComponent(link.getAttribute("href").slice(1));
    } catch {
      continue;
    }
    if (id) byId.set(id, link);
  }

  // Document order, for deterministic tie-breaks below.
  const order = [...document.querySelectorAll("main .section")]
    .map((section) => section.id)
    .filter((id) => byId.has(id));

  // Latest known visibility ratio per section. Threshold steps re-fire the
  // callback as a section moves through the band, so the mark follows the
  // most-visible section in both scroll directions. When nothing intersects,
  // the previous mark stands.
  const ratios = new Map();
  let current = null;

  // Highest section index reached so far (ticket 108). A high-water mark, so
  // discovery only ever advances: scrolling back up never re-grays a section
  // the reader has already seen.
  let discoveredUpto = -1;

  function setCurrent(id) {
    if (id === current) return;
    current = id;

    for (const [key, link] of byId) {
      if (key === id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }

    // Settle the whole run up to the furthest section reached — not just the
    // argmax winner — so fast scrolls and jumps over intermediate sections
    // still mark them.
    const upto = order.indexOf(id);
    for (let i = discoveredUpto + 1; i <= upto; i++) {
      byId.get(order[i]).setAttribute("data-discovered", "");
    }
    if (upto > discoveredUpto) discoveredUpto = upto;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        } else {
          ratios.delete(entry.target.id);
        }
      }
      // Strict `>` keeps the earlier section on exact ties — a hair of
      // hysteresis against flicker at boundaries.
      let best = null;
      let bestRatio = -1;
      for (const id of order) {
        const ratio = ratios.get(id);
        if (ratio !== undefined && ratio > bestRatio) {
          best = id;
          bestRatio = ratio;
        }
      }
      if (best) setCurrent(best);
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  for (const id of order) {
    observer.observe(document.getElementById(id));
  }

  return { current: () => current };
}
