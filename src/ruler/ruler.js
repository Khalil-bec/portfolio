/**
 * Ruler: document-space scale + travelling rule + hanging readout (tickets 102,
 * 109, 110; exact-scale form since 113).
 *
 * Fixed right-edge overlay in the outer edge lane (`--lane-ruler`, the
 * inspiration's measured 60px since 113): a scale that is as tall as the page
 * and slides 1:1 with the scroll past this fixed window, and a blue 1px rule
 * that travels a measured span (`--ruler-marker-top/bottom`) while the
 * readout — per-place **digit drums** + `%`, zero-padded like theirs — hangs
 * 4px below it and flips 2px clear above it at the travel's end (both measured
 * on them at 113's review; their readout does not sit on the rule). The grade
 * the readout passes over is covered (110's substitution, retargeted at the
 * hanging readout). The lane itself is the slider: `role="slider"` lives
 * on the ruler (whole-lane pointer drag with the inspiration's crosshair
 * cursor, `aria-valuenow`/`aria-valuetext` = depth), and the keys are handled
 * globally by the scroll driver (src/motion/scroll-driver.js). The 110 thumb
 * block retired at 113, as did the pinned `0`/`100` bounds and the lane's
 * inline-start border (they mount no separator at the ruler's left edge) —
 * the travelling readout carries the exact value, as on the inspiration.
 *
 * The scale (ticket 110) is the document itself: the driver publishes the
 * scroll position and the page height, this view writes them as custom
 * properties on the ruler, and CSS turns them into the layer's height and its
 * 1:1 slide — so the graduation gradient's percentage spacing *is* a document
 * position and the numbered grades ride the page with it. Grades are chrome
 * `0…100` rows built here.
 *
 * The readout (ticket 109) is a row of per-place digit drums — one clipped
 * one-line window per decimal place over a strip of chrome digits, rolled into
 * place by a transform (the mechanism measured on the inspiration, whose
 * readout columns roll the same way). Since 113 the row is zero-padded
 * (`078 %`, superseding the blank pad) and the dict-sourced tag row is gone —
 * the inspiration's readout shows none; the driver's formatted string stays
 * the slider's `aria-valuetext`, so assistive tech keeps the full
 * `EN 42%` / `FR 42 %` format.
 *
 * Dragging anywhere on the lane (pointer capture) jumps straight to the
 * grabbed depth — mapped through the marker's span, so the ends of the travel
 * are reachable at the edges of the lane; touch elsewhere scrolls natively.
 * Digits, grades and `%` are chrome, not copy (spec §Data); the slider name
 * comes from the `ruler.aria` dictionary key like any other string.
 */

let state = null;

/** Chrome digit glyphs, one strip line each (spec §Data: digits are chrome). */
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * One drum per decimal place, in reading order. `lines` is the strip top to
 * bottom; `index(depth)` is the line its window rolls to. Since 113 the row
 * is zero-padded like the inspiration's (`078 %`), so the leading drum needs
 * no blank padding line to stay one glyph wide — `0` is the pad.
 */
const DRUMS = [
  { lines: ["0", "1"], index: (depth) => (depth >= 100 ? 1 : 0) },
  { lines: DIGITS, index: (depth) => Math.floor(depth / 10) % 10 },
  { lines: DIGITS, index: (depth) => depth % 10 },
];

/** Numbered grades of the scale: one every 5% of the document, `0 … 100`.
 * Chrome, like the digits; the inspiration's own scale numbers every 5 too. */
const GRADE_STEP = 5;
const GRADE_INTERVALS = 100 / GRADE_STEP;

