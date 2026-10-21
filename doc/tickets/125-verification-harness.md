# 125: Reproducible verification harness

**Status:** `done` (2026-10-21) — `0892969`. Reviewed (both axes); the review's
harness findings are applied and recorded below.

**Why (2026-10-20, final gate):**

The v3 build is complete (`5ea37c0`) but verification was not reproducible: the QA
harnesses lived in `/tmp/opencode`, `qa-112`–`qa-120` are gone, and only
`qa-121`/`qa-124` survive as ad-hoc scripts. A fresh agent could not run "the full
test suite" from the repo. A final gate also surfaced two regressions that the
per-ticket harnesses never re-checked after v3:

- mobile Lighthouse **85–86** (v1 AC says > 90), LCP 3.8–3.9 s — the intro's
  `data-intro="run"` gate hides the hero text until ~1.7 s;
- desktop accessibility **96** (was 100): `target-size` on the names layer —
  24 px rows on a 20 px pitch, so adjacent targets overlap (WCAG 2.5.8 AA).

**What was built (dev-only, approved by the user 2026-10-20; not shipped):**

- `package.json` + lockfile with `playwright` 1.64.1 and `lighthouse` 13.5.0.
- `tools/qa/serve.mjs` — dependency-free static server (correct MIME types,
  repo root, ephemeral port; optional fixed port for manual probes).
- `tools/qa/lighthouse.mjs` — Lighthouse CLI bridge using Playwright's Chromium,
  JSON to stdout, no report files.
- `tools/qa/verify.mjs` — one command (`npm run verify`) covering:
  - **static:** i18n leaf parity and every bound key resolving; every dictionary
    string traceable to `doc/content.md`; v1 (`c706140`) strings still present;
    section partials byte-equivalent (whitespace-normalised) to the inlined
    `index.html`; token gate; hardcoded-copy audit; local asset / URL integrity;
    link `target`/`rel`; mailto.
  - **runtime:** 1440/1024/768/375 × EN/FR, reduced motion, no-JS, vendor
    failure, browser-default `fr-FR`, live switch + reload persistence, cold
    hash deep links, keyboard reachability + focus rings, contact flip at max
    scroll, project bullet counts, slots, favicon/OG, ticker motion, eased
    scroll, console/overflow/external-request assertions.
  - **criteria:** desktop intro mounts then settles; intro **absent ≤768**
    (125's red test for 126); names rows **no overlap and ≥24 px** (red test for
    127); Lighthouse mobile median > 90 + LCP < 2.5 s; mobile a11y 100; desktop
    perf ≥ 95; desktop a11y 100.
  - **screenshots:** 1440/375 × EN/FR/reduced (hero/projects/footer) + a desktop
    intro frame, under gitignored `qa-out/`.
- Any failure exits non-zero and lists the failing assertion ids.

**Red baseline (current tree, before 126/127):** 7 failures, 99 passes —
`names.target-size` (`minGap=-4`, rows 40/24/24/24/24), `intro.absent-768-en`,
`intro.absent-375-en`, `intro.absent-375-fr`, `lh.mobile.perf 85/86/86`,
`lh.mobile.lcp 3792 ms`, `lh.desktop.a11y 96`.

**Final gate:** 106/106 checks pass; mobile Lighthouse 97/97/97 with LCP 2259 ms,
desktop 98, both accessibility 100. `qa-121` (246) and `qa-124` (69) still pass
as regressions.

**Scope:**

- [x] `package.json`, `package-lock.json`, `node_modules` gitignored,
      `qa-out/` gitignored.
- [x] `tools/qa/serve.mjs`, `tools/qa/lighthouse.mjs`, `tools/qa/verify.mjs`.
- [x] `AGENTS.md` verification line: `npm ci && npm run verify` (dev only).
- [x] Red baseline on the current tree: the intro-narrow, names-pitch,
      mobile-perf and desktop-a11y checks failed for the measured reasons.
- [x] No `src/` change in this ticket (126/127 own the fixes).
- [x] Token gate refinement: lengths in `@media` preludes are stripped before
      the literal scan. CSS custom properties are not allowed in media queries,
      so breakpoints are not tokenizable; every other value still must come from
      `tokens.css`.

**Exit criteria:** the command runs from a clean checkout, produces a JSON
report plus a human summary, and the failures match this ticket's two known
regressions (nothing else red except known environment variance).

**Amendment (2026-10-21, ticket 129's work):** the `i18n.keys-resolve`
static audit was **mode-blind** — it required every bound key to resolve to a
**string**, but `skills.all` is an **array** bound with `data-i18n-mode="join"`
(118's ticker source, committed since 118). The audit therefore could never
pass against the committed markup. The audit is now mode-aware: a `join`
binding must resolve to an array in both dictionaries, every other binding to
a string. The audit's own green baseline was never re-run after it was added,
which is why the 106/0 figures recorded for 125 and 128 are **not reproducible
against the harness as it now stands** (the harness grew from 106 checks at the
128 gate to 146 in the same uncommitted batch). The current green figure is
**158/0** on the full gate (`npm run verify`), **148/0** with `verify:fast` —
the 10 Lighthouse and screenshot checks are the difference. See
`doc/tickets/129-names-current-section.md`.

**Amendment (2026-10-21, the 125–130 code review):** three checks were making
the gate more comfortable than the tree deserved, and one gap let a real
defect through. All four are fixed here:

- `i18n.v1-survival` **passed vacuously** when the v1 commit was unavailable
  ("skipped (v1 commit unavailable)"). A check that cannot run is not a pass:
  it now **fails** with "v1 commit c706140 unavailable — copy survival NOT
  verified", so a checkout without that history can never report a green gate.
- `architecture.local-assets` only scanned the **static** `<script src>` tags.
  Ticket 126 moved the vendor scripts off the document (main.js injects them
  after the first paint), so the check could no longer see them at all. It now
  also reads the injected paths out of `src/main.js` and asserts each is a
  repo-local file under `vendor/`, and it scans every `src/**/*.js` for an
  import of `tools/`, `node_modules`, `playwright` or `lighthouse` — the
  "no runtime dependency ships" half of this ticket's contract, which nothing
  asserted before.
- **New check `nav.reservation-{en,fr}`** (the gap that let a defect through):
  ticket 126 reserves the nav's wrapped link list before the dictionaries bind,
  so the sticky bar never grows after the first paint. Nothing measured that.
  The check holds the dictionary back, reads the bar's height at every measured
  wrap boundary in both languages, releases the dictionary and reads the same
  widths again: any width where the bar changed height fails. It caught the
  defect that the original reservation had (see ticket 126) and was validated
  against it — restoring the old mapping reddens the gate at 320 px, 358 px and
  529 px in EN.
