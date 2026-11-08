# 132: Nav — one row on phones, the links fold behind a menu button

**Status:** `done` (2026-11-08) — `1e43568`. Reviewed, approved.

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

**What was built — the Popover API, not a hand-rolled toggle:**

The list is `<ul id="nav-list" popover>` and the button is
`<button popovertarget="nav-list">`. The platform owns the disclosure: open /
close, `Esc` with focus returned to the button, light dismiss (a tap outside),
the top layer (the panel sits above the ruler and every `--z-*` tier with no
token change), and the Tab order (the panel's links follow the button). So the
menu works even when `nav.js` fails to load, and without JS at all. Browsers
without popover support (`@supports not selector(:popover-open)`) hide the
button and get the pre-132 wrapped list back.

- **Markup** (`nav.html` + the `index.html` copy, in sync): the list's `id` +
  `popover`; the button between the list and EN/FR, with `aria-controls`,
  `aria-expanded` and two label spans bound to `nav.menu` / `nav.menuClose`.
- **Copy:** `nav.menu` "Menu" / "Menu", `nav.menuClose` "Close" / "Fermer".
- **CSS** (`nav.css`, tokens in `tokens.css`): above 768 the list is restyled
  back into the bar's inline row (author styles override the UA popover box);
  the button is `display: none`. At ≤768 the button is a hairline pill at the
  bar's right end, as tall as the language switch (`--nav-menu-h`), inverted
  on hover/focus/open like the links (107). The label swaps by CSS
  (`.nav:has(.nav__list:popover-open)`), so it holds without JS. The open
  panel is fixed, full width, hung from `--eyebrow-top`, with the bar's
  translucent band and hairline; each link is a row ≥ 44 px
  (`--nav-panel-row`). No transition, so reduced motion needs no branch.
- **JS** (`nav.js`): only what the platform does not do — `aria-expanded`
  mirrors the popover's `toggle` event, a chosen link closes the panel (the
  jump stays with smooth-scroll, whose focus move runs a frame later, after the
  popover's focus return), and widening past 768 closes it.
- **Retired:** 126's four row-count media blocks and the `--nav-list-h-*`
  tokens; the boot guard's early `lang` hint (its only pre-bind reader was that
  reservation — `scroll-driver.js` reads `lang` after i18n sets it).

**Deviation from the plan:** a language switch while the panel is open
**closes** it (the plan said keep it open). EN/FR sits outside the popover, so
the tap is a light dismiss; the language still switches. Kept: it behaves like
every other outside tap, and keeping it open would mean giving up light
dismiss (`popover="manual"`).

**Finding — the `--eyebrow-top` fallback was a guess that moved the hero:**
the first full run had mobile CLS **0.092** (was 0.056) and performance 95.
Lighthouse named a new shift on `.hero__ring--3`. The hero's min-height is
`100svh − --eyebrow-top`, and that token's pre-measure fallback was `4rem`
(64 px) until `eyebrows.js` wrote the measured bar. With the old two-row bar
(68 px at 412) the guess was nearly right (hero 759 → 754); with the one-row
47 px bar the hero grew 17 px when the measurement landed (759 → 776),
carrying the ring centred at 42 % with it. Since the bar is now one row at
every width, the fallback is its exact settled height:
`calc(var(--nav-menu-h) + var(--space-2xs) * 2 + var(--border-width))`. The
hero is now 776 px before and after; mobile CLS **0.053**, and desktop CLS
drops 0.071 → **0.009** (the 4rem guess was off there too). The new
`hero.fallback-height-{en,fr}` check was validated against the old token: it
fails at 4rem (759 vs 776) and passes now.

**Evidence (fresh, 2026-11-08):**

- `npm run verify`: **204 passed, 0 failed** (176 before; the reservation
  check becomes `nav.one-row-{en,fr}`, plus `nav.menu-*` (13),
  `nav.desktop-{769,1024,1440}`, `hero.fallback-height-{en,fr}` and their
  settles).
- `nav.one-row-*`: **47 px at every width** 320–768, before and after the
  bind, EN and FR — the same height as the desktop bar.
- `nav.menu-*` (iPhone 13 profile): closed label "Menu"; open → label
  "Close"/"Fermer", `aria-expanded` true, panel top = bar bottom (47), full
  width, four rows of 44 px; Esc closes with focus on the button; outside tap
  closes; a link closes and lands (`#skills` top = 1 px); keyboard Tab → Enter
  → Tab into the panel → Esc back to the button; widening to 1024 closes and
  restores the inline list.
- `keyboard.reachable` 28/28 at 1440 (the sweep now counts rendered controls
  only — the hidden menu button is not a stop on desktop).
- Mobile Lighthouse **97 / 97 / 97**, LCP **2259 / 2258 / 2259 ms**, CLS
  **0.053**, a11y **100**. Desktop **99**, a11y **100**, CLS **0.009**.
- Screenshots (iPhone 13 EN/FR, 320 FR, deep scroll, 768, 1440): one-row bar,
  "FERMER" fits at 320, the panel blurs the content beneath, the 1440 bar is
  unchanged.

**Review (self):** one finding, applied — the new fallback-height check
removed the measured `--eyebrow-top` and never restored it (the bar does not
resize, so `eyebrows.js` would not re-measure), which made the 412 pass
compare the fallback with itself; it now restores the value and fails if none
was measured. Noted for later, not this ticket: at 320 the hero meta line
("PAU, FRANCE • DEVOPS & INFRASTRUCTURE") runs past both screen edges
(clipped, no horizontal scroll; pre-existing).

**Out of scope:** adding an About link to the list (117/119 left it out — a
separate decision), the desktop bar, the names layer (133).

**Scope:**

- [x] `nav.html` + `index.html` inlined copy: button + `id`.
- [x] `en.json` / `fr.json`: `nav.menu`, `nav.menuClose`.
- [x] `nav.css` + `tokens.css`: narrow one-row bar, panel, retired
      reservation blocks.
- [x] `nav.js`: disclosure behaviour above.
- [x] Harness: replace `nav.reservation-{en,fr}` with `nav.one-row-{en,fr}` —
      the bar's height is one constant across the bind at 320, 359, 375, 390,
      430, 530, 565 and 768 in both languages; `nav.menu` — toggle,
      `aria-expanded`, Esc returns focus, link click closes and lands on its
      section, resize past 768 closes; `nav.desktop-unchanged` at 1024/1440.
- [x] Decisions entry: the retired reservation and the no-JS mechanism.

**Verify** (`.opencode/skills/visual-qa`):

- [x] `npm ci && npm run verify` green.
- [x] Screenshots 320 / 375 / 390 / 430 / 768 EN + FR, closed and open, plus
      device-emulated iPhone 13 and Pixel 7: one-row bar, FR "Fermer" fits,
      panel covers content cleanly, no horizontal scroll.
- [x] 1024 / 1440 bar unchanged.
- [x] Keyboard only at 375: Tab reaches the button, Enter opens, links
      reachable, Esc closes with focus back on the button.
- [x] Reduced motion and no-JS at 375: links reachable.
- [x] Mobile Lighthouse median ≥ 90, LCP < 2.5 s, CLS ≤ 0.056, a11y **100**
      (target-size on the panel rows and the button).
