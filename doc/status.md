# Ticket status

Single source of truth for ticket progress. **Update this file every time a
ticket's implementation is done** (and on any status change). Keep it in sync
with `doc/tickets/` and `doc/idea-v3-decisions.md`. The narrative history of
each ticket lives in `doc/status-log.md` (write-only — do not read it).

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
| 001 | Setup project scaffold | — | `done` | `b4cc247` | Reviewed, approved, pushed. Repo private. |
| 002 | Motion foundation (Lenis + anchors + kill-switch + focus) | 001 | `done` | `8d611ea` | Reviewed, approved, committed, pushed. Nav→004, GSAP→003. |
| 003 | Reveals + numbered sections + ticker shell | 002 | `done` | `888e5b5` | Reviewed, approved, committed. Mechanisms only; ticker binds hero.tagline. |
| 004 | Bilingual wiring | 001 | `done` | `c706140` | en/fr dicts + data-i18n + sticky nav + EN/FR switch. Reviewed, approved. |
| 005 | Content fit-in — hero + education + contact | 001, 003, 004 | `done` | `2ba4571` | Hero/education/contact + KB favicon/ICO/OG + 4:5 portrait. Reviewed, approved. |
| 006 | Content fit-in — projects + skills | 001, 003, 004 | `done` | `e9ec728` | Projects (3 cards, 16:10 slots) + skills (4 tiers). Reviewed, approved. |
| 007 | Hardening + verification | 002–006 | `done` | `577cf69` | 3 defects fixed; Lighthouse mobile 94/100, desktop 100/100. Reviewed, approved. |
| 100 | Table divisions + edge lanes | 007 | `done` | `d2b2e93` | Cells + numbered headers + lane tokens. Reviewed. Gate waived. Committed. |
| 101 | Ticker under hero | 007 | `done` | `ff8ac35` | In-flow band hero→ticker→projects; has-ticker retired. Reviewed. Committed. |
| 102 | Ruler replaces native scroll | 100 | `done` | `093069d` | Scroll-driver + fixed ruler; native bar hidden. Reviewed. Committed. |
| 103 | Side rail | 100 | `done` | `584f60d` | Five anchors in inner lane; IO tracking + aria-current. Reviewed. Committed. |
| 104 | v2 hardening + verification | 100–103 | `done` | `32944fd` | Fixed GSAP frozen-vars; dict preloads. All sweeps green. Reviewed. Committed. |
| 105 | Palette + grid (colors & borders pass) | 104 | `done` | `12c783f` | Warm-neutral palette + mono accent + hairline borders + 1280 column. QA green. |
| 106 | Typography scale + sticky eyebrow bar | 105 (uncommitted) | `done` | `12c783f` | Display-scale titles, mono labels, sticky blurred brow. QA green; review clean. |
| 107 | Nav restyle (§4) | 106 | `done` | `e95a415` | Bar 47px, translucent blur, mono uppercase, boxed hover/focus. Fixed focus. |
| 108 | Rail settle dynamics (§ "section list") | 107 | `done` | `7805f68` | Gray+shifted until reached, settle inward+brighter; monotonic. |
| 109 | Ruler readout orientation (upright digit drums) | 108 | `done` | `194e036` | Tilted text → upright digit drums; blank-padded, new tokens. |
| 110 | Ruler scale (graduations + numbered labels) | 109 | `done` | `d78321a` | Track=page-height window 1:1; 1%/5% grads; 21 grades; 1px marker. |
| 111 | Eyebrow right-side meta (existing strings only) | 106 | `done` | `e5f95e5` | Fills right side from existing dict strings. QA 78 green. Review clean. |
| 112 | Band geometry — centred column, overlay chrome, no reservation | 111 | `done` | `d76a47c` | Roadmap 1: reservation gone, column centred, rail retired, ruler ≤768. |
| 113 | Ruler to exact scale (60px lane, 20/10 ticks, travelling rule) | 112 | `done` | `dc975b3` | Roadmap 2: lane 60px, exact ticks, 1px travelling rule, riding readout. |
| 114 | Fixed name layer — per-section jump anchors, three states | 113 | `done` | `ecb1db1` | Roadmap 3: fixed section list reinstated, measured form, z-nav 100→180. |
| 115 | Letter travel — per-letter flight through ruler lane | 114 | `done` | `e0cc406` | Roadmap 4: vertical trains in ruler lane, spawn at flip, cruise 1:1. |
| 116 | Brand assets — the KB mark, favicon, OG | — | `done` | `030d27a` | Traced KB mark as three inline symbols; favicon badge (SVG + ICO 16/32/48/64) + OG refreshed. Reviewed, approved. |
| 117 | Nav brand — the mark replaces the wordmark slot | 116 | `done` | `cc44610` | The mark rides the bar's left end at every width; the list drops the hero link. Reviewed, approved. |
| 118 | Hero reload — rings, skill chips, name/CTA/meta, skills ticker | 117 | `done` | `1b5edd5` | Full-bleed backdrop (3 hairline rings + 13 brand chips); ticker bound to skills.all. Reviewed, approved. |
| 119 | About promotion — its own section, portrait retired | 118 | `done` | `c154158` | `#about` is its own section between ticker and projects; the portrait slot retires. Reviewed, approved. |
| 120 | Intro animation — mark → split letters → name reveal | 119 | `done` | `cdf92ee` | Amended by 122: the intro is an in-hero stage, not a screen cover. Committed with 122/123. |
| 121 | Footer — bar-divided grid + made-by credits; contact flip lands | 120 | `done` | `d04fa77` | Bar-divided footer: 3 cells + ©/made-by strip. Stacks ≤768. |
| 122 | Hero correction — full-bleed, uncounted, in-hero intro | 120 | `done` | `cdf92ee` | The hero drops `.section` (no number, no column); the letters are dragged into the name. Committed with 123. |
| 123 | Hero orbit — brand-coloured logos on a scroll-turned wheel | 122 | `done` | `cdf92ee` | The chip group turns as one wheel on scroll; each ring adds its own spin. Committed with 122. |
| 124 | Travel direction + train reading order + no ring on refresh | 115 | `done` | `f6b8b2f` | Downward-only travel; train reads first-letter-on-top; silent hash landing. |
| 125 | Reproducible verification harness | 124 | `done` | `0892969` | Dev-only tools/qa + npm run verify; 152/0 fast, 162/0 full. |
| 126 | Intro must not gate first paint on phones | 125 | `done` | `62e10f2` | Intro skipped ≤768; i18n-only critical path; mobile 97, LCP 2259 ms, a11y 100. |
| 127 | Names layer target size | 126 | `done` | `4aedc2b` | `--name-pitch` 20 → 24 px; desktop a11y 100. |
| 128 | Final acceptance gate — v3 tree | 125–127 | `done` | — | The ledger (`doc/acceptance-criteria.md`) maps every v1 criterion. No code change. |
| 129 | Names layer — the current title follows the section in view | 127 | `done` | `a00debd` | The occupancy rule; superseded in part by 130 (its reasoning stays as the record). |
| 130 | Names layer — the title names the section you have reached | 129 | `done` | `a00debd` | The reached rule, measured on the reference; 129's occupancy rule retires with it. |
