/**
 * Persistent navigation + language switch (ticket 004) + the narrow menu (132).
 *
 * The markup lives in `nav.html` (inlined into index.html by hand, per the 001
 * convention). Anchor clicks are handled globally by the smooth-scroll module
 * (src/motion/smooth-scroll.js), so this module only wires the switch: a click
 * on an EN/FR button asks the i18n engine to change language. Focus stays on the
 * pressed button; the engine updates `aria-pressed`.
 *
 * Ticket 132: at ≤768 the link list is a popover opened by `.nav__menu`
 * (`popovertarget`). The platform owns the disclosure — open/close, Esc with
 * focus back on the button, light dismiss, the top layer — so the menu works
 * even if this module never loads. This module adds only what the platform
 * does not: `aria-expanded` mirrors the state, a chosen link closes the panel
 * (the jump itself stays with smooth-scroll), and widening past 768 closes it.
 *
 * Keyboard reachability of the anchors and the switch comes for free from real
 * `<a>` / `<button>` elements with the shared `:focus-visible` ring.
 */

import { setLanguage } from "../i18n/i18n.js";

function initMenu() {
  const list = document.getElementById("nav-list");
  const button = document.querySelector(".nav__menu");
  if (!list || !button || typeof list.hidePopover !== "function") return;

  const isOpen = () => list.matches(":popover-open");
  const close = () => {
    if (isOpen()) list.hidePopover();
  };

  list.addEventListener("toggle", (event) => {
    button.setAttribute("aria-expanded", String(event.newState === "open"));
  });

  // Runs before smooth-scroll's document-level handler (the event reaches the
  // list first), so the popover returns focus to the button and the jump's
  // own focus handling then moves it on to the section.
  list.addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) close();
  });

  const narrow = window.matchMedia("(max-width: 768px)");
  narrow.addEventListener("change", () => {
    if (!narrow.matches) close();
  });
}

export function initNav() {
  initMenu();

  const switcher = document.querySelector("[data-lang-switch]");
  if (!switcher) return;

  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (!button || !switcher.contains(button)) return;
    setLanguage(button.getAttribute("data-lang"));
  });
}
