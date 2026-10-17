# Ticket status

Single source of truth for ticket progress. **Update this file every time a
ticket's implementation is done** (and on any status change). Keep it in sync
with `doc/tickets/` and `doc/idea-v1-decisions.md`.

## Legend

| Status | Meaning |
| --- | --- |
| `todo` | Not started. |
| `in-progress` | Being implemented. |
| `in-review` | Implemented + screenshot-checked, awaiting code review / user approval. Not yet committed. |
| `done` | Reviewed, approved by the user, and committed. Commit SHA recorded. |
| `blocked` | Waiting on another ticket. |

A ticket only reaches `done` after the user approves the commit (see
`AGENTS.md`: never commit without approval).

## Tickets

| Ticket | Title | Blocked by | Status | Commit | Notes |
| --- | --- | --- | --- | --- | --- |
| 001 | Setup project scaffold | — | `done` | `b4cc247` | Reviewed (no Critical), user-approved, pushed. Repo hosted privately. |
| 002 | Motion foundation (Lenis + anchors + kill-switch + focus) | 001 | `done` | `8d611ea` | Reviewed (no Critical), user-approved, committed, pushed. Nav deferred to 004, GSAP bridge to 003 (user-confirmed). |
| 003 | Reveals + numbered sections + ticker shell | 002 | `done` | `888e5b5` | Reviewed (no Critical), user-approved, committed. Mechanisms only; ticker binds `hero.tagline` (empty until 004). Not pushed. |
| 004 | Bilingual wiring | 001 | `done` | `c706140` | en/fr dictionaries + `data-i18n` engine + sticky nav & EN/FR switch. Reviewed (no hard violations), user-approved, committed, pushed. FR tagline `blessé`→`passionné` (user-approved). |
| 005 | Content fit-in — hero + education + contact | 001, 003, 004 | `done` | `2ba4571` | Hero/education/contact + KB favicon/ICO/OG + 4:5 reserved portrait slot. Reviewed (no hard violations), visual-QA approved, user-approved, committed, pushed. Parallel with 006. |
| 006 | Content fit-in — projects + skills | 001, 003, 004 | `done` | `e9ec728` | Projects (3 cards, all bullets, reserved 16:10 slots) + skills (4 chip tiers). Reviewed (no hard violations, one fix), visual-QA approved, user-approved, committed, pushed. Parallel with 005. |
| 007 | Hardening + verification | 002–006 | `done` | `577cf69` | Verification gate + 3 defects fixed (keyboard-unreachable below-fold links; AA contrast on `--color-text-subtle`; i18n nav shift). Lighthouse 13.5.0 mobile perf 94 / a11y 100, desktop 100 / 100. Reviewed (Standards: no hard violations; Spec: 5 checkboxes met; pre-commit re-review: ready-to-merge Yes, 2 minors deferred). User-approved, committed, pushed. |
| 100 | Table divisions + edge lanes | 007 | `done` | `d2b2e93` | Cells (side+bottom borders, nav rule = table top) + `01 ───` numbered headers + lane tokens/reservation (rail icon collapse <768px). Reviewed via `code-review` (no Critical; ticker-over-gutter accepted transitional → 101). Approval gate waived (user). Committed + pushed. |
| 101 | Ticker under hero | 007 | `done` | `ff8ac35` | In-flow band hero→ticker→projects, scrolls away; `has-ticker` hack + `--z-ticker` retired; band-width measure; static line under reduced motion; EN→FR flip verified. Reviewed via `code-review` (no Critical; 2 review fixes applied). Committed + pushed. |
| 102 | Ruler replaces native scroll | 100 | `done` | `093069d` | Scroll-driver seam + fixed ruler (ticks, blue progress, `EN 42%`/`FR 42 %` thumb slider); native bar hidden; keys/drag through driver; noscript notice; reduced instant. Reviewed via `code-review` (1 real bug fixed: arrows from link focus). Committed + pushed. |
| 103 | Side rail | 100 | `done` | `584f60d` | Five anchors (nav labels, `rail.aria` landmark) in inner lane; IO most-visible tracking + `aria-current` both directions; jump/focus/reveal-first verified; icon dots <768px; lane 7.5rem fits labels. Reviewed via `code-review` (tracking upgraded to threshold-argmax). Committed + pushed. |
| 104 | v2 hardening + verification | 100–103 | `done` | `32944fd` | Done-gate: fixed GSAP frozen-vars Tab throw; dict preloads (mobile perf 90→92, desktop/a11y 100); 8-config sweep + 19-stop keyboard + vendor-failure drill + hygiene all green. Reviewed via `code-review`. Committed + pushed. |
| 105 | Palette + grid (colors & borders pass) | 104 | `done` | `12c783f` | Warm-neutral palette + monochrome accent + hairline borders + 1280 column + full-bleed rules + sharp slots. QA green; review found 0 hard violations (2 defects fixed); user-approved commit (stacked with 106). |
| 106 | Typography scale + sticky eyebrow bar | 105 (uncommitted tree) | `done` | `12c783f` | Display-scale titles, mono micro-labels, sticky blurred `NN / NAME` brow pinned flush under the nav (live-measured offset). QA green; review clean (switch-path pin evidence added, `--slash-sep` dropped). |
| 107 | Nav restyle (§4) | 106 | `done` | `e95a415` | Bar 47px @1440 (was 63), translucent blurred band (shared `--overlay-bg`), mono uppercase labels, boxed inverted hover/focus. Review caught an invisible-label focus defect — fixed. User-approved commit. |
| 108 | Rail settle dynamics (§ "section list") | 107 | `done` | `7805f68` | Rail entries gray + shifted until their section is reached, then settle inward + one step brighter (`--color-text-bright` added); discovery monotonic; current stays ink. QA green (5 configs). Review: 1 hard (status row — added), 1 smell fixed (unconsumed accessor + duplicated state → high-water mark). User-approved commit. |

