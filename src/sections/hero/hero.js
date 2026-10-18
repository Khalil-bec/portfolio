// Hero section behaviour (ticket 118): the backdrop's scroll drift.
//
// The backdrop chips read a single unitless counter CSS publishes nothing of
// its own: hero.js is the seam that writes it. One `--hero-scroll` counter on
// the section per frame (scroll-inked chrome, the ruler marker's
// JS-driven-chrome precedent) — CSS geometry translates it per chip through
// the per-chip --chip-drift token, so JS owns no pixel math and CSS owns no
// loop. The registration rides the driver's view list (114's seam): one frame
// per mode, exactly like the names layer.
//
// Gating: reduced motion or a failed driver → the module never registers, the
// counter is never written, and the calc sits at its --chip-drift-still zero —
// the backdrop hangs static. No scroll lock, no listeners of its own.

/** The last scrollY written; the counter only set-props on real movement. */
let lastPublished = -1;

export function initHero(driver, reducedMotion) {
  const section = document.querySelector("[data-section='hero']");
  if (!section) return;

  // The sticky index bar is in-flow (106), so it shares the cell's height. The
  // head's min-height subtracts it, measured live, so the hero cell ends
  // exactly at one viewport and the ticker band starts at the fold. Same
  // layout-parameter pattern as --eyebrow-top: a runtime-measured number
  // written to a custom property; tokens.css keeps only the 0px no-JS
  // fallback, and a ResizeObserver re-syncs reflows (zoom, font swap).
  const index = section.querySelector(".section__index");
  if (index) {
    const root = document.documentElement;
    const write = () => root.style.setProperty(
      "--hero-index-h", `${Math.ceil(index.getBoundingClientRect().height)}px`
    );
    write();
    // No disconnect fn: hero registers once per load and main.js keeps no
    // cleanup handles for any init module (the initNav precedent) — the
    // observer dies with the page, not with a teardown nobody calls.
    new ResizeObserver(write).observe(index);
  }

  if (!driver || typeof driver.setView !== "function") return;
  if (reducedMotion) return; // the static backdrop is the reduced experience

  driver.setView({
    render({ scrollY }) {
      if (Math.abs(scrollY - lastPublished) < 0.5) return;
      lastPublished = scrollY;
      section.style.setProperty("--hero-scroll", String(scrollY));
    },
  });
}
