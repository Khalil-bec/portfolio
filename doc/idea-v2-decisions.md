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
