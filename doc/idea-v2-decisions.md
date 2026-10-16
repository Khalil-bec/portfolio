# Idea v2 — decisions

Append-only log. v1 decisions live in `doc/idea-v1-decisions.md`. Entries below are from the 2026-10-16 ArtCraft review + brainstorming (visual companion `layout.html` → `layout-v2.html`) and the to-spec pass. Spec: `doc/idea-v2-spec.md`.

## 2026-10-16 — inspiration inspection (getartcraft.com)

- **Inspected, not copied:** `https://getartcraft.com/` via webfetch (structure/copy) + bundled-Chromium screenshots (`/tmp/opencode/inspire-1440-{top,mid,bottom}.png`) and DOM probe (5 `section`s, nav + footer present, marquee matches, `data-ruler="on" data-ruler-side="right"`, vertical section-name rail, 0–100 ruler text). Per repo rule the feel is reimplemented; no reference code or assets enter the repo.
- **What it actually does:** light paper theme; top navbar (HOME/IMAGE/VIDEO/RESOURCES/DOWNLOAD/SUPPORT/CRAFT APPS/PRICING/LAUNCH APP); giant wordmark hero over orbit rings with floating cards; in-flow marquee band (model names) under the hero that scrolls away; 1px table-cell divisions with numbered headers (`01 / CRAFTING FEATURES`, `02 / OWNERSHIP`); right-edge ruler 0–100 with ticks + blue progress + `%` at the thumb; vertical clickable section names (FEATURES/OWNERSHIP/COMMUNITY/GET STARTED) tracking scroll; large multi-column footer + `©` bar.
- **User reads confirmed:** table divisions, under-hero ticker, ruler-with-%, clickable side rail. **Corrected reads:** the inspiration HAS a navbar and a full footer — dropping them is the user's call, not faithful copying.

## 2026-10-16 — strategy A chosen (user-directed)

- **Chosen:** layout-v2 option A — faithful translation into our dark theme. Single scroll-driver seam (Lenis bridge + ruler sync, one rAF loop); rail module reusing nav labels; styling via tokens/cell borders. Option B (rail only appears on scroll) rejected for v2; may return if A feels noisy.
- **Visual companion:** server on `http://localhost:53091/?key=…` (`/tmp/brainstorm-233843-1792175483/`, no `--project-dir` so nothing lands in the repo). Clicks only highlight + log to `state/events` (user tried A/B/C, last B) — new screens appear only after a terminal reply. That is the tool's design, not a defect.

## 2026-10-16 — to-spec clarifications (user-answered)

- **Nav stays (user override):** the sticky top nav keeps the 5 anchors + EN/FR switch; the rail mirrors the same jumps. Rationale: switch/anchors already hardened there (focus moves, `aria-pressed`, storage whitelist); a rail-only switch would re-solve all of it.
- **Ruler replaces native (user override):** thin right overlay (ticks + blue progress + `%`) drives scroll; native scrollbar hidden. Single rAF loop retained.
- **Fallback dropped (user-approved, explicit):** "you can ignore that rule if it means i get what is demanded." Native-scroll fallback is gone: no-JS cannot scroll (ruler is JS-driven), reduced-motion loses smoothing/instant-jump and keeps only static position reflection + readable content, keyboard scrolling must be re-implemented through the ruler. Logged as an accepted a11y regression vs v1; the spec states it openly instead of pretending the old gates still hold.
- **Dark, ends at contact:** no light-theme flip; no footer or credits bar after contact.
- **Copy discipline:** rail reuses nav/section heading keys; `%`/digits are chrome (same sanction as `a11y.newTab`); `content.md` and dictionaries otherwise unchanged.
- **Ticker:** in-flow under hero, scrolls away; `has-ticker` body padding retired; idle/empty + reduced-motion static behavior preserved.
- **Seams agreed:** scroll driver is the one main seam; rail module + styles follow. No new dependencies; libraries still only from `/vendor`.

## 2026-10-16 — spec published (uncommitted)

- **Files:** `doc/idea-v2-spec.md` created (goal/scope/non-goals/endpoints/data/acceptance); this log created. Not committed — never commit without explicit approval.
- **Next:** break into tickets (to-tickets, 100-series in `doc/tickets/`), then implement one ticket → screenshot check (375px/1440px) → code review → stop.

