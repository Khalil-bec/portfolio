/**
 * Ruler: document-space scale + readout (tickets 102, 109, 110).
 *
 * Fixed right-edge overlay in the outer edge lane (width `--lane-ruler`): a
 * scale that is as tall as the page and slides 1:1 with the scroll past this
 * fixed window, a blue position marker on the handle, and a draggable thumb
 * carrying the page-depth `%` readout (`EN 42%` / `FR 42 %`). The thumb is a
 * real slider (focusable, arrows/Home/End/PageUp/PageDown, `aria-valuenow` =
 * depth %); the keys themselves are handled globally by the scroll driver
 * (src/motion/scroll-driver.js), so focus stays on the thumb while it moves.
 *
 * The scale (ticket 110) is the document itself: the driver publishes the
 * scroll position and the page height, this view writes them as custom
 * properties on the ruler, and CSS turns them into the layer's height and its
 * 1:1 slide — so the graduation gradient's percentage spacing *is* a document
 * position and the numbered grades ride the page with it. Grades are chrome
 * `0…100` rows built here, like the `0`/`100` bounds in the markup.
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
 * Digits, grades and `%` are chrome, not copy (spec §Data); the slider name
 * comes from the `ruler.aria` dictionary key like any other string.
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

/** Numbered grades of the scale: one every 5% of the document, `0 … 100`.
 * Chrome, exactly like the `0`/`100` bounds in the markup; the inspiration's
 * own scale numbers every 5 too. */
const GRADE_STEP = 5;
const GRADE_INTERVALS = 100 / GRADE_STEP;

/**
 * Build the scale's numbered grades once. Each row is positioned by CSS from
 * its index (`--ruler-grade-index` × `--ruler-grade-step` of the scale layer's
 * height = a document position), so geometry stays in CSS. Returns the rows so
 * the render pass can cover the one the handle sits on.
 */
function buildScale(scale) {
  const grades = [];
  for (let i = 0; i <= GRADE_INTERVALS; i += 1) {
    const grade = document.createElement("span");
    grade.className = "ruler__grade";
    grade.textContent = String(i * GRADE_STEP);
    grade.style.setProperty("--ruler-grade-index", String(i));
    scale.append(grade);
    grades.push(grade);
  }
  return grades;
}

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
  const scale = ruler.querySelector("[data-ruler-scale]");
  const marker = ruler.querySelector("[data-ruler-marker]");
  const thumb = ruler.querySelector("[data-ruler-thumb]");
  const readout = ruler.querySelector("[data-ruler-readout]");
  if (!track || !scale || !marker || !thumb || !readout) return null;

  const grades = buildScale(scale);
  const readoutNodes = buildReadout(readout);

  state = {
    track,
    marker,
    thumb,
    readout,
    readoutNodes,
    driver,
    dragging: false,
    lastText: "",
    // Sentinels: -1 never equals a real page height and null never equals an
    // offset, so the first frame writes both scale properties; -99 never equals
    // a grade index.
    pageHeight: -1,
    scaleOffset: null,
    coveredGrade: -99,
  };

  thumb.addEventListener("pointerdown", onPointerDown);
  thumb.addEventListener("pointermove", onPointerMove);
  thumb.addEventListener("pointerup", endDrag);
  thumb.addEventListener("pointercancel", endDrag);

  driver.setView({
    render({ ratio, percent, tag, french, text, scrollY, pageHeight }) {
      // Document-space scale (ticket 110): the layer's height is the page and
      // its slide is the scroll position, so both are written only when they
      // change — the page height once per resize, the position rounded to whole
      // pixels so sub-pixel churn cannot re-invalidate style every frame. Like
      // `--eyebrow-top` they are complete px lengths, unlike the drums' unitless
      // ordinals, and the offset is published already negated so CSS can read it
      // straight into `translateY` with no unit math.
      const docY = Math.round(scrollY);
      const scaleOffset = -docY;
      if (pageHeight !== state.pageHeight) {
        state.pageHeight = pageHeight;
        ruler.style.setProperty("--page-height", `${pageHeight}px`);
      }
      if (scaleOffset !== state.scaleOffset) {
        state.scaleOffset = scaleOffset;
        ruler.style.setProperty("--scale-offset", `${scaleOffset}px`);
      }

      const trackHeight = track.clientHeight;
      const thumbHeight = thumb.offsetHeight;
      const thumbOffset = ratio * Math.max(0, trackHeight - thumbHeight);
      thumb.style.top = `${thumbOffset}px`;
      marker.style.top = `${thumbOffset}px`;

      // The handle's band is opaque, so a grade it sits on can only ever show
      // cut in half — which read as a rendering artefact in the visual pass (a
      // sliver under the handle at 39.9% depth). Cover that grade instead: at 5%
      // spacing against a 48px handle it is never more than one row, and the
      // handle's readout already carries the value — the substitution the
      // inspiration's readout makes for the label it sits on. Both sides are
      // document positions, so the test needs no measurement.
      const gradeGap = pageHeight / GRADE_INTERVALS;
      const handleCentre = docY + thumbOffset + thumbHeight / 2; // document position under the handle's centre
      const nearestGrade = Math.round(handleCentre / gradeGap);
      const coversGrade =
        nearestGrade >= 0 &&
        nearestGrade <= GRADE_INTERVALS &&
        Math.abs(handleCentre - nearestGrade * gradeGap) <= thumbHeight / 2;
      const covered = coversGrade ? nearestGrade : -1;
      if (covered !== state.coveredGrade) {
        if (state.coveredGrade >= 0) grades[state.coveredGrade].classList.remove("is-covered");
        if (covered >= 0) grades[covered].classList.add("is-covered");
        state.coveredGrade = covered;
      }

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
