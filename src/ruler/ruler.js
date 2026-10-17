/**
 * Ruler readout + driver (tickets 102, 109).
 *
 * Fixed right-edge overlay in the outer edge lane (width `--lane-ruler`):
 * 0–100 ticks, a blue progress fill, and a draggable thumb carrying the
 * page-depth `%` readout (`EN 42%` / `FR 42 %`). The thumb is a real slider
 * (focusable, arrows/Home/End/PageUp/PageDown, `aria-valuenow` = depth %);
 * the keys themselves are handled globally by the scroll driver
 * (src/motion/scroll-driver.js), so focus stays on the thumb while it moves.
 *
 * The readout (ticket 109) is upright: a dict-sourced language tag over a row
 * of per-place **digit drums** — one clipped one-line window per decimal place
 * over a strip of chrome digits, rolled into place by a transform (the
 * mechanism measured on the inspiration, whose readout columns roll the same
 * way). The drums are built here because the digits are chrome (spec §Data
 * sanction), not copy; the formatted string the driver passes alongside the
 * pieces stays the slider's `aria-valuetext`.
 *
 * Dragging the thumb (pointer capture) jumps straight to the grabbed depth;
 * touch elsewhere scrolls natively while the ruler stays readout-only.
 * Digits and `%` are chrome, not copy (spec §Data); the slider name comes
 * from the `ruler.aria` dictionary key like any other string.
 */

let state = null;

/** Chrome digit glyphs, one strip line each (spec §Data: digits are chrome). */
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
/** Padding line: an nbsp keeps a padded drum one glyph wide (it never collapses). */
const BLANK = "\u00a0";

/**
 * One drum per decimal place, in reading order. `lines` is the strip top to
 * bottom; `index(depth)` is the line its window rolls to. The leading blanks
 * are padding: every drum stays one glyph wide, so the row never re-centres
 * (10% / 100%) and the readout never shows a leading zero.
 */
const DRUMS = [
  { lines: [BLANK, "1"], index: (depth) => (depth >= 100 ? 1 : 0) },
  { lines: [BLANK, ...DIGITS], index: (depth) => (depth < 10 ? 0 : (Math.floor(depth / 10) % 10) + 1) },
  { lines: DIGITS, index: (depth) => depth % 10 },
];

/** Build the tag + drum row inside the readout once; returns the mutable bits. */
function buildReadout(readout) {
  const tag = document.createElement("span");
  tag.className = "ruler__tag";

  const value = document.createElement("span");
  value.className = "ruler__value";

  // `\n`-joined lines: `white-space: pre` in ruler.css keeps them as rows.
  const strips = DRUMS.map((drum) => {
    const slot = document.createElement("span");
    slot.className = "ruler__drum";
    const strip = document.createElement("span");
    strip.className = "ruler__strip";
    strip.textContent = drum.lines.join("\n");
    slot.append(strip);
    value.append(slot);
    return strip;
  });

  const sign = document.createElement("span");
  sign.className = "ruler__sign";
  sign.textContent = "%";

  value.append(sign);
  readout.append(tag, value);

  return { tag, strips };
}


/** Move the page to the depth grabbed on the track (instant — follows the pointer). */
function jumpToClientY(clientY) {
  const { track, driver } = state;
  const rect = track.getBoundingClientRect();
  if (rect.height <= 0) return;
  const ratio = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
  driver.scrollToY(ratio * driver.maxScroll(), { immediate: true });
}

function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  state.thumb.setPointerCapture(event.pointerId);
  state.dragging = true;
  jumpToClientY(event.clientY);
}

function onPointerMove(event) {
  if (!state.dragging) return;
  jumpToClientY(event.clientY);
}

function endDrag() {
  state.dragging = false;
}

/**
 * Mount the ruler view against the driver. Renders nothing until the driver's
 * `frame()` calls `render()`; safe to call before the dictionaries bind (the
 * slider name fills via `data-i18n-attr` like the nav labels).
 */
export function initRuler(driver) {
  const ruler = document.querySelector("[data-ruler]");
  if (!ruler || !driver) return null;

  const track = ruler.querySelector("[data-ruler-track]");
  const progress = ruler.querySelector("[data-ruler-progress]");
  const thumb = ruler.querySelector("[data-ruler-thumb]");
  const readout = ruler.querySelector("[data-ruler-readout]");
  if (!track || !progress || !thumb || !readout) return null;

  const readoutNodes = buildReadout(readout);

  state = { ruler, track, progress, thumb, readout, readoutNodes, driver, dragging: false, lastText: "" };

  thumb.addEventListener("pointerdown", onPointerDown);
  thumb.addEventListener("pointermove", onPointerMove);
  thumb.addEventListener("pointerup", endDrag);
  thumb.addEventListener("pointercancel", endDrag);

  driver.setView({
    render({ ratio, percent, tag, french, text }) {
      const trackHeight = track.clientHeight;
      const thumbHeight = thumb.offsetHeight;
      const travel = Math.max(0, trackHeight - thumbHeight);
      progress.style.height = `${ratio * trackHeight}px`;
      thumb.style.top = `${ratio * travel}px`;
      if (text === state.lastText) return;
      state.lastText = text;
      readoutNodes.tag.textContent = tag;
      readout.classList.toggle("is-fr", french);
      DRUMS.forEach((drum, i) => {
        readoutNodes.strips[i].style.setProperty("--ruler-drum-index", String(drum.index(percent)));
      });
      thumb.setAttribute("aria-valuenow", String(percent));
      thumb.setAttribute("aria-valuetext", text);
    },
  });

  // Paint the initial position (top of page) even before the first frame, then
  // arm the roll one frame later: a mid-page load or deep link opens at its
  // depth with the drums already settled instead of spinning up from zero.
  driver.frame();
  requestAnimationFrame(() => readout.classList.add("is-live"));

  return state;
}

/** Re-render the readout (call after a language switch changes its format). */
export function refreshRuler() {
  if (!state) return;
  state.driver.frame();
}