## Update log

Append one line per status change, newest last.

- 2026-10-15 — `doc/status.md` created; 001 marked `done` (`b4cc247`), 002–006 `todo`, 007 `blocked`.
- 2026-10-15 — 002 implemented (Lenis foundation) → `in-review`. Decisions + visual-qa + code-review recorded in `doc/idea-v1-decisions.md`. Not committed; awaiting approval. Nav moved to 004, GSAP bridge to 003.
- 2026-10-15 — 002 approved + committed (`8d611ea`) → `done`.
- 2026-10-15 — 002 pushed to `origin/main` (`55a68a6..f76cd0d`).
- 2026-10-15 — 003 implemented (reveals + numbered sections + ticker shell) → `in-review`. Mechanisms only: no copy committed; ticker binds `hero.tagline` (empty until 004) and stays hidden while empty. Decisions + visual-qa + code-review recorded in `doc/idea-v1-decisions.md`. Not committed; awaiting approval.
- 2026-10-15 — 003 approved + committed (`888e5b5`) → `done`. Not pushed.
- 2026-10-15 — 004 implemented (bilingual wiring: en/fr dictionaries, i18n engine, sticky nav + EN/FR switch) → `in-review`. Dictionary scheme, storage/detection, rich-text-safe rendering and nav decisions, visual-qa and code-review recorded in `doc/idea-v1-decisions.md`. Corrected FR tagline `blessé`→`passionné` (user-approved). Not committed; awaiting approval.
- 2026-10-15 — 004 approved + committed (`c706140`) → `done`. Pushing to `origin/main`.
- 2026-10-15 — 004 pushed to `origin/main` (`4054219..3460f78`).
- 2026-10-15 — 005 implemented (hero + education + contact content, code-drawn KB favicon/ICO/OG, reserved 4:5 portrait slot, hardened outbound links, hero above-fold cap with a decorative cue) → `in-review`. Decisions, visual-qa and code-review (Standards + Spec axes, no hard violations) recorded in `doc/idea-v1-decisions.md`. Fixed favicon `sizes`; verified the accessible-name separator. Not committed; awaiting approval.
- 2026-10-15 — 005 approved + committed (`2ba4571`) → `done`. Pushing to `origin/main`.
- 2026-10-15 — 006 implemented (projects + skills content: three project cards with all bullets visible + reserved 16:10 screenshot slots, four skill tiers as chips) → `in-review`. Decisions + visual-qa + code-review (Standards + Spec axes, no hard violations; fixed the `--ticker-dot` → `--dot-size` naming) recorded in `doc/idea-v1-decisions.md`. Not committed; awaiting approval.
- 2026-10-15 — 006 approved + committed (`e9ec728`) → `done`. Pushing to `origin/main`.
- 2026-10-15 — 006 pushed to `origin/main` (`886f07f..1ad394c`).
- 2026-10-15 — 007 implemented (hardening + verification) → `in-review`. Ran the static audits + Playwright runtime passes (375/768/1440 EN/FR, reduced motion, keyboard, storage, no-JS, CLS, zero-external-request, OG view-source) and Lighthouse mobile+desktop (perf 94/100). Fixed 3 defects it surfaced — below-fold links keyboard-unreachable (`autoAlpha`→`opacity`+focusin), `--color-text-subtle` AA contrast `#6d7787`→`#767f8f`, i18n nav layout shift — plus a deep-link focus gap. Decisions, verification and code-review (Standards + Spec, no hard violations) recorded in `doc/idea-v1-decisions.md`. Accepted residual: 375px CLS 0.1175. Not committed; awaiting approval.
- 2026-10-16 — 007 approved + committed (`577cf69`) → `done`. Pre-commit gate: fresh full re-verification (token gate clean; 375/768/1440 EN/FR zero overflow/errors; keyboard 13/13 focus-visible; contrast 0 failing; Lighthouse mobile 94/desktop 100) + read-only reviewer subagent verdict ready-to-merge Yes (2 minors deferred: frozen REVEALED spread, boot-focus ordering). Pushing to `origin/main`.
- 2026-10-16 — 100 implemented (table cells + `01 ───` headers + lane reservation) → reviewed (`code-review`: no Critical; ticker-over-gutter accepted transitional → 101) → `done` (`d2b2e93`). Approval gate waived per session decision. Pushing to `origin/main`.
- 2026-10-16 — 101 implemented (in-flow ticker band) → reviewed (`code-review`: no Critical; applied `minWidth` rename + lane-comment update) → `done` (`ff8ac35`). Pushing to `origin/main`.
- 2026-10-16 — 102 implemented (scroll driver + ruler) → reviewed (`code-review`: fixed arrows-from-link bug, Left/Right keys, dict-sourced readout tag, maxScroll dedup) → `done` (`093069d`). Pushing to `origin/main`.
- 2026-10-16 — 103 implemented (side rail) → reviewed (`code-review`: tracking upgraded to threshold-argmax, state trimmed, `font-size: 0` sanctioned) → `done` (`584f60d`). Pushing to `origin/main`.
- 2026-10-16 — 104 implemented (hardening gate: frozen-vars fix + preloads, full sweep/keyboard/vendor-fail/hygiene green, Lighthouse mobile 92/desktop 100/a11y 100) → reviewed (`code-review`: hunks clean, gate evidence on shipped tree) → `done` (`32944fd`). Pushing to `origin/main`.
- 2026-10-16 — inspiration detail pass written to `doc/inspo-vs-product-colors-borders.md` (user request); 105 (palette + grid) created → `in-progress`. Decisions in `doc/idea-v2-decisions.md`.
- 2026-10-16 — 105 implemented (warm-neutral palette, monochrome accent, hairline borders, 1280 column, full-bleed dividers/nav/ticker, sharp slots) → QA green (5 configs + contrast walk + 19-stop keyboard) → code review (`code-review`: Standards no hard violations; Spec caught a doubled hero/ticker divider + a dead hover transition — both fixed, muted 0.62→0.6 to match the ticket, keyboard pass added) → re-verified ALL GREEN → `in-review`. Not committed; awaiting approval.
- 2026-10-16 — 106 implemented (display-scale titles + mono labels + sticky eyebrow bar with JS-measured nav offset; brow hugs the cell's top rule after a screenshot-driven margin fix) → QA green (5 configs, pin/release evidence, contrast AA, 19-stop keyboard) → code review (`code-review`: 0 hard violations on both axes; Spec evidence gap closed — switch-path reflow re-measure verified 85→118px flush at 375; `--slash-sep` token dropped as Speculative Generality) → re-verified → `in-review`. 105 + 106 uncommitted; awaiting approval.
- 2026-10-16 — user approved: 105 + 106 committed together as `12c783f` (stacked in one commit — hunks share files). Rows marked `done`. Moving on to the next deferred item: §4 nav restyle (bar height, translucent blur, mono uppercase labels, boxed-link hover) → ticket 107.
- 2026-10-16 — 107 implemented (nav restyle: bar 47px, shared translucent blur band, mono uppercase labels, boxed hover/focus) → `in-review`; code review found an invisible-label focus defect (split state rules) — fixed and re-verified → user approved → `done` (`e95a415`). Rows 105/106 bookkeeping also committed here. Next: rail settle dynamics (108).
- 2026-10-16 — 108 implemented (rail settle dynamics: gray + shifted until reached, settle inward + brighter, monotonic discovery) → re-measured the inspiration's rail/gutter first (per-letter JS choreography; their sticky brow is `sticky top-12`, so this pass is rail-only) → three-tier ramp chosen after screenshot A/B (`subtle` 5.6:1 undiscovered / new `--color-text-bright` 8.4:1 settled / ink current; a dimmer step would sit at the ~4.8:1 the repo already rejected) → QA green (5 configs incl. deep link + reduced) → code review (Standards: gate clean, 1 hard — missing status row, fixed; 1 smell — unconsumed `discovered()` accessor + state stored twice → high-water mark; Spec: monotonicity proven, no creep, contrast figures verified 8.41:1/4.83:1, noted 007's 4.85:1 was on the v1 bg) → re-verified ALL GREEN → `in-review`. Not committed; awaiting approval.
- 2026-10-16 — 108 approved + committed (`7805f68`) → `done`. Pushed with the 105–107 backlog. Next: 109 ruler readout orientation (vertical digit columns).
