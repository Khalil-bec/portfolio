/**
 * Fixed name layer (ticket 114): the inspiration's two-stack section list.
 *
 * One named anchor row per section rides a fixed full-viewport overlay under
 * the ruler lane (`--z-names: 150`): rows the page has passed pin to the top
 * stack (`--name-stack-top` at the 20px `--name-pitch`), the current section's
 * name sits at ~2× the letter size below them (`--name-word-gap` of air,
 * published as `--name-passed` and computed entirely in CSS), and the rows
 * still ahead stack from the bottom edge (`--name-stack-bottom`). Rows stay
 * in place while the page scrolls beneath — the settled states of their
 * scroll-linked motion (the layer measured states-only here; the letter
 * travel is ticket 115, so nothing on the layer transitions yet).
 *
 * The rows are real `<a href="#section">` elements (dict-bound `nav.*` labels):
 * the jump affordance and keyboard reachability ride the global anchor seam
 * (`src/motion/smooth-scroll.js`), exactly like the nav's links. `initNames`
 * splits each bound name into per-letter spans — **chrome** (aria-hidden), the
 * substrate the 115 transit will move — with the anchor's spoken name staying
 * its `aria-label`. JS publishes only state classes and unitless counters
 * (`--name-slot` per row, `--name-passed` on the layer); the geometry lives in
 * `name.css` as token math (the `--ruler-drum-index` pattern, ticket 109).
 *
 * The layer carries `data-names` and the rows `data-name`; it shows only
 * where the inspiration mounts it (≥769px; the narrow query sets
 * `--names-display: none` in tokens.css).
 */

/** The current-state trigger: a section's top crossing the viewport's lower
 * quarter claims the current slot. Tuning constant, not a CSS token (the
 * driver's keyboard-step precedent, ticket 102). */
const TRIGGER = 0.25;

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

function initNamesInternal(driver) {
  const layer = document.querySelector("[data-names]");
  if (!layer || !driver) return null;
  const rows = [...layer.querySelectorAll("[data-name]")];
  if (rows.length === 0) return null;

  rows.forEach(splitLetters);

  const state = {
    rows,
    tops: measureTops(rows),
    // Sentinel: -99 never equals a real index/count, so the first frame
    // writes the states (the driver's `pageHeight: -1` pattern).
    lastCurrent: -99,
  };

  // Re-measure on the things that reflow the sections: viewport size, and any
  // completed font load (a late webfont moves every band).
  const remeasure = () => {
    state.tops = measureTops(rows);
  };
  window.addEventListener("resize", remeasure);
  if (document.fonts?.ready) document.fonts.ready.then(remeasure).catch(() => {});

  driver.setView({
    render({ scrollY }) {
      // The current slot is the deepest section whose top has crossed the
      // trigger line; a resize re-measures (and re-renders) itself.
      const trigger = scrollY + TRIGGER * window.innerHeight;
      let current = 0; // the first section is current before anything crosses
      for (let i = 1; i < state.tops.length; i += 1) {
        if (state.tops[i] <= trigger) current = i;
      }
      if (current === state.lastCurrent) return;
      state.lastCurrent = current;

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
    },
  });

  return {
    /** Re-split the letters after a language switch, then re-measure/re-render. */
    refresh() {
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

export function initNames(driver) {
  instance = initNamesInternal(driver);
  return instance;
}

export function refreshNames() {
  if (instance) instance.refresh();
}
