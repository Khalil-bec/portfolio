# 113: Ruler to exact scale — 60px lane, 20/10 ticks, travelling rule + hanging readout

**What to build:** ticket 2 of the approved roadmap, closing the "block going up and down, not a line" delta the user called out (2026-10-17, after testing 112). Our ruler has the inspiration's *mechanism family* (document-space scale sliding 1:1 — 110 — with rolling digit drums — 109) but keeps our own chrome form: a 32px lane with 8/4px ticks and a 48px thumb block carrying the readout. Theirs (measured again this session, live + the user's recording) is leaner: a **60px lane** at every width, ticks **20/10**, and the depth marker is a **1px rule spanning the lane** that travels linearly with depth, with the **readout hanging below its right end** — no thumb block (readout geometry corrected at review; see the tail).

**Blocked by:** 112 (done, committed `d76a47c`).

**Measured on the inspiration (2026-10-17, `inspo-band2/4/5.mjs` + the recording):**

- **Lane:** 60px wide, full viewport height, flush to the edge, at every width ≥768 (1440: `1380..1440`; 1800: `1740..1800`). Ours: 32px (`--lane-ruler: 2rem`).
- **Ticks:** hang from the lane's right edge; majors **20px** at 0.8 ink every 5%, minors **10px** at 0.4 every 1% (ours: 8px majors / 4px minors — the same 2:1 ratio at half scale). Labels: **9px mono**, 0.5 ink, one label per 5%, sitting **left of the majors** (measured single-digit box `[~1410, y, 5.7, 13.5]`, right edge 1415.7 — ~4px inboard of the 20px tick tip). Ours: `--font-size-2xs` 9.6px, right-aligned 1px inboard (32px lane constraint — now gone).
- **The marker:** `bg-accent` `rgb(45, 129, 255)`, **1px tall**, spanning the full lane (`inset-x-0`). Mapping measured at 5 depths @1440×1080, docH 5992 (max scroll 4912): `y = 59.4 + 0.2056·scrollY` → dy/dscroll exactly `(1080 − 70)/maxScroll` — i.e. **a linear map of scroll progress 0→1 into a lane span inset ~60px top / ~10px bottom**, independent of the page height. The readout hangs below the rule (their actual geometry — corrected in review; see the tail).
- **Readout:** zero-padded 3 digits + `%` in blue mono (recording: `078 %`, caught mid-roll with the tens digit mid-flight; their blue is `rgb(22,89,196)` — below AA on our ground, so ours keeps `--color-text-bright` per 109's recorded verdict). No opaque block behind it; no pinned `0`/`100` bounds in their lane at any depth.
- **Affordance:** the whole lane is the drag surface — `cursor: crosshair` on the 60px lane (109's measurement), not a grabbable thumb box.

**Decisions taken:**

- **The thumb block retires; the slider stays.** 102's a11y contract (`role="slider"`, `aria-valuenow`, keyboard, drag) moves onto the lane itself: the lane is the slider (whole-lane drag with their crosshair cursor; the driver's keyboard scrolling untouched). The grey block, its borders, `is-covered`'s hiding rule (110: the thumb covered a grade where an opaque box can only slice it) and the thumb's own position rules all die with it.
- **Readout = digits + `%` hanging under the rule, no tag row.** Theirs shows no language tag; the tag's only visual job stays where it already lives — nowhere. The digits roll (109's drum mechanism) and the driver's `aria-valuetext` keeps the 102 spec format (`FR 42 %` — nbsp survives verbatim), so assistive tech loses nothing. The 109 `is-fr` gap on the `%` survives as the row's layout gap (the nbsp itself is a `valuetext` affair).
- **Zero-padded, like theirs.** `078 %`, not `78 %` — a one-character change to 109's drum padding (blank → `0`); the constant row width is preserved either way, and the superseded "never shows a leading zero" note moves to the decisions log.
- **New exact tokens for the tick lengths** (the space-scale tokens don't hold 20/10): `--ruler-tick-major: 1.25rem`, `--ruler-tick-minor: 0.625rem` (the same 2:1 as before, now at the measured scale). `--lane-ruler: 2rem → 3.75rem`.
- **The pinned `0`/`100` bounds retire** (theirs has none): the travelling readout *is* the precise value, and the grades carry the scale. Their lane ends are just the scale's — accepted partial visibility at the very ends, same as theirs; the QAs scan the ends.
- **Found in the visual pass (2026-10-17, adapted during implementation):** (1) **`is-covered` is not retired after all** — with the thumb gone the readout still shares its row with whatever grade it passes (the digits would mush into the label at the narrow lane, and the 1px rule at rest would strike through the `0`), so 110's substitution returns, retargeted from the thumb's centre to the rule's document position, identical mechanism. (2) **The readout drops out ≤768** (`--ruler-readout-display` switch in tokens.css): the riding row (~42px) is wider than the narrow 32px lane and would poke into the content gutter; below 768 the inspiration mounts nothing at all and our 102 keeper is already a stand-in, so there the lane shows rule + ticks + grades and the spoken value survives in `aria-valuetext`.
- **The marker's band = the measured span.** `top` inset `60px`, bottom inset `10px` (theirs measured `59.4/10.3` at 1080 vp): the readout block sits clear of the nav at rest and of the bottom edge at max. The rule's y is a driver-published complete px length (the `--scale-offset`/`--eyebrow-top` pattern — no px math in CSS), so the 110 token-gate finding can't recur.

**Scope:**

- [x] `--lane-ruler` → 3.75rem; new `--ruler-tick-major`/`--ruler-tick-minor` sized 20/10; grades re-aligned to the measured inboard offset; labels at their measured size/position
- [x] Thumb block retired (`.ruler__thumb`, its borders/background, tag row + FR gap — the FR gap itself was later retained, see the decisions above); its a11y role/keyboard/drag re-homed onto the lane (crosshair cursor); `is-covered` retargeted at the rule instead of retired (see the decisions above)
- [x] Marker = 1px full-lane rule (the focus blue already carried by `--color-focus`) travelling the measured span, position published by `ruler.js` as an injected px length; readout (three rolling drums + `%`, zero-padded) hanging below the rule (amended in review — see the tail)
- [x] `0`/`100` bounds retired from markup/JS
- [x] Zero horizontal overflow and zero console errors at 375 / 768 / 1024 / 1440 EN + FR; reduced motion: instant position moves, no rolls; a11y verdicts unchanged (slider semantics, valuetext format); token gate clean; screenshot check; code review
- [x] Regression: qa-112's ruler assertions updated to the 60px lane and re-run green

**Not in scope:** the name layer (114); the letter travel (115); the geometry of 112 (already committed); the scale's 1:1 slide and 1%/5% spacing (110 — unchanged, the new ticks resize its graduations only).

**Status:** in-review.

**Visual check (2026-10-17; `/tmp/opencode/v113-*.png` + `/tmp/opencode/v113s-*.png`, 7 states):** the rest state reads exactly like the recording — the rule at the document's 0 with `000 %` under it, grade 0 covered by the substitution; mid-depth the rule rides between untouchable grades; at max the rule ends 10px off the bottom with the readout flipped above it (grade 100 exits the window); the 375 keeper shows rule + ticks + grades only (readout switch verified); FR rebinds with the `is-fr` gap; reduced motion paints positions instantly (no rolls). QA `/tmp/opencode/qa-113.mjs` — 591 checks, ALL GREEN; `/tmp/opencode/qa-112.mjs` re-run green (373) with its ruler assertion parameterized to the token-resolved lane.

**Review pass (2026-10-17, after user feedback; measured live on the inspiration and folded into this ticket):**

- **The readout does not sit on the rule — it hangs 4px below it.** Measured: rule top 367.8, `%` row 371.8→383.8 @1440 — row top = rule top + 4px, tip-to-tip. ours: `translateY(var(--ruler-readout-gap))` from the marker's top (`--ruler-readout-gap: 0.25rem`). The original `translateY(-50%)` centring (113 first pass) piled the row onto the line — the user called it the same way.
- **At the travel's end the readout flips above the rule.** Measured at max scroll: rule top 1068 (vp 1080), row 1054→1066 — row bottom 2px clear of the rule's top, so the row never leaves the window. ours: `is-above` (ruler.js flips it when the below row would cross the marker's bottom travel line) + `--ruler-readout-clear: 0.125rem`; the flip side and position are asserted in qa-113 per depth, including max.
- **The lane draws no separator against the content.** Theirs: no line at x=1380; the only line inboard is their content wrapper's own `border-x` at 1360 (`max-w-[1280px]`,
  left 80 → right 1360 — a 20px gutter of open ground to the lane). ours: the 102-era `border-inline-start` retired from `.ruler`; our frame border at 1360 is the section box's, identical to theirs.
- **`is-covered` retargeted at the hanging readout** (the previous rule-position window was built for a row centred on the rule): the covered grade is now the one under the readout's box — or under the rule itself (a number under the 1px line reads as struck through) — judged in document space; at ≤768 the readout-based branch is gated off (`display: none` keeps its ghost box from hiding anything).
- **Robustness:** `jumpToClientY` early-returns before the first render has measured the insets (pointerdown before any scroll used to throw); standards review otherwise clean — accepted judgement calls logged (the rem read inside the insets cache; the covered-geometry clump).


