/**
 * Marquee ticker (ticket 003).
 *
 * A CSS keyframe marquee — not GSAP — scrolling the active-language tagline, so
 * it needs no frame loop of its own and dies with a single media query. The real
 * tagline text arrives with the i18n dictionaries (ticket 004); 003 only wires
 * the shell. The source element carries the `data-i18n` key; the clones copy its
 * text. `refreshTicker()` is the re-sync/re-measure hook that 004 calls after a
 * language switch, once the source element has been re-bound.
 *
 * Progressive enhancement:
 * - JS off / reduced motion: returns before building, so the source tagline stays
 *   a plain, readable, in-flow line (see motion.css).
 * - Empty tagline (003 alone, before 004 fills it): the ticker is hidden rather
 *   than rendered as a bar of separator dots.
 * - Motion on with text: the marquee is an in-flow band directly under the hero
 *   (ticket 101) that scrolls away with the page; the clones are `aria-hidden`,
 *   so a screen reader hears the tagline exactly once.
 */

import { readNumberToken } from "./tokens.js";

const SPEED_FALLBACK = 60;

let state = null;

/** A hidden-from-AT copy of the source item (visual repetition only). */
function makeItem(source) {
  const item = source.cloneNode(false);
  item.removeAttribute("data-ticker-source");
  item.removeAttribute("data-i18n");
  item.setAttribute("aria-hidden", "true");
  item.textContent = source.textContent;
  return item;
}

/** Add copies until one group is at least a viewport wide (seamless loop). */
function fillGroup(group, source, minWidth) {
  const MAX_ITEMS = 200; // safety cap: never spin if layout measurement fails
  group.append(makeItem(source));
  while (group.getBoundingClientRect().width < minWidth && group.childElementCount < MAX_ITEMS) {
    group.append(makeItem(source));
  }
}

/** Constant-speed marquee: duration = one group width / speed. */
function measure() {
  const group = state.track.querySelector(".ticker__group");
  if (!group) return;

  const width = group.getBoundingClientRect().width;
  if (width <= 0) return;

  const speed = readNumberToken("--ticker-speed", SPEED_FALLBACK) || SPEED_FALLBACK;
  state.track.style.setProperty("--ticker-duration", `${width / speed}s`);
}

/**
 * (Re)build both groups from the current source text. Idempotent: `source` is
 * held by reference, so a rebuild just moves it into the fresh group, which also
 * re-fills after a language switch changes the tagline length.
 */
function build() {
  const { track, source } = state;
  // One group must cover the band's own width for a seamless loop; fall back
  // to the viewport if the band is not laid out yet.
  const minWidth = state.ticker.clientWidth || window.innerWidth;

  const groupA = document.createElement("span");
  groupA.className = "ticker__group";
  track.replaceChildren(groupA);

  // The original source is the single announced copy; it heads the first group.
  groupA.append(source);
  fillGroup(groupA, source, minWidth);

  // Mirror the group for a seamless -50% translate; every clone is aria-hidden.
  const groupB = document.createElement("span");
  groupB.className = "ticker__group";
  groupB.setAttribute("aria-hidden", "true");
  for (let i = 0; i < groupA.childElementCount; i += 1) {
    groupB.append(makeItem(source));
  }

  track.append(groupB);
}

function sync() {
  const { ticker, source } = state;

  if (source.textContent.trim() === "") {
    ticker.classList.remove("ticker--live");
    ticker.classList.add("ticker--idle");
    return;
  }

  ticker.classList.remove("ticker--idle");

  // `.ticker--live` gives the track its `max-content`/flex layout, so groups
  // measure at their intrinsic width. Apply it before building.
  ticker.classList.add("ticker--live");

  build();
  measure();
}

/**
 * Mount the marquee. No-op under reduced motion: the tagline stays a static
 * in-flow line, fully readable without animation.
 */
export function initTicker(reducedMotion) {
  const ticker = document.querySelector("[data-ticker]");
  if (!ticker) return;

  const track = ticker.querySelector("[data-ticker-track]");
  const source = ticker.querySelector("[data-ticker-source]");
  if (!track || !source) return;

  state = { ticker, track, source, reducedMotion };

  // Nothing to scroll before the i18n dictionaries (ticket 004) fill the key.
  if (source.textContent.trim() === "") {
    ticker.classList.add("ticker--idle");
    return;
  }

  if (reducedMotion) return;
  sync();
}

/** Re-read the (re-bound) source text and re-measure (call after 004's switch). */
export function refreshTicker() {
  if (!state || state.reducedMotion) return;
  sync();
}
