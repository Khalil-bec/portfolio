/**
 * Persistent navigation + language switch (ticket 004).
 *
 * The markup lives in `nav.html` (inlined into index.html by hand, per the 001
 * convention). Anchor clicks are handled globally by the smooth-scroll module
 * (src/motion/smooth-scroll.js), so this module only wires the switch: a click
 * on an EN/FR button asks the i18n engine to change language. Focus stays on the
 * pressed button; the engine updates `aria-pressed`.
 *
 * Keyboard reachability of the anchors and the switch comes for free from real
 * `<a>` / `<button>` elements with the shared `:focus-visible` ring.
 */

import { setLanguage } from "../i18n/i18n.js";

export function initNav() {
  const switcher = document.querySelector("[data-lang-switch]");
  if (!switcher) return;

  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (!button || !switcher.contains(button)) return;
    setLanguage(button.getAttribute("data-lang"));
  });
}
