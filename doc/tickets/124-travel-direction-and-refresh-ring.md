# 124: Travel direction, train reading order, no focus ring on refresh

**What to build (user's ask, 2026-10-20):**

1. The letter travel is **downward-only**: scrolling down keeps the vertical train in the
   ruler lane; scrolling up is never dynamic — the section name that was the current word
   simply drops into the stack of upcoming rows at the bottom.
2. The vertical train **reads top-down**: the first letter of the word sits on top, the last
   letter at the bottom. (Today it reads backwards — `PROJECTS` renders `S T C E J O R P`
   from top to bottom.)
3. Refreshing a page whose URL carries a `#hash` **must not outline a section in blue**. Today
   every load/reload lands with the deep-link focus on the `<section>` and the global
   `:focus-visible` ring draws a 2px `#7dd3fc` box around the whole cell.

**Blocked by:** 115 (the travel) — landed in the same committed tree.

**1 + 2 — one-way travel, top-down train (`src/names/name.js`):**

- `spawnFlight` gives the first letter the top slot (`slot: j`, was `count - 1 - j`). The
  train's top letter is still `spawns[0]` — the word's first letter at its own old slot — so
  the train keeps spawning at the measured 114 trigger and cruising 1:1; only the stack order
  inside it flips, and the exit order becomes reading order (first letter leaves first).
- The handoff branch flies only on a single-step advance (`delta === 1`). An upward handoff (or
  any multi-step scrub) takes 114's settle branch: flights snap, states publish instantly.
- A **direction reversal snaps an active flight**: the render compares `scrollY` with the
  previous frame and completes the flights on **any** upward step — no epsilon, because a slow
  drag arrives in sub-pixel deltas and each one is still an upward move — so a frozen train
  never rides back down (`lastScrollY` is `null` until the first frame, so a load can never
  read as a reversal). This is the strict reading of
  "when scrolling up nothing dynamic" (user-confirmed choice).
- `EXIT_BOTTOM` and the per-flight `dir` are dead once travel is one-way — deleted; the exit
  test becomes `trainY <= EXIT_TOP * vh`.

**3 — no ring on a hash load (`src/motion/smooth-scroll.js` + `src/styles/base.css`):**

- The load-time deep-link focus (002, extended in 007) stays — dropping it threw the first Tab
  back to the top of the document (verified: no fragment starting point survives without the
  focus). It becomes **silent**: `focusAnchorTarget(hash, silent)` calls `silenceLandingRing()`,
  which marks the target `is-silent-landing`, and `.is-silent-landing:focus-visible { outline: none }`
  suppresses the ring for exactly as long as that element holds focus (the class is dropped on
  `blur`). The selector is element-agnostic: hash targets include `<section id="hero" class="hero">`
  (not `.section`), `<footer>`, `<main>` — a `.section`-scoped rule left `/#hero` ringing. Focus,
  Tab continuity and the accessibility tree are unchanged; only the blue box is gone.
- The **click-delegated focus stays unmarked**: keyboard-activated jumps (Enter on a nav link or
  a name row) still move focus to the section and keep their ring — the only focus indicator
  that path has (user-confirmed choice).

**Scope:**

- [x] name.js: `slot: j`; downward-only handoff gate; reversal snap + `lastScrollY`; drop
      `dir`/`EXIT_BOTTOM`; docstring rewritten for the one-way travel.
- [x] smooth-scroll.js: the load-time deep-link focus becomes silent (`is-silent-landing`);
      base.css suppresses the ring on any marked element while it holds focus.
- [x] Verify: fresh harness (`qa-124.mjs`, 69 checks green) — train order top→bottom = the
      word's character order for both trains, 20px cell pitch, lane-axis x, muted column ink,
      1:1 slope over +60px, top-prefix exit order, full settle; scroll-up = no new train and
      the word lands in the bottom stack at its rest slot; a 30px reversal mid-flight snaps
      every letter back to static; hash loads and reloads keep the silent focus (no ring on any
      element) while the first Tab still lands inside the target; keyboard Enter on a nav link
      still focuses + rings; FR switch mid-flight re-splits with no stranded letters; reduced
      motion never flies; ≤768 unmounts the layer; zero errors, no overflow.
- [x] Screenshots: rest, mid-flight (order visible), after an upward scroll, refresh-with-hash.
- [x] Token gate clean (no new CSS values — `outline: none` is a keyword); code review (both
      axes); status row + decisions entry.

**Verification (measured, 1440×900 / 375×812 / reduced):**

- Mid-flight "Projects" reads `P R O J E C T S` top→bottom at the 20px cell pitch, x centred
  on the lane axis (1410 ± 1), muted column ink; both trains (About + Projects) obey the same
  order. `+60px` scroll moves every cruising letter `−60px`; every exited letter is a top
  prefix of the word; scrolling on lands the whole row in the flex layout.
- Scrolling up 30px with a train frozen in the lane leaves zero `position: fixed` letters and
  full transforms cleared in the same frame; an upward handoff leaves `About` current with
  `Projects` back at its rest bottom-stack slot (792 at 900).
- Hash load and reload (`#projects`, `#contact`, `#hero`, `#main`, `#footer`):
  `document.activeElement` is the target, `is-silent-landing` is set, computed
  `outline-style: none`, no element matches a visible ring; Tab lands inside the target
  (Homelab repo link / contact value). Keyboard Enter on `#skills` focuses the section with
  `outline: solid` and no marker. A sub-pixel upward drag (−0.2px steps) snaps the train on
  the first step.

**Not in scope:** the train's timing constants (converge/exit), the settled 114 geometry, the
ruler readout (113), vertical text in any other surface.

**Status:** done (`f6b8b2f`).
