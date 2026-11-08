# 132: Nav — one row on phones, the links fold behind a menu button

**Status:** `todo`

**Why (phone pass, 2026-11-08):**

> "yes the nav is 2 rows"

At ≤768 the bar holds the KB mark, four mono links (PROJECTS / SKILLS /
EDUCATION / CONTACT) and the EN/FR switch. The list wraps: measured in 126, EN
runs 2 rows at 376–529 px, 3 rows at 359–375, 4 rows ≤358; FR 2 rows at
393–564, 3 at 376–392, 4 ≤375. On a 390 px phone the bar is two rows tall and
reads cramped (device-emulation screenshots, Pixel 7 + iPhone 13). 126 accepted
the wrap and reserved each measured height (`nav.css:142–178`) so the bind
would not shift the page; this ticket replaces the wrap instead.

**Decision (user, 2026-11-08):** a menu button. On phones the bar is one row —
mark, EN/FR, menu button — and the four links open in a panel. Above 768
nothing changes. See `doc/idea-v3-decisions.md` (2026-11-08 phone pass).

**What to build:**

- **Markup** (`src/nav/nav.html` **and** its inlined copy in `index.html` —
  keep the pair in sync): a `<button class="nav__menu" type="button"
  aria-expanded="false" aria-controls="nav-list">` between the list and the
  language switch; the `<ul class="nav__list">` takes `id="nav-list"`. The
  button's visible label is mono uppercase like the links.
- **Copy** (`src/i18n/en.json`, `fr.json`): `nav.menu` ("Menu" / "Menu") and
  `nav.menuClose` ("Close" / "Fermer"); the label swaps with the state. No
  hardcoded text.
- **Layout** (`src/nav/nav.css`, tokens in `tokens.css`): at ≤768 the list is
  hidden until open and the button shows; at >768 the button is
  `display: none` and the bar is byte-for-byte today's. The open panel drops
  from under the bar, full width, same translucent ground and hairline border
  as the bar (107), links stacked one per row with ≥ 44 px rows (touch target)
  and the bar's boxed focus style. All sizes are new tokens.
- **Behaviour** (`src/nav/nav.js`) — the WAI **disclosure** pattern, not a
  modal (no focus trap, page stays scrollable):
  - The button toggles `aria-expanded` and the panel.
  - `Esc` closes and returns focus to the button.
  - Activating a link closes the panel; the jump itself still goes through
    the existing anchor path (002 smooth-scroll / 102 driver, 124 silent hash
    landing) — do not reimplement scrolling.
  - A tap outside the bar closes it; tabbing past the last link leaves it open
    (disclosure behaviour) — record if you choose otherwise.
  - Crossing above 768 (rotate / resize) closes it and clears the state.
  - A language switch while open keeps it open and rebinds the labels.
  - Reduced motion: the panel appears with no transition.
- **Retire 126's wrap reservation:** the four row-count media blocks in
  `nav.css` go; the bar has one height at every narrow width. Check whether the
  boot guard's early `lang` hint still has a consumer once the reservation is
  gone; remove it only if nothing else reads it, and record which.
- No-JS: the button does nothing without JS, so without JS the list must stay
  visible (e.g. gate the hiding on the boot's `data-motion`/JS flag). Record
  the mechanism.

**Out of scope:** adding an About link to the list (117/119 left it out — a
separate decision), the desktop bar, the names layer (133).

**Scope:**

- [ ] `nav.html` + `index.html` inlined copy: button + `id`.
- [ ] `en.json` / `fr.json`: `nav.menu`, `nav.menuClose`.
- [ ] `nav.css` + `tokens.css`: narrow one-row bar, panel, retired
      reservation blocks.
- [ ] `nav.js`: disclosure behaviour above.
- [ ] Harness: replace `nav.reservation-{en,fr}` with `nav.one-row-{en,fr}` —
      the bar's height is one constant across the bind at 320, 359, 375, 390,
      430, 530, 565 and 768 in both languages; `nav.menu` — toggle,
      `aria-expanded`, Esc returns focus, link click closes and lands on its
      section, resize past 768 closes; `nav.desktop-unchanged` at 1024/1440.
- [ ] Decisions entry: the retired reservation and the no-JS mechanism.

**Verify** (`.opencode/skills/visual-qa`):

- [ ] `npm ci && npm run verify` green.
- [ ] Screenshots 320 / 375 / 390 / 430 / 768 EN + FR, closed and open, plus
      device-emulated iPhone 13 and Pixel 7: one-row bar, FR "Fermer" fits,
      panel covers content cleanly, no horizontal scroll.
- [ ] 1024 / 1440 bar unchanged.
- [ ] Keyboard only at 375: Tab reaches the button, Enter opens, links
      reachable, Esc closes with focus back on the button.
- [ ] Reduced motion and no-JS at 375: links reachable.
- [ ] Mobile Lighthouse median ≥ 90, LCP < 2.5 s, CLS ≤ 0.056, a11y **100**
      (target-size on the panel rows and the button).