/**
 * Build the scale's numbered grades once. Each row is positioned by CSS from
 * its index (`--ruler-grade-index` × `--ruler-grade-step` of the scale layer's
 * height = a document position), so geometry stays in CSS.
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

/** Build the drum row inside the readout once; returns the mutable bits. */
function buildReadout(readout) {
  // `\n`-joined lines: `white-space: pre` in ruler.css keeps them as rows.
  const strips = DRUMS.map((drum) => {
    const slot = document.createElement("span");
    slot.className = "ruler__drum";
    const strip = document.createElement("span");
    strip.className = "ruler__strip";
    strip.textContent = drum.lines.join("\n");
    slot.append(strip);
    readout.append(slot);
    return strip;
  });

  const sign = document.createElement("span");
  sign.className = "ruler__sign";
  sign.textContent = "%";
  readout.append(sign);

  return { strips };
}

/**
 * Token values resolved to px. Custom properties reach getComputedStyle as
 * their authored token values (`3.75rem`, not 60px), so the rem part is
 * completed with the root's live size — a measurement, not a design value
 * (the same seam as the token widths the scales read).
 */
function measurePx(scope, name) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const value = parseFloat(getComputedStyle(scope).getPropertyValue(name));
  return Number.isNaN(value) ? 0 : Math.max(0, value * rem);
}

/** The marker's travel insets, resolved to px. */
function readInsets() {
  return {
    top: measurePx(state.ruler, "--ruler-marker-top"),
    bottom: measurePx(state.ruler, "--ruler-marker-bottom"),
  };
}

/** Move the page to the depth grabbed on the lane (instant — follows the pointer). */
function jumpToClientY(clientY) {
  const { track, insets, driver } = state;
  if (!insets) return; // the pointer fired before the first render measured anything
  const rect = track.getBoundingClientRect();
  if (rect.height <= 0) return;
  const span = Math.max(0, rect.height - insets.top - insets.bottom);
  if (span <= 0) return; // a 70px-tall viewport cannot host the marker's span
  const ratio = Math.min(Math.max((clientY - rect.top - insets.top) / span, 0), 1);
  driver.scrollToY(ratio * driver.maxScroll(), { immediate: true });
}

function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  state.ruler.setPointerCapture(event.pointerId);
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

