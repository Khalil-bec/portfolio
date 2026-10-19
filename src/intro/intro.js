import { readTimeToken } from "../motion/tokens.js";

// Load intro (tickets 120 + 122): the mark splits into its two letterforms and
// each is dragged into its own place inside the hero name.
//
// The stage lives INSIDE the hero (ticket 122), absolutely covering the band,
// with no cover and no full-screen background: the nav and the page chrome stay
// visible and only the hero's own content is gated. Every position is measured
// at run time — the mark's seat is the hero title's optical centre, and each
// letter's destination is the ink box of the real character in the real <h1>
// (canvas font metrics + the span's own rect), so nothing is modelled from a
// glyph table and no copy is duplicated.
//
// Division of labour: tokens.css owns every VALUE (durations, ratios, glow) and
// intro.css owns every settled style; this module owns the SEQUENCE and the two
// moving transforms. Durations are read from the `--intro-*` tokens with
// `readTimeToken`, so pacing has a single source.
//
// Gating contract (unchanged from 120):
//   - index.html's boot guard sets html[data-intro="run"] BEFORE first paint and
//     skips it under reduced motion or when JS is off;
//   - this module refuses anything but that flag, and mounts the stage early so
//     the guard's 3s failsafe can see it;
//   - `start()` is called by main.js once the dictionaries have bound the name
//     (the split needs the real text to measure). It splits the <h1> into
//     per-character spans, measures, and runs the beats;
//   - reduced motion never reaches the stage at all.
//
// Abort paths: a resize, or the i18n engine replacing the <h1>'s children (a
// language switch mid-intro), finishes the intro immediately — the name is
// restored to plain text and the stage unmounts. A stalled intro never wins.

// Artwork geometry (facts of the traced paths, like nav.css's 1.344): the
// mark's 923:687 canvas, the stylized K's 730:818 and the standalone B's
// 105:162 viewBoxes. The stage derives its boxes from these, never from a
// guessed glyph metric.
const MARK_ASPECT = 923 / 687;
const K_ASPECT = 730 / 818;
const B_ASPECT = 105 / 162;

/** Smooth in-out: a deliberate drag that settles instead of snapping. The JS
 * analogue of `--ease-standard`, the same stance reveals.js takes. */
