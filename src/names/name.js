/**
 * Fixed name layer (ticket 114 + 115): the inspiration's two-stack section
 * list, with the letter travel.
 *
 * One named anchor row per section rides a fixed full-viewport overlay under
 * the ruler lane (`--z-names: 150`): rows the page has passed pin to the top
 * stack (`--name-stack-top` at the 20px `--name-pitch`), the current section's
 * name sits at ~2× the letter size below them (`--name-word-gap` of air,
 * published as `--name-passed` and computed entirely in CSS), and the rows
 * still ahead stack from the bottom edge (`--name-stack-bottom`). Rows stay
 * in place while the page scrolls beneath.
 *
 * The travel (ticket 115, measured on the inspiration with a fine Y-sweep;
 * tickets 124 made it one-way and flipped the train's reading order): at a
 * one-step handoff **while scrolling down** the changing word's letters leave
 * their row and ride a **vertical train through the lane's column**, rising
 * exactly **1:1 with scroll** (it freezes mid-flight at idle — pure Y-mapping,
 * no time term). The word reads **forward from the top**: the first letter sits
 * on top, the last at the bottom, on one 20px `--name-transit-cell` pitch,
 * centred on the lane's axis. Each letter leaves the train the frame its
 * rendered train-Y crosses the exit line (~0.4·vh), easing on a short
 * time-based morph into its target position — so the arrival is staggered by
 * geometry alone (the topmost letter — the word's first — crosses first) and
 * lands in reading order.
 *
 * Scrolling **up** is never dynamic (124): no train spawns, and any train still
 * in the air snaps to its settled layout the moment the scroll reverses, so the
 * word that was current simply takes its place in the bottom stack.
 *
 * Mechanics: settled rows stay 114's token math — the row anchors and every
 * class/counter publish exactly as before. Only the flying letters move:
 * name.js takes the row's own letter spans, fixes them at the flip frame
 * (CSS `position: fixed` — the layer's box is the viewport) with `left/top`
 * written once at the spawn, repositions them per frame through the inline
 * `transform` alone, and restores them to
 * static flex **all at once when the word's flight completes**, so the whole
 * row lands in the flex layout measured at the flip (no post-landing slide).
 * Both endpoints are read, never modelled: the letters' rects are measured
 * immediately before the class flip (old positions) and again after it
 * (targets in the new state's layout) — one synchronous layout per handoff.
 *
 * The rows are real `<a href="#section">` elements (dict-bound `nav.*` labels):
 * the jump affordance and keyboard reachability ride the global anchor seam
 * (`src/motion/smooth-scroll.js`), exactly like the nav's links. `initNames`
 * splits each bound name into per-letter spans — **chrome** (aria-hidden),
 * the spans the travel moves — with the anchor's spoken name staying its
 * `aria-label`. JS publishes state classes, unitless counters (`--name-slot`
 * per row, `--name-passed` on the layer) and, during flights, the letters'
 * inline styles (the ruler marker's JS-driven chrome precedent); the settled
 * geometry lives in `name.css` as token math.
 *
 * Snap paths: a multi-step scrub never flies (letters take the settled
 * states directly); a handoff interrupting an active flight snaps it first
 * and reflys from clean state; an upward move snaps whatever is in the air
 * (124); resize and font loads re-measure, so a resize snaps flights too
 * (targets would be stale); the language switch re-splits the letters through
 * `refreshNames()`. The whole travel is gated off under
 * `prefers-reduced-motion` (handoffs stay 114's instant states) and when the
 * layer is unmounted (≤768 / `--names-display: none`).
 */

/** The current-state trigger: a section's top crossing the viewport's lower
 * quarter claims the current slot. Tuning constant, not a CSS token (the
 * driver's keyboard-step precedent, ticket 102). */
const TRIGGER = 0.25;

/**
 * The travel's tuning constants (115, measured on the inspiration — tuning
 * constants, not tokens: the keyboard-step precedent). The exit band measured
 * between 339 and 484 on a 1080 viewport → 0.4·vh; the travel is downward-only
 * (124), so there is no mirror line for the way back. Converge/exit are short
 * time-based settles; everything between them is scroll-locked (measured 1:1,
 * frozen at idle).
 */
const EXIT_TOP = 0.4;
const CONVERGE_MS = 240;
const EXIT_MS = 380;

