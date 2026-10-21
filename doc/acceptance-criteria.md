# Acceptance criteria — final ledger

**Tree:** v3, `5ea37c0` + tickets 125–130 (`0892969`, `62e10f2`, `4aedc2b`,
`a00debd`).
**Gate:** `npm ci && npm run verify` → **162 passed, 0 failed**
(2026-10-21, `qa-out/report.json`); **152 / 0** with `npm run verify:fast`
(Lighthouse and the screenshot sweep skipped).
**Rule:** a v1 criterion is either **pass** on the final tree or **superseded**
by a recorded v3 decision. Nothing is silently dropped.

**Figures.** The 106/0 recorded at the 128 gate (2026-10-20) was the harness
as it stood that day; the harness grew in the same batch — the mode-blind
`i18n.keys-resolve` audit was added without its green baseline being re-run
(recorded against ticket 125), and tickets 129/130 rewrote the names-layer
checks. The figures above are the current ones, measured on the committed
tree. Evidence that names an ad-hoc `/tmp` harness (`qa-121 246/246`,
`qa-124 69/69`) is historical: those scripts are gone and are not
reproducible from the repo — the reproducible evidence is the harness check
ids named in each row, all of which run in `npm run verify`.

## v1 criteria (the original contract)

| # | Criterion (`doc/idea-v1-spec.md`) | Result | Fresh evidence |
| --- | --- | --- | --- |
| 1 | Section order hero → projects → skills → education → contact; contact last. | **Pass, v3-amended.** v3 inserts the ticker and About, and adds the footer after contact (121). Current order: hero → ticker → about → projects → skills → education → contact → footer. | `sections.*` reports all seven sections in every config; `flip.contact` confirms contact is reachable and the footer follows it. Amendment: v3 §4/§6. |
| 2 | All FR/EN copy matches `doc/content.md`; no hardcoded text in HTML except `data-i18n` keys. | **Pass, one recorded exception.** 120/120 keys in both dictionaries; 0 strings missing from the content source; 0 v1 strings lost; section partials in sync; no hardcoded-copy offenders. The exceptions are the two language-invariant pre-boot fallbacks — the `<h1>` name (ticket 126, LCP) and the document `<title>`; both carry their `data-i18n` key and i18n rebinds them. | `i18n.parity`, `i18n.copy-traceable`, `i18n.v1-survival`, `partials.in-sync`, `copy.no-hardcoded`, `strings.*`. |
| 3 | EN/FR switch visible, flips every string, persists across reload, defaults from browser language, updates `<html lang>`. | **Pass.** | `switch.lang`, `switch.storage`, `switch.pressed`, `switch.strings`, `switch.persists`, `lang.*`, `storage.default-*`; browser-default `fr-FR` config. |
| 4 | Ticker scrolls the tagline in the active language; numbered sections and row reveals run on scroll. | **Pass, v3-amended.** The ticker source is `skills.all` since 118 (the tagline moved to the hero); it still scrolls in the active language. | `motion.ticker` (transform advances), `motion.eased` (settled smooth-scroll samples), `motion.settles`, `sections.*`; 1440/375 screenshots. Amendment: v3 §3. |
| 5 | `prefers-reduced-motion`: no Lenis smoothing, no reveals/ticker motion; all content fully readable. | **Pass.** | `reduced.no-intro`, `reduced.readable`, `reduced.static-ticker`, `reduced.no-orbit`, `reduced.instant-jump`, `reduced.errors`; 1440 reduced screenshot. |
| 6 | Keyboard-only: switch, anchors, all links reachable with visible focus; anchor jumps move focus sensibly. | **Pass.** | `keyboard.reachable` 28/28, `keyboard.rings`, `keyboard.errors`, `deep-link.focus` (silent landing on refresh, ring on keyboard jump). |
| 7 | All project bullets visible; repo links + GitHub/LinkedIn open new tab with `rel="noopener"`; email is a `mailto`. | **Pass.** | `projects.cards` 3, `projects.bullets` [4,5,6], `projects.links` (all `_blank` + `noopener noreferrer`), `links.external-safe`, `links.mailto`. |
| 8 | Image slots hold their size empty; favicon + OG present. | **Pass for project slots; portrait part superseded.** The 4:5 portrait slot was deliberately removed in 119 (About is now a text section). Project slots remain 320×200 at every width; favicon/OG verified. | `slots.*` [[320,200]×3], `favicon-og.*`. Amendment: v3 §4. |
| 9 | Lighthouse performance > 90; verified screenshots at 375 px and 1440 px. | **Pass.** Mobile **97/97/97**, LCP 2259 ms, CLS 0.056, TBT 0; desktop **98**. Screenshots 1440/375 × EN/FR × hero/projects/footer + 1440 reduced + intro. | `lh.mobile.perf`, `lh.mobile.lcp`, `lh.desktop.perf`; `qa-out/screens/`. |
| 10 | Tokens only in `tokens.css`; one section per `src/sections/<name>/`; vanilla ES modules, no build; libraries only from `/vendor`; no reference code copied. | **Pass.** Token gate clean (media-query preludes excluded — custom properties are illegal there; ticket 125). The QA tooling is dev-only and ships no runtime dependency. | `tokens.no-literals`, `assets.references`, section partials; `package.json` is `private` with only `devDependencies`. |

