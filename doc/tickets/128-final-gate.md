# 128: Final acceptance gate — v3 tree

**Status:** `done` (2026-10-21) — evidence captured and reviewed
and user approval. The ledger lives in `doc/acceptance-criteria.md`.

**Why:**

The v3 build is complete (`5ea37c0`) but the acceptance ledger had not been
re-checked against the final tree. The last per-ticket evidence predates the
v3 footer/travel work, and the two regressions surfaced by 125 (mobile
performance, desktop accessibility) needed a fresh gate after 126/127.

**Gate command:** `npm ci && npm run verify` (dev-only). Produces
`qa-out/report.json` + `qa-out/screens/`.

**Result (2026-10-20T17:06Z):**

- **106 passed, 0 failed.**
  - **Not reproducible against the harness as it now stands** (amended
    2026-10-21, by ticket 129): the harness grew in the same uncommitted batch
    — 106 checks at this gate → 146 before 129 → **158** with 129's twelve
    (eight `names.current-*` checks + four incidental `settle.names-*`) — and
    the mode-blind `i18n.keys-resolve` audit was added in that growth without
    its green baseline being re-run (it could never pass against 118's
    array-valued `skills.all`; ticket 125 amends it). The current green
    figure is **158/0** on the full gate (`npm run verify`), **148/0** with
    `verify:fast`. The figure above is what this gate measured on its day.
- Mobile Lighthouse (median of three, default simulated mobile):
  **97 / 97 / 97 performance**, LCP **2259 ms**, CLS **0.056**, TBT **0**,
  accessibility **100 / 100 / 100**.
- Desktop Lighthouse: **98 performance**, **100 accessibility**, LCP **529 ms**.
- Static: 120/120 i18n keys in both languages; 0 copy strings missing from
  `doc/content.md`; 0 v1 (`c706140`) strings lost; all seven section partials
  in sync; token gate clean; no hardcoded copy outside the documented hero-name
  fallback; every local asset and content URL resolves; every external anchor
  has `target="_blank"` + `rel="noopener…"`; mailto present.
- Runtime: 1440/1024/768/375 × EN, 1440/375 × FR, reduced motion, no-JS, vendor
  failure, default `fr-FR`, live switch + reload persistence, cold hash deep
  links, 28/28 keyboard stops with rings, contact flip, project cards/bullets/
  links, favicon/OG, ticker motion, eased scroll, zero console/page errors,
  zero horizontal overflow, zero external requests.
- Regressions: `qa-124` **69/69** (letter travel), `qa-121` **246/246**
  (footer/contact flip).
- Screenshots: 1440/375 × EN/FR × hero/projects/footer + 1440 reduced +
  1440 intro midpoint, all visually checked.

**Acceptance ledger:** `doc/acceptance-criteria.md` maps every v1 criterion to
this evidence, with the v3 amendments called out (About/footer order, ticker
copy, retired portrait slot, hero-name fallback exception).

**Scope:**

- [x] Run the full harness on the final tree; no skipped assertions except the
      documented Lighthouse/screenshot flags.
- [x] Fix the two red criteria in their own tickets (126 mobile, 127 a11y).
- [x] Fresh screenshots at 375/1440, EN/FR, reduced, intro.
- [x] `doc/acceptance-criteria.md` written; `doc/idea-v1-spec.md` annotated;
      v3 spec amendments recorded.
- [x] Decisions appended (`doc/idea-v3-decisions.md`, pointer in v1 decisions).
- [x] `doc/status.md` updated.
- [x] Code review (Standards + Spec) and user approval before commit — the
      review of the 125–130 batch ran on 2026-10-21 (both axes, two
      read-only sub-agents against `5ea37c0`); the findings are applied in
      tickets 125, 126 and 130, and the ledger is refreshed. Approved by the
      user 2026-10-21.

**Exit criteria:** every v1 criterion is pass or explicitly superseded by a
recorded v3 decision; the harness is green from a clean checkout; the only
uncommitted changes are this gate's intended source/tooling/docs.
