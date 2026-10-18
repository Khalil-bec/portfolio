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
  if (!section || !driver || typeof driver.setView !== "function") return;
  if (reducedMotion) return; // the static backdrop is the reduced experience

  driver.setView({
    render({ scrollY }) {
      if (Math.abs(scrollY - lastPublished) < 0.5) return;
      lastPublished = scrollY;
      section.style.setProperty("--hero-scroll", String(scrollY));
    },
  });
}