## v3 additions checked by the same gate

| Criterion | Result | Evidence |
| --- | --- | --- |
| Intro is a desktop-scale moment; absent ≤768 and under reduced motion; still present/settles at 1024/1440. | **Pass.** | `intro.absent-768-en`, `intro.absent-375-en`, `intro.absent-375-fr`, `intro.present-1440-en`, `intro.present-1024-en`, `intro.present-1440-fr`, `intro.settled-*`, `reduced.no-intro`. |
| Names layer targets meet WCAG 2.5.8 AA (24 px rows, no overlap). | **Pass.** Pitch 1.5rem; `minGap=0.0`, heights 40/24/24/24/24; desktop a11y 100. | `names.target-size`, `lh.desktop.a11y`; ticket 127. |
| Footer/contact flip lands inside `maxScroll`; footer is the last section. | **Pass.** | `flip.contact` (`footerVisible`, `atMax`); ticket 121. |
| The names layer's title names **the section the page has reached** — it changes when a section is discovered (its top crosses the viewport's bottom edge), not at its middle, and never trails the page. | **Pass.** The rule is the last section in document order whose top has entered the viewport (`top ≤ scrollY + vh`); the flip is exact at the boundary (one pixel before it the previous section is still named). 129's occupancy rule is superseded. | `names.current-section-*` (the boundary and the pixel before it), `names.current-reached-*` (the title must never name an unreached section; the hero's first-row fallback is the documented exception); ticket 130. |
| The letter travel / reading order / silent refresh ring survive the pitch fix. | **Pass.** | `settle.names-*` (the layer settles, no parked train), `deep-link.focus` (silent landing on refresh, ring on keyboard jump); ticket 124. |
| The sticky nav never grows after the dictionary binds (the reservation covers the wrapped list at every width). | **Pass.** The bar's height is identical before and after the bind at every measured wrap boundary, in both languages. | `nav.reservation-en`, `nav.reservation-fr`; ticket 126. |
| No-JS notice and vendor-failure fallback still paint readable content. | **Pass.** | `no-js.notice`, `vendor-fail.paints` (name text 23 chars, 0 hidden, 0 overflow), `vendor-fail.errors`. |
| No data loss across the content/i18n migration. | **Pass.** 120/120 EN/FR keys; every v1 (`c706140`) string still present (0 lost); every non-sanctioned dictionary string traceable to `doc/content.md`. | `i18n.parity`, `i18n.v1-survival`, `i18n.copy-traceable`. |
| The site ships no runtime dependency: the vendor scripts are repo-local, and no `src/` file imports the QA tooling or a `node_modules` package. | **Pass.** | `architecture.local-assets` (the injected vendor paths are local files under `vendor/`; no `src/` import of `tools/`, `node_modules`, `playwright` or `lighthouse`); ticket 125. |

## Notes on the two fixes

- **Mobile performance** needed more than the intro skip: the critical JS path is
  now i18n-only, the motion shell/vendors load after the first paint, and the
  language-invariant `<h1>` fallback gives Lighthouse an LCP element in the
  initial HTML. Full reasoning and the simulation-vs-observed finding are in
  ticket 126.
- **Desktop accessibility** was fixed by the names pitch (20 → 24 px), not by
  relaxing the audit. Ticket 127.
- The intentional rule exceptions are the two language-invariant pre-boot
  fallbacks — the `<h1>` name and the document `<title>`. Both are identical
  in EN and FR, both remain owned by their dictionary keys, and both are
  recorded in `AGENTS.md`, ticket 126 and `doc/idea-v3-decisions.md`.