// The narrow query does not touch these: the readout itself is retired <=768.

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
  const readout = ruler.querySelector("[data-ruler-readout]");
  if (!track || !scale || !readout) return null;

  const grades = buildScale(scale);
  const readoutNodes = buildReadout(readout);

  state = {
    ruler,
    track,
    readout,
    readoutNodes,
    grades,
    driver,
    dragging: false,
    lastText: "",
    // Sentinels: -1 never equals a real page height and null never equals an
    // offset (or an inset-cache key), so the first frame writes each property;
    // -99 never equals a grade index.
    pageHeight: -1,
    scaleOffset: null,
    markerOffset: null,
    insetsKey: "",
    insets: null,
    // Readout geometry (re-measured with the insets): one drum row, and the
    // two measured hanging insets (below the rule / clear above it).
    drumStep: 0,
    readoutGap: 0,
    readoutClear: 0,
    drumHalf: 0,
    coveredGrade: -99,
  };

  ruler.addEventListener("pointerdown", onPointerDown);
  ruler.addEventListener("pointermove", onPointerMove);
  ruler.addEventListener("pointerup", endDrag);
  ruler.addEventListener("pointercancel", endDrag);

  driver.setView({
    render({ ratio, percent, french, text, scrollY, pageHeight }) {
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

      // The travelling rule (ticket 113): linear map of the scroll ratio into
      // the measured marker span — top inset at rest, bottom inset at max —
      // exactly the mapping measured on the inspiration
      // (`y = 59.4 + 0.2056 · scrollY` at 1080 vp ≈ (vh − 70)/maxScroll). The
      // insets are viewport geometry, not document geometry, so they are cached
      // behind a key of the values that can change them: the track's height,
      // the width (the narrow query flips the lane, the ticks and the grade
      // inset at 768) and the root font size the rem completion multiplies in.
      const trackHeight = track.clientHeight;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const insetsKey = `${trackHeight}|${window.innerWidth}|${rem}`;
      if (insetsKey !== state.insetsKey) {
        state.insetsKey = insetsKey;
        state.insets = readInsets();
        // The readout's row height and the two hanging insets (measured on the
        // inspiration: 4px under the rule, 2px clear above it at the flip),
        // and one drum row for the covered-grade half-window: measurements,
        // not design values.
        state.drumStep = measurePx(ruler, "--ruler-drum-step");
        state.readoutGap = measurePx(ruler, "--ruler-readout-gap");
        state.readoutClear = measurePx(ruler, "--ruler-readout-clear");
        state.drumHalf = state.drumStep / 2;
        // The readout's presence rides the narrow query (tokens.css): when it
        // is retired, its box must not cover anything.
        state.readoutShown = getComputedStyle(readout).display !== "none";
      }
      const { top, bottom } = state.insets;
      const span = Math.max(0, trackHeight - top - bottom);
      const markerOffset = Math.round(top + ratio * span);
      // The readout hangs below the rule (review, measured on the inspiration)
      // until the below row would cross the marker's bottom travel line, where
      // it flips above the rule instead — their max-scroll geometry, so the
      // row never leaves the window.
      const readoutAbove =
        markerOffset + state.readoutGap + state.drumStep > trackHeight - state.insets.bottom;
      readout.classList.toggle("is-above", readoutAbove);
      if (markerOffset !== state.markerOffset) {
        state.markerOffset = markerOffset;
        ruler.style.setProperty("--ruler-marker-offset", `${markerOffset}px`);
      }

      // The grade the readout rides over is covered (the 110 substitution,
      // retargeted at the hanging readout at 113's review): the readout would
      // mush into the label it passes, and a number under the 1px rule reads
      // as struck-through ink, so the row goes blind while the readout's box —
      // or the rule itself — is on it. The readout box starts a measured inset
      // from the rule (below) or ends a measured clear above it (flipped), and
      // the whole test stays document space (the scale slides 1:1, so a
      // viewport offset maps straight to a page position).
      const readoutTop = readoutAbove
        ? markerOffset - state.readoutClear - state.drumStep
        : markerOffset + state.readoutGap;
      const trackTopDoc = docY; // document position at the track's top edge
      const ruleTopDoc = trackTopDoc + markerOffset - top;
      const readTopDoc = trackTopDoc + readoutTop - top;
      const gradeGap = pageHeight / GRADE_INTERVALS;
      const readCentre = readTopDoc + state.drumStep / 2;
      const nearestRead = Math.round(readCentre / gradeGap);
      const nearestRule = Math.round(ruleTopDoc / gradeGap);
      const covered =
        (state.readoutShown &&
        nearestRead >= 0 &&
        nearestRead <= GRADE_INTERVALS &&
        readTopDoc <= nearestRead * gradeGap + state.drumHalf &&
        readTopDoc + state.drumStep >= nearestRead * gradeGap - state.drumHalf
          ? nearestRead
          : nearestRule >= 0 &&
              nearestRule <= GRADE_INTERVALS &&
              Math.abs(ruleTopDoc - nearestRule * gradeGap) <= state.drumHalf
            ? nearestRule
            : -1);
      if (covered !== state.coveredGrade) {
        if (state.coveredGrade >= 0) state.grades[state.coveredGrade].classList.remove("is-covered");
        if (covered >= 0) state.grades[covered].classList.add("is-covered");
        state.coveredGrade = covered;
      }

      if (text === state.lastText) return;
      state.lastText = text;
      readout.classList.toggle("is-fr", french);
      DRUMS.forEach((drum, i) => {
        readoutNodes.strips[i].style.setProperty("--ruler-drum-index", String(drum.index(percent)));
      });
      // The slider semantics ride the lane since 113 (the thumb was 102/110's
      // handle; the a11y contract is unchanged — keys are the driver's).
      ruler.setAttribute("aria-valuenow", String(percent));
      ruler.setAttribute("aria-valuetext", text);
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