## 2026-10-16 — v2 implementation run: session decisions (user-answered)

- **Approval gate waived (user override):** for the v2 run (tickets 100–104) the `AGENTS.md` "never commit without my approval" rule and the `status.md` approval requirement are waived. After each ticket's screenshot check + code review passes (no Critical findings), commit and push to `main` directly, recording the SHA in `doc/status.md`.
- **`code-review` substitutes `code-review-expert`:** no `code-review-expert` skill exists in this repo; each ticket's review uses the existing `code-review` skill (Standards + Spec axes, parallel sub-agents) against the diff since the previous commit.
- **Full run, no stopping:** all five v2 tickets (100 → 101 → 102 → 103 → 104) execute end-to-end in one session instead of stopping after each ticket per the `AGENTS.md` workflow.

## 2026-10-16 — ticket 100 implemented (table divisions + edge lanes)

- **Cell model:** every `.section` gets `border-inline` + `border-block-end` (base.css). Each section's bottom border is the divider beneath it; the table's top edge is the sticky nav's existing bottom rule (hero takes no top border, avoiding a doubled line); contact's bottom border closes the table. Class-free positional selectors avoided so ticket 101's in-flow ticker cannot break the dividers.
- **Numbered headers:** `.section__index` becomes a flex row — counter number + full-width 1px rule (`01 ───`), zero new copy (span stays `aria-hidden`; the `<h2>` below names the section). Counter mechanism (reset/increment) untouched from v1.
- **Lanes:** `--lane-ruler: 1.75rem` (outermost, fits ticks + rotated `%`), `--lane-rail: 6rem` desktop / `--lane-rail-narrow: 2rem` icon mode under 768px, plus `--z-rail: 150` / `--z-ruler: 160` so 102/103 never touch `tokens.css`. Body `padding-inline-end` holds all in-flow content (incl. sticky nav) clear.
- **First breakpoint literal:** `@media (max-width: 768px)` in base.css — CSS variables are illegal in media conditions; lane widths stay tokens. Sanctioned by the ticket's "explicit narrow media-query exception, lane widths only".
- **Verification:** `/tmp/opencode/qa-100.mjs` — 6 configs (1440/375 × EN/FR + reduced): zero console/page errors, no overflow, counter rule on all 5, 1px side+bottom borders, hero no top border, lane padding exact, nav+sections clear of lanes. Screenshots `100-*.png`. Counter `content` returns the unresolved `counter()` string via `getComputedStyle` (Chromium), so sequencing is asserted via rule presence + visual (`01`, `02`, `05` confirmed in shots).
- **Review:** `code-review` skill (Standards + Spec, parallel subagents). No Critical findings: 768px sanctioned by ticket; session waiver explicitly user-approved; fixed ticker spanning the gutter accepted as transitional (101 moves it in-flow and re-verifies lanes); z-tokens judged in-scope reservation. One fix applied: narrowed the overbroad "never cover content" comment to in-flow elements.
- **Known transitional:** lanes are reserved geometry only (empty gutter in shots); overlap guarantee is re-verified with real overlays in 102/103.

## 2026-10-16 — ticket 101 implemented (ticker under hero)