/**
 * Split a bound name into letter spans (bottom-up, no innerHTML). Idempotent:
 * an anchor whose text has changed is freshly split, which is what the
 * language switch relies on through `refreshNames()`.
 */
function splitLetters(row) {
  const name = row.textContent;
  if (!name) return; // dict not bound yet (no-JS land never reaches here)
  const wrap = document.createElement("span");
  wrap.className = "names__letters";
  wrap.setAttribute("aria-hidden", "true");
  for (const letter of name) {
    const glyph = document.createElement("span");
    glyph.className = "names__letter";
    glyph.textContent = letter;
    wrap.append(glyph);
  }
  row.replaceChildren(wrap);
}

/** Each section's document-space top (the resize/measurement seam, not design;
 * measured whole-px so a fractional Lenis offset cannot flip a comparison on
 * its own — the same rounding stance the driver's scale took at 110). The
 * markup guarantees the ids, and a missing section only disables that row's
 * trigger, not the page. */
function measureTops(rows) {
  return rows.map((row) => {
    const section = document.getElementById(row.getAttribute("href").slice(1));
    return section ? Math.round(section.getBoundingClientRect().top + window.scrollY) : 0;
  });
}

/** Token values resolved to px. Custom properties reach getComputedStyle as
 * their authored token values (`1.25rem`, not 20px), so the rem part is
 * completed with the root's live size — a measurement, not a design value
 * (ruler.js's `measurePx`, shared seam). Copied, not imported, to keep the
 * names module self-contained like the rest of the layer's code. */
function measurePx(scope, name) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const value = parseFloat(getComputedStyle(scope).getPropertyValue(name));
  return Number.isNaN(value) ? 0 : Math.max(0, value * rem);
}

/** The eases behind the time-based phases (converge in, exit out). Cubic-out:
 * fast start, gentle settle — the exit lands with the letters visibly
 * slowing into their positions. */
function easeOut(p) {
  return 1 - (1 - p) * (1 - p) * (1 - p);
}

/** Read a row's letters as layout facts: viewport rect + computed font size.
 * Two reads per handoff — before the class flip (where the letters stand in
 * the old state) and after it (where flex will place them in the new one). */
function readLetters(row) {
  return [...row.querySelectorAll(".names__letter")].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      el,
      left: r.left,
      top: r.top,
      width: r.width,
      fs: getComputedStyle(el).fontSize,
    };
  });
}

/** Return a letter to the row's static flex layout (the CSS owns it again). */
function clearFlight(el) {
  el.style.position = "";
  el.style.left = "";
  el.style.top = "";
  el.style.transform = "";
  el.style.transformOrigin = "";
  el.style.fontSize = "";
  el.style.color = "";
}

/** Republish 114's state classes + unitless counters (pure CSS inputs). */
function publishStates(layer, rows, current) {
  layer.style.setProperty("--name-passed", String(current));
  rows.forEach((row, i) => {
    row.classList.toggle("is-current", i === current);
    row.classList.toggle("is-passed", i < current);
    row.classList.toggle("is-upcoming", i > current);
    row.style.setProperty(
      "--name-slot",
      String(i <= current ? i : rows.length - 1 - i), // passed/current: from the top; upcoming: from the bottom
    );
  });
}