function ease(p) {
  return p * p * (3 - 2 * p);
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

/** Build the stage's three SVG art pieces (authored chrome, no innerHTML —
 * the repo audit's rule). Each piece is one <use> onto the symbol block. */
function buildStage() {
  const stage = document.createElement("div");
  stage.className = "intro";
  stage.setAttribute("aria-hidden", "true");

  for (const [className, symbol] of [
    ["intro__mark", "#brand-mark"],
    ["intro__letter intro__letter--k", "#brand-k"],
    ["intro__letter intro__letter--b", "#brand-b"],
  ]) {
    const piece = document.createElement("span");
    piece.className = className;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", symbol);
    svg.append(use);
    piece.append(svg);
    stage.append(piece);
  }

  return stage;
}

/** Split a bound name into per-character spans (chrome spans, no innerHTML).
 * Spaces stay text nodes so the name keeps wrapping naturally at narrow
 * widths. The text stays in the document, so AT and selection are unaffected. */
function splitName(name) {
  const text = name.textContent;
  if (!text) return [];
  const fragment = document.createDocumentFragment();
  const spans = [];
  for (const character of text) {
    if (character === " ") {
      fragment.append(document.createTextNode(character));
      continue;
    }
    const span = document.createElement("span");
    span.className = "intro__char";
    span.textContent = character;
    fragment.append(span);
    spans.push(span);
  }
  name.replaceChildren(fragment);
  return spans;
}

/** Canvas context for font metrics (one per page, not per measurement). */
const metrics = document.createElement("canvas").getContext("2d");

/** A character's INK box in viewport coordinates: a span reports its advance
 * box, but a letterform has to land on its drawn ink. The font's own metrics
 * give the baseline and the ink extents. */
function inkRect(span) {
  const style = getComputedStyle(span);
  metrics.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const text = metrics.measureText(span.textContent);
  const rect = span.getBoundingClientRect();

  const ascent = text.fontBoundingBoxAscent;
  const descent = text.fontBoundingBoxDescent;
  const baseline = rect.top + (rect.height - (ascent + descent)) / 2 + ascent;

  return {
    left: rect.left - text.actualBoundingBoxLeft,
    top: baseline - text.actualBoundingBoxAscent,
    width: text.actualBoundingBoxLeft + text.actualBoundingBoxRight,
    height: text.actualBoundingBoxAscent + text.actualBoundingBoxDescent,
  };
}

/** The name's cap height in px, from the font's own metrics. */
function capHeight(span) {
  const style = getComputedStyle(span);
  metrics.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return metrics.measureText("H").actualBoundingBoxAscent;
}

/**
 * Mount the stage. Returns `{ start }`, or `null` when the intro must not run.
 */
export function initIntro(reducedMotion) {
  const root = document.documentElement;

  // Reduced motion never set the flag (the boot guard skipped it), and a
  // cleared flag means the 3s head failsafe already rescued a dead boot.
  if (reducedMotion || root.getAttribute("data-intro") !== "run") return null;

  const hero = document.querySelector("[data-section='hero']");
  const name = hero?.querySelector(".hero__name");
  if (!hero || !name) {
    root.removeAttribute("data-intro");
    return null;
  }

  // The name is dict-bound and the stage mounts before the dictionaries land:
  // keep the (still empty) element hidden so a late bind can never flash.
  name.classList.add("is-pending");

  const stage = buildStage();
  hero.append(stage);

  return { start: () => start({ root, hero, name, stage }) };
}

function start({ root, hero, name, stage }) {
  const spans = splitName(name);
  name.classList.remove("is-pending");
  name.classList.add("is-split");

  const mark = stage.querySelector(".intro__mark");
  const k = stage.querySelector(".intro__letter--k");
  const b = stage.querySelector(".intro__letter--b");

  const kIndex = spans.findIndex((span) => span.textContent === "K");
  const bIndex = spans.findIndex((span) => span.textContent === "B");

  const revealed = new Set();
  let frame = 0;
  let done = false;
  let observer = null;
  let started = 0;

  /** Finish immediately: the settled page, no stage, no gated content. */
  const settle = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener("resize", settle);
    // Drop the gate first: without it the name's spans are plain text again.
    root.removeAttribute("data-intro");
    name.classList.remove("is-split", "is-pending");
    stage.remove();
  };

  // The dictionary can fail (or bind an empty name) and the split can miss its
  // two letters (another language's name): nothing to assemble, so settle.
  if (kIndex === -1 || bIndex === -1) {
    settle();
    return;
  }

  const timings = {
    markIn: readTimeToken("--intro-mark-in", 300),
    hold: readTimeToken("--intro-hold", 250),
    split: readTimeToken("--intro-split", 250),
    drag: readTimeToken("--intro-drag", 700),
    charFade: readTimeToken("--intro-char-fade", 300),
    charStagger: readTimeToken("--intro-char-stagger", 12),
    glyphFade: readTimeToken("--intro-glyph-fade", 250),
    bloom: readTimeToken("--intro-bloom", 450),
  };

  // --- Measure -------------------------------------------------------------
  const heroRect = hero.getBoundingClientRect();
  const nameRect = name.getBoundingClientRect();
  // The mark takes the title's cap height: it reads as a placeholder for the
  // word, and the two letterforms can then slide out of it at their real size
  // with no scale change at all.
  const markHeight = capHeight(spans[kIndex]);
  const markWidth = markHeight * MARK_ASPECT;

  // The mark sits at the title's optical centre; its seats are the two
  // letterforms' own places inside the composite (left edge, right edge).
  const centreX = nameRect.left + nameRect.width / 2 - heroRect.left;
  const centreY = nameRect.top + nameRect.height / 2 - heroRect.top;

  mark.style.left = `${centreX}px`;
  mark.style.top = `${centreY}px`;
  mark.style.width = `${markWidth}px`;
  mark.style.height = `${markHeight}px`;
  mark.style.transform = "translate(-50%, -50%) scale(0.94)";
  mark.style.opacity = "0";

  /** A letter's destination is its character's ink box. Its start is that same
   * box translated onto the matching seat inside the mark — one uniform
   * translate, so the glyph is never distorted or re-scaled mid-drag. */
  function seatLetter(element, span, aspect, direction) {
    const ink = inkRect(span);
    const height = ink.height;
    const width = height * aspect;
    const left = ink.left - heroRect.left + (ink.width - width) / 2;
    const top = ink.top - heroRect.top;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.opacity = "0";

    const seatX = centreX + direction * (markWidth - width) / 2;
    const fromX = seatX - (left + width / 2);
    const fromY = centreY - (top + height / 2);
    element.style.transform = `translate(${fromX}px, ${fromY}px)`;

    return { element, fromX, fromY };
  }

  const seats = [
    seatLetter(k, spans[kIndex], K_ASPECT, -1),
    seatLetter(b, spans[bIndex], B_ASPECT, 1),
  ];

  // Every box is written; the stage may paint now (its pieces start at
  // opacity 0, so nothing flashes before the first frame).
  stage.classList.add("is-ready");

  // --- Timeline ------------------------------------------------------------
  const splitStart = timings.markIn + timings.hold;
  const dragStart = splitStart + timings.split;
  const landedAt = dragStart + timings.drag;
  const bloomStart = landedAt + timings.charFade * 0.7;
  const end = bloomStart + timings.bloom;

  // The other characters follow reading order from the landing frame; K and B
  // are already in place (as their stylized selves) and only cross-fade there.
  const characters = spans.filter((_, index) => index !== kIndex && index !== bIndex);

  const reveal = (span) => {
    if (revealed.has(span)) return;
    revealed.add(span);
    span.classList.add("is-in");
  };

  const draw = (now) => {
    const t = now - started;

    // Mark: in, hold, then dissolve as the two letterforms take its seats.
    if (t < timings.markIn) {
      const p = clamp01(t / timings.markIn);
      mark.style.opacity = String(p);
      mark.style.transform = `translate(-50%, -50%) scale(${0.94 + 0.06 * p})`;
    } else if (t < splitStart) {
      mark.style.opacity = "1";
      mark.style.transform = "translate(-50%, -50%) scale(1)";
    } else {
      mark.style.opacity = String(1 - clamp01((t - splitStart) / timings.split));
    }

    // Letterforms: fade in at their seats, then drag to their characters.
    const letterOpacity = t < landedAt
      ? clamp01((t - splitStart) / timings.split)
      : 1 - clamp01((t - landedAt) / timings.glyphFade);
    const p = ease(clamp01((t - dragStart) / timings.drag));
    for (const seat of seats) {
      seat.element.style.opacity = String(letterOpacity);
      seat.element.style.transform = `translate(${seat.fromX * (1 - p)}px, ${
        seat.fromY * (1 - p)
      }px)`;
    }

    // The name completes around the landed letters: K and B cross-fade in
    // place, everything else staggers in reading order.
    if (t >= landedAt) {
      reveal(spans[kIndex]);
      reveal(spans[bIndex]);
      characters.forEach((span, order) => {
        if (t >= landedAt + order * timings.charStagger) reveal(span);
      });
    }

    // The rest of the first viewport blooms as the name finishes landing.
    if (t >= bloomStart && root.getAttribute("data-intro") !== "bloom") {
      root.setAttribute("data-intro", "bloom");
    }

    if (t >= end) {
      settle();
      return;
    }
    frame = requestAnimationFrame(draw);
  };

  // A resize invalidates every measured target; a language switch replaces the
  // <h1>'s children, detaching the spans. Both settle rather than fly on stale
  // geometry.
  window.addEventListener("resize", settle, { once: true });
  observer = new MutationObserver(() => {
    if (!spans[0].isConnected) settle();
  });
  observer.observe(name, { childList: true });

  started = performance.now();
  frame = requestAnimationFrame(draw);
}