- **Move:** ticker div relocated inside `<main>` between the hero and projects sections (index.html, single occurrence verified); `.ticker--live` drops `position: fixed`/`inset`/`z-index` and becomes a static in-flow band that scrolls away with the page. Full-bleed band width (aligns with the nav rule) vs the centered section cells — intentional.
- **Cell dividers:** base `.ticker` swaps `border-block-start`→`border-block-end` (hero's bottom border is the divider above; its own the divider below projects-side) and drops `margin-block-start`. Idle (`display: none`) leaves a single hero|projects divider.
- **Retired:** `body.has-ticker` padding hack removed from CSS + both `ticker.js` toggles; `--z-ticker` token deleted (nothing fixed-positioned remains). Zero `has-ticker`/`z-ticker` references left.
- **Measure basis:** `build()` fills one group to the band's own `clientWidth` (viewport fallback) — the band is narrower than the viewport due to lane padding. Review rename: `viewport` → `minWidth` (matches `fillGroup`'s existing param).
- **Single-line cap:** live marquee items are `nowrap` (always one line); the static reduced-motion/no-JS line wraps for readability instead of ellipsis — full text preserved for non-animated readers.
- **Unreachable edge (review-noted, accepted):** `refreshTicker()` early-returns under reduced motion, so a switch to an empty tagline would not re-hide — unreachable since ticket 004 always fills the dictionaries.
- **Verification:** `/tmp/opencode/qa-101.mjs` — live configs (1440/375 × EN/FR): in-main ordering hero→ticker→projects, `position: static`, active-language text, `has-ticker` absent, band scrolls away at page bottom; one live EN→FR click-flip session; reduced configs: static readable line, no marquee. Zero errors/overflow throughout.
- **Review:** `code-review` (Standards + Spec). No hard breaches besides the pending `status.md` update (this commit cycle). Two review fixes applied: `minWidth` rename + base.css lane comment updated for the in-flow ticker.

## 2026-10-16 — ticket 102 implemented (ruler replaces native scroll)

- **Seam:** new `src/motion/scroll-driver.js` owns scroll position — `scrollToY`/`scrollBy` go through Lenis (`immediate` for drag/instant) or straight to `window` when Lenis is absent; `ratio()`/`percent()`/`readout()` read live layout; `frame()` renders into the ruler view. Exactly one loop per mode: the chrome frame rides the GSAP ticker / bridge-fallback rAF via a new `onFrame` hook, and `driver.startLoop()` runs only when no Lenis exists (main.js).
- **Keyboard model:** arrows/PageUp/PageDown/Home/End always drive (even from link focus — focus stays put); Space drives only outside interactive elements so buttons/links keep activation. ArrowLeft/Right map to up/down steps (slider completeness). Step sizes are JS tuning constants (LERP precedent), not CSS tokens.
- **Review-caught bug (fixed):** the first version returned early for all keys on interactive focus, contradicting its own comment and the ticket ("arrow/space keys scroll through the ruler driver"). Restructured so only Space is exempt on controls; added a regression probe (arrows from nav-link focus, Space-on-button still switches language).
- **Ruler view:** new `src/ruler/ruler.{js,css}` + markup in index.html. Fixed outer-lane overlay: 0–100 ticks via layered repeating-gradients (token colors, `%` stops — no literals), blue progress = `--color-focus`, full-lane thumb with vertical `EN 42%` / `FR 42 %` readout. Thumb is the slider (`role`, `tabindex`, `aria-valuemin/max/now`, `aria-valuetext`); keys handled globally by the driver. Drag uses pointer capture + instant jumps; `touch-action: none` only on the thumb so touch elsewhere scrolls natively.
- **Readout copy:** `EN`/`FR` prefix is read from the dict-bound lang-switch buttons (`lang.en`/`lang.fr` keys, literal fallback) — no copy lives in the driver; digits/`%`/nbsp are chrome per spec §Data. `ruler.aria` added to both dictionaries (sanctioned chrome).
- **No-JS:** native bar hidden in every mode (`scrollbar-width: none` + `::-webkit-scrollbar`); static bilingual `noscript` banner states scrolling needs JS (spec-sanctioned chrome, overriding the AGENTS.md copy rule — the spec names this exact exception).
- **Review:** `code-review` (Standards + Spec). Fixes applied: arrows-from-link, ArrowLeft/Right, dict-sourced lang tag, `maxScroll` dedup (ruler no longer computes its own). Kept: `aria-valuetext` (a11y chrome in the sanctioned spirit), `render(ratio, text)` pair (stable scalars, not a clump worth a type).
- **Verification:** `/tmp/opencode/qa-102.mjs` (4 live configs + flip + 2 reduced + view-source: format, 0→100% tracking, drag, End/Home/arrows/Space, slider focus, instant reduced reflection, noscript lines) + `qa-102b.mjs` (link-focus arrows, Left/Right, Space-on-button). Zero errors/overflow throughout.
- **Known:** with JS disabled the page cannot scroll (accepted limitation, user-approved); the rail lane is still empty — 103 fills it and re-verifies overlap.
