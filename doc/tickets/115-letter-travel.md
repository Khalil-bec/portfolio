# 115: Letter travel — the fixed layer's scroll-linked vertical transit

**What to build:** ticket 4 of the approved roadmap (the last one). The name layer's rows change state at section triggers; at each single-step handoff the inspiration moves the changing word's letters through a **vertical train inside the ruler lane**, rising exactly **1:1 with scroll**, letters **reading the word forward from the bottom** (first letter lowest, last letter topmost), letters **exiting the train top-first** into their new row on a short per-letter ease, with the whole thing **frozen at mid-flight when the user stops scrolling** (pure Y-mapping — measured: cluster tops 789 → 636 → 484 → 332 across four consecutive +150 scrolls) and **letter ink squashing mid-flight** (observed letter box heights 6 → 22).

**Blocked by:** 114 (done, committed `ecb1db1` — its letters spans, row classes and counters are the substrate this rides).

**Measured on the inspiration (2026-10-18, `probe115.mjs` fine sweep):**

- **The train lives in the lane column**: letters at x≈1400 on a 1440 viewport (lane 1380–1440), i.e. centred on the lane's axis (cell centre `vw − lane/2`), cell pitch ≈ **18.8–19.6px** (the row grid's own 20px cell, rounded).
- **Spawn = the 114 state trigger.** The train's slope extrapolates back so the last letter's top passes through the word's old slot letter-Y exactly when `section top + 0.25·vh` is crossed — the same `TRIGGER` 114 already publishes.
- **Rise 1:1 with scroll** after spawn: every letter's train-Y translates by `−ΔY` per frame; no time component in the cruise (idle = frozen, verified at 4.5s).
- **Exit band near ~0.4·vh** (between 339 and 484 measured on 1080): each letter leaves the train the frame its train-Y crosses the line, then time-eases (~0.3–0.4s) into its target position — the arrival is **staggered by geometry alone** (the topmost letter crosses the line first), landing top-letter-first exactly as measured (ESR settled while F still cruised at y950).
- **Two trains coexist** (region B shows `HSRENWO` + `YTINUMMOC` riding simultaneously) — ours: per-row flights are independent, no cross-word coordination.
- **Ink:** flight letters read muted (their grey) while in the column; the row ink of the new state applies at landing; letter form morphs along the exit (our fs16→fs32 story = their constant-fs squash-stretch; our scale(2) morph replicates the same visual).

**Decisions taken:**

- **JS owns the flight, CSS owns the geometry** (the marker/`--eyebrow-top` precedent): settled rows remain 114's token math untouched — the flight letters are the row's own spans, temporarily `position: fixed` inside the anchor (containing block = viewport, the layer's box) with JS-updated `left/top`/transform, and **restored to static flex all at once when the word's flight completes**, so every landing matches the flex layout measured at flip (no post-landing slide).
- **Endpoints are read, not modeled**: at the flip frame, name.js reads the letters' rects *before* the class flip (old positions), applies the flip, then reads again *after* (targets + anchor rects) — one synchronous layout per handoff. Big forms measure natively in the new state; no analytic glyph model.
- **The flight is three phases per letter**: converge (time ease ~240ms: row → train slot in the lane), cruise (Y-locked: each letter's train-Y = spawn + slot offset − ΔY), exit (time ease ~380ms with the fs morph via transform scale, staging at the measured target; the row restores static when its *last* letter lands).
- **Letters in the column are muted** (`--color-text-muted`); colour flips to the new state's ink at exit.
- **Scrubs snap**: a change of more than one step between frames never flies (letters land in the settled states directly — 114's behaviour). A new handoff while a word is mid-flight: the interrupted flight completes instantly, then the new one starts (one snap, no overlap conflicts on the same letters).
- **Resize / language switch mid-flight completes everything instantly** (targets go stale on reflow; the seam stays honest).
- **`prefers-reduced-motion`: no flights at all** — handoffs stay 114's instant states.
- New token: `--name-transit-cell: 1.25rem` (the 20px cell = the lane-column pitch). Constants `EXIT_TOP = 0.4` (upward exit line, ÷vh), `EXIT_BOTTOM = 0.55` (downward exit line, ÷vh — **unmeasured on the inspiration**, which was only probed scrolling down; the downward mirror is our symmetry choice, logged here), `CONVERGE_MS = 240`, `EXIT_MS = 380` are JS tuning constants (the driver-constant precedent), documented here.
- **Settle at the page's end:** at max scroll a just-spawned flight can outrun the remaining scroll (the last handoff sits ~270px above the end, its exit band needs ~580–680px), so the letters would park mid-lane forever — the inspiration's own final word landed near its bottom instead. Decision: at max scroll (±0.5px) active flights settle to their targets — **the page's end state is always the settled layout, never a parked train**; mid-page idle trains stay frozen (the measured behavior).

**Scope:**

- [ ] name.js: flip detection (single-step delta), per-letter flight engine (converge/cruise/exit), static restore on completion, resize/lang/scrub snap paths, reduced-motion gate off
- [ ] tokens.css: `--name-transit-cell` (+ narrow queries inherit — no narrow switch, the layer is unmounted ≤768)
- [ ] QA: train geometry determinism (per-Y exactness), 1:1 slope assertion, idle freeze at mid-flight, exit order (top letters first), completion restores 114's settled geometry exactly (qa-114 re-run green), scrub/faster-handoff/reduced/FR-midflight paths, no overflow/errors
- [ ] Screenshots mid-flight states; discover/check lane reads (letters under the ruler, muted ink); token gate clean; code review (both axes)

**Not in scope:** the horizontal scroll events themselves; the readout (113); changes to 114's settled geometry (asserted unchanged).

**Status:** implemented; QA green (qa-115 167 checks; qa-114 1070 / qa-113 591 / qa-112 373 regressions; token gate clean).
