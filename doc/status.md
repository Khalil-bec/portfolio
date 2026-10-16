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
