/**
 * Scroll-driver seam (ticket 102).
 *
 * Single owner of scroll position: animated jumps go through Lenis when it is
 * active, instant jumps go straight to the window when it is not (reduced
 * motion, or Lenis failed to load). The ruler view (src/ruler/ruler.js)
 * renders through `frame()`; keyboard scrolling is re-implemented here so
 * arrows/space/page keys always drive through this seam (the native scrollbar
 * is hidden and the native fallback is explicitly dropped — see decisions).
 *
 * Frame ownership: exactly one loop calls `frame()` per mode. Under motion the
 * GSAP ticker (or the bridge fallback rAF when GSAP is missing) invokes it
 * alongside `lenis.raf`; without Lenis the driver runs its own minimal rAF.
 * main.js starts that loop only when no Lenis exists, so loops never double.
 *
 * Step sizes are JS tuning values, not CSS tokens (same precedent as LERP in
 * smooth-scroll.js).
 */

/** Fraction of the viewport per arrow press / per page press (shift/space map to pages). */
const ARROW_FRACTION = 0.12;
const PAGE_FRACTION = 0.88;

/** Selectors whose native key behaviour must survive (activation, caret, choice). */
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea, [contenteditable='true'], [role='button']";

let view = null;

function maxScroll() {
  const el = document.scrollingElement || document.documentElement;
  return Math.max(0, el.scrollHeight - window.innerHeight);
}

function clampY(y) {
  return Math.min(Math.max(0, y), maxScroll());
}

export function initScrollDriver({ lenis, reducedMotion }) {
  const instant = () => reducedMotion || !lenis;

  function scrollToY(y, { immediate = false } = {}) {
    const target = clampY(y);
    if (instant() || immediate) {
      if (lenis) {
        lenis.scrollTo(target, { immediate: true });
      } else {
        window.scrollTo(0, target);
      }
      return;
    }
    lenis.scrollTo(target);
  }

  function scrollBy(dy, options) {
    scrollToY(window.scrollY + dy, options);
  }

  /**
   * Readout pieces in the spec format: `EN 42%` / `FR 42 %` (non-breaking space
   * before `%` in French). The language tag is read from the dict-bound
   * language-switch buttons (the `lang.en` / `lang.fr` keys), so no copy lives
   * here — it follows the dictionaries live. Digits and `%` are chrome
   * (spec §Data, same sanction as `a11y.newTab`).
   *
   * `text` is the canonical formatted string (the slider's `aria-valuetext`).
   * Since 113 the visual readout is per-place digit drums only — the inspiration
   * shows no language tag — so the view consumes `french`/`percent` but not the
   * tag itself; it survives here because the format (and the `aria-valuetext`)
   * are 102's spec, and assistive tech keeps the full string.
   */
  function langTag(french) {
    const code = french ? "fr" : "en";
    const bound = document.querySelector(`[data-lang="${code}"]`)?.textContent.trim();
    return bound || (french ? "FR" : "EN");
  }

  function readoutParts(depth) {
    const french = document.documentElement.lang === "fr";
    const separator = french ? "\u00a0" : ""; // non-breaking space before % in French
    const value = Math.round(depth * 100);
    const text = `${langTag(french)} ${value}${separator}%`;
    return { french, percent: value, text };
  }

  /**
   * Push the current position into the ruler view (no-op before it mounts).
   * One read of `scrollY` per frame feeds every derived value, so the ruler's
   * document-space scale (ticket 110) translates by exactly the position the
   * readout was computed from — two reads could land a frame apart and show as
   * jitter between the scale and the handle. `pageHeight` is the height of the
   * document the scale is measured against.
   */
  function frame() {
    if (!view) return;
    const max = maxScroll();
    const scrollY = window.scrollY;
    const depth = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
    view.render({
      ratio: depth,
      scrollY,
      pageHeight: max + window.innerHeight,
      ...readoutParts(depth),
    });
  }

  /** Minimal rAF loop for the no-Lenis modes (reduced motion / load failure). */
  function startLoop() {
    const step = () => {
      frame();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /** Arrow/space scrolling works through the ruler driver (native fallback
   * explicitly dropped). Space on an interactive element keeps its native
   * behaviour (button/link activation); every other scroll key drives even
   * from interactive elements — arrows never activate controls, so focus
   * simply stays where it is while the page moves. */
  function onKeyDown(event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    const interactive = target instanceof Element && target.closest(INTERACTIVE_SELECTOR);

    const viewport = window.innerHeight;
    let dy = 0;
    let y = null;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        dy = viewport * ARROW_FRACTION;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        dy = -viewport * ARROW_FRACTION;
        break;
      case "PageDown":
        dy = viewport * PAGE_FRACTION;
        break;
      case "PageUp":
        dy = -viewport * PAGE_FRACTION;
        break;
      case "Home":
        y = 0;
        break;
      case "End":
        y = maxScroll();
        break;
      case " ":
        // Space activates focused buttons/links — never steal it from them.
        if (interactive) return;
        dy = event.shiftKey ? -viewport * PAGE_FRACTION : viewport * PAGE_FRACTION;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (y === null) {
      scrollBy(dy);
    } else {
      scrollToY(y);
    }
  }

  document.addEventListener("keydown", onKeyDown);

  return {
    scrollToY,
    scrollBy,
    maxScroll,
    frame,
    startLoop,
    /** The ruler view registers here so `frame()` can render into it. */
    setView(next) {
      view = next;
    },
  };
}