function initNamesInternal(driver, reducedMotion) {
  const layer = document.querySelector("[data-names]");
  if (!layer || !driver) return null;
  const rows = [...layer.querySelectorAll("[data-name]")];
  if (rows.length === 0) return null;

  rows.forEach(splitLetters);

  /** Active flights: row → engine record (a one-word train). Two trains can
   * coexist — on a one-step handoff both the leaving and the arriving word
   * fly, as measured on the inspiration. */
  const flights = new Map();

  const state = {
    tops: measureTops(rows),
    // Sentinel: -99 never equals a real index/count, so the first frame
    // writes the states (the driver's `pageHeight: -1` pattern).
    lastCurrent: -99,
    // Sentinel: null until the first frame has published a position.
    lastScrollY: null,
    reducedMotion: Boolean(reducedMotion),
  };

  /** Can the page fly letters at all? The travel is gated off under
   * prefers-reduced-motion (read once at init — smooth-scroll's stance) and
   * when the layer is unmounted: ≤768 sets `--names-display: none`. */
  const flightable = () =>
    !state.reducedMotion && getComputedStyle(layer).display !== "none";

  /** Snap every active flight to its final state (letters restore to static
   * flex; the current row classes already describe the settled layout). */
  const completeFlights = () => {
    for (const rec of flights.values()) {
      for (const letter of rec.letters) clearFlight(letter.el);
    }
    flights.clear();
  };

  /** Spawn one word's train. Everything the flight needs is measured here —
   * no modelled glyph metrics: spawn rects (old layout), target rects (new
   * layout), the lane's axis and the cell pitch (tokens). */
  const spawnFlight = (row, spawns, targets, spawnY) => {
    const count = Math.min(spawns.length, targets.length);
    if (count === 0) return;
    const cell = measurePx(layer, "--name-transit-cell");
    const laneCenter = window.innerWidth - measurePx(layer, "--lane-ruler") / 2;
    flights.set(row, {
      row,
      spawnY,
      cell,
      laneCenter,
      trainTop0: spawns[0].top, // the train's top letter starts at the old slot
      start: performance.now(),
      letters: spawns.slice(0, count).map((s, j) => {
        const t = targets[j];
        // Fix the letter at its old position: out of flex, into the travel.
        s.el.style.position = "fixed";
        s.el.style.left = `${s.left}px`;
        s.el.style.top = `${s.top}px`;
        s.el.style.fontSize = s.fs; // hold the spawn size against the flip's
        s.el.style.transformOrigin = "top left";
        s.el.style.color = "var(--color-text-muted)"; // column ink (measured)
        return {
          el: s.el,
          sx: s.left,
          sy: s.top,
          sw: s.width,
          tx: t.left,
          ty: t.top,
          tw: t.width,
          slot: j, // reads forward from the top: first letter topmost
          exited: false,
          exitStart: 0,
          fx: 0,
          fy: 0,
        };
      }),
    });
  };

  /** Advance every flight to its position at (scrollY, now). All positions
   * are recomputed from formulas per frame — no incremental state — so a
   * frozen train sits exactly where the Y-mapping says (idle = frozen, as
   * measured). One exception: the page's own end — at max scroll the last
   * handoff's flight can outrun the remaining scroll (measured on the
   * inspiration too: its final word landed near the very bottom), so the
   * letters settle there: the end state of the page is always the settled
   * layout, never a parked train. */
  const updateFlights = (scrollY, vh, now) => {
    if (flights.size === 0) return;
    if (scrollY >= driver.maxScroll() - 0.5) {
      completeFlights();
      return;
    }
    const finished = [];
    for (const rec of flights.values()) {
      const rise = scrollY - rec.spawnY; // the train rides the page 1:1
      const exitLine = EXIT_TOP * vh;
      for (const letter of rec.letters) {
        if (letter.exited) {
          // Exit morph: ease the box from the train cell to the target, with
          // the scale carrying the size change (16→2× content, ×½ back).
          const p = Math.min(1, (now - letter.exitStart) / EXIT_MS);
          const e = easeOut(p);
          const bx = letter.fx + (letter.tx - letter.fx) * e;
          const by = letter.fy + (letter.ty - letter.fy) * e;
          const sEnd = letter.tw / letter.sw;
          const scale = 1 + (sEnd - 1) * e;
          letter.el.style.transform =
            `translate(${bx - letter.sx}px, ${by - letter.sy}px) scale(${scale})`;
        } else {
          // The train slot: the cell is centred on the lane's axis; its Y
          // maps 1:1 against scroll. Converge (a time ease) blends the row
          // position into the moving slot; once blended the letter cruises
          // locked to Y until it crosses the exit line.
          const trainY = rec.trainTop0 + letter.slot * rec.cell - rise;
          const trainX = rec.laneCenter - letter.sw / 2;
          const crossed = trainY <= exitLine;
          if (crossed) {
            letter.exited = true;
            letter.exitStart = now;
            // Freeze the cell the letter leaves from: its ease starts here
            // whether or not the train keeps moving underneath.
            letter.fx = trainX;
            letter.fy = trainY;
            letter.el.style.color = ""; // the new state's ink takes over at exit
            letter.el.style.transform =
              `translate(${trainX - letter.sx}px, ${trainY - letter.sy}px)`;
          } else {
            const p = Math.min(1, (now - rec.start) / CONVERGE_MS);
            const e = easeOut(p);
            const bx = letter.sx + (trainX - letter.sx) * e;
            const by = letter.sy + (trainY - letter.sy) * e;
            letter.el.style.transform =
              `translate(${bx - letter.sx}px, ${by - letter.sy}px)`;
          }
        }
      }
      // Complete a row's flight only when its LAST letter has settled: the
      // letters restore to flex all at once, so every landing sits exactly
      // at the flex layout measured at the flip (no per-letter slide).
      const settled = rec.letters.every(
        (letter) => letter.exited && now - letter.exitStart >= EXIT_MS,
      );
      if (settled) finished.push(rec);
    }
    for (const rec of finished) {
      for (const letter of rec.letters) clearFlight(letter.el);
      flights.delete(rec.row);
    }
  };

  // Re-measure on the things that reflow the sections: viewport size, and any
  // completed font load (a late webfont moves every band, and would strand a
  // flight's targets) — so both first snap any active flights.
  const remeasure = () => {
    completeFlights();
    state.tops = measureTops(rows);
  };
  window.addEventListener("resize", remeasure);
  if (document.fonts?.ready) document.fonts.ready.then(remeasure).catch(() => {});

  driver.setView({
    render({ scrollY }) {
      const vh = window.innerHeight;
      // Travel is downward-only (124): any upward step lands whatever is in
      // the air before the frame computes anything, so a frozen train never
      // rides back down. No epsilon — a slow drag arrives in sub-pixel deltas,
      // and every one of them is still an upward move.
      if (state.lastScrollY !== null && scrollY < state.lastScrollY) {
        completeFlights();
      }
      state.lastScrollY = scrollY;
      updateFlights(scrollY, vh, performance.now());

      // The current slot is the deepest section whose top has crossed the
      // trigger line; a resize re-measures (and re-renders) itself.
      const trigger = scrollY + TRIGGER * vh;
      let current = 0; // the first section is current before anything crosses
      for (let i = 1; i < state.tops.length; i += 1) {
        if (state.tops[i] <= trigger) current = i;
      }
      if (current === state.lastCurrent) return;

      const delta = current - state.lastCurrent; // the sentinel's first frame computes a scrub-sized jump
      if (delta === 1 && flightable()) {
        // A one-step handoff downward flies both changing words (115). An
        // upward handoff never flies (124): it takes the settle branch below.
        // An older flight still in the air snaps first — its targets are
        // stale once this flip's states land. Reads first (old layout), then
        // the class flip, then the target reads — the flip's writes fall
        // through to the browser's forced sync layout on the first rect read,
        // one reflow per phase.
        if (flights.size > 0) completeFlights();
        const outRow = rows[state.lastCurrent];
        const inRow = rows[current];
        const outOld = readLetters(outRow);
        const inOld = readLetters(inRow);
        publishStates(layer, rows, current);
        const outNew = readLetters(outRow);
        const inNew = readLetters(inRow);
        if (outOld.length && outNew.length) spawnFlight(outRow, outOld, outNew, scrollY);
        if (inOld.length && inNew.length) spawnFlight(inRow, inOld, inNew, scrollY);
      } else {
        // Scrub, an upward handoff, the sentinel first frame, or the travel
        // gated off: letters take the settled states directly (114's
        // behaviour); any active flight snaps rather than fly on stale targets.
        completeFlights();
        publishStates(layer, rows, current);
      }
      state.lastCurrent = current;
    },
  });

  return {
    /** Re-split the letters after a language switch, then re-measure/re-render.
     * Any active flight snaps first — its letters are about to be replaced. */
    refresh() {
      completeFlights();
      rows.forEach(splitLetters);
      state.tops = measureTops(rows);
      // Force the next frame to republish the states.
      state.lastCurrent = -99;
    },
  };
}

/** Persistent handle: `refreshNames()` is the language-switch hook (the
 * `refreshRuler` precedent), so the init result is kept here. */
let instance = null;

export function initNames(driver, reducedMotion) {
  instance = initNamesInternal(driver, reducedMotion);
  return instance;
}

export function refreshNames() {
  if (instance) instance.refresh();
}
