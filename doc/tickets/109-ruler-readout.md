# 109: Ruler readout orientation (upright digit drums)

**What to build:** The deferred "ruler readout orientation (tilted writing)" item — the last named piece of the "ruler feel" gap. Our readout (`EN 42%` / `FR 42 %`, ticket 102) is set in `writing-mode: vertical-rl`, so every glyph renders sideways inside the 28px lane. Rebuild it with the inspiration's measured mechanism: the value is a row of **per-place digit drums** — each place is a one-glyph window (`overflow: hidden`) over a vertical strip of digits, and the strip rolls to the current digit through a CSS transform. The readout keeps its spec format in `aria-valuetext` and stays aria-hidden chrome.

**Blocked by:** 108 (committed `7805f68`).

**Measured reference (getartcraft.com, 1440x900, dark):** the readout is three `.ruler-digit-col` cells sitting adjacent in one row (x≈1413–1431, `%` at x=1432) — each a clipped ~6×9px window holding the digits `0-9` stacked, `transform` transition `0.28s cubic-bezier(0.2, 0.9, 0.2, 1)`, 9px mono, blue `rgb(22, 89, 196)`. Their per-digit step is 18px at a 9px font (leading between lines); **we use a contiguous `1em` step instead** — a real odometer has no gap passing through the window. Their ruler lane is 60px wide with `cursor: crosshair` (the whole lane is the drag surface); ours is a 28px lane with a real slider thumb, and that drag surface stays as 102 decided. Their remaining ruler chrome (a *document-space* scale: 1% of the document = 58px, ticks sliding 1:1 past the window; majors 20px/80% ink, minors 10px/40% ink, labels every 5 at 9px/50% ink) is the **scale**, not the readout — it is out of scope here and named for the next ruler ticket (110).

**Design (a 28px lane, so the row is tight):** two stacked lines inside the existing thumb — the dict-sourced tag (`EN`/`FR`) over the value row (3 drums + `%`).

- **Three drums, blank-padded:** hundreds (blank, `1`), tens (blank, `0`–`9`), ones (`0`–`9`). The lane's content box is 28px, so the row must fit three digit slots + the FR gap + `%`; blank padding keeps the row width **constant** (no re-centering shift at 10% / 100%) and avoids leading zeros (`0%`, `42%`, `100%` — never `042%`).
- **New type token `--font-size-2xs: 0.6rem` (9.6px):** at the mono advance (0.6em) three digits + `%` measure 23.75px, and the FR narrow gap (`--space-2xs`, 4px) brings the widest row to 27.75px inside the 28px content box (measured in the browser, not just computed — the fallback mono's advance is a hair over 0.6em). `--font-size-xs` (12.48px) cannot fit (~30px). A micro step is faithful — the inspiration's own readout digits are 9px.
- **Drum geometry stays in CSS, and the step is a token:** window `block-size: var(--ruler-drum-step)` + strip `line-height: var(--ruler-drum-step)` + the roll `translateY(calc(index × step × -1))`, so one value owns the clip height, the line box and the roll step. **The step is `1.2rem` (2 × `--font-size-2xs`), not 1em — screenshot-driven change:** at a 1em step the 3× check caught a ~1px sliver of the *next* digit inside the window at rest (a line box of 1em is smaller than the font's content area, ~1.16em, so the neighbour's ink bleeds into the clip). A 2× step is exactly what the inspiration's own strip uses (18px per digit at a 9px font), and it also centres each digit in its window with air. The thumb grows 39px → 48px as a consequence (logged).
- **Roll:** `transition: transform var(--duration-base) var(--ease-standard)` (the inspiration's 0.28s / cubic-bezier — a near-match, no new duration or easing tokens). The drums start settled: an `is-live` class lands one frame after the first paint, so a mid-page load / deep link opens at rest instead of spinning from `0` — `render()` forces a layout read (thumb height) *before* it sets the index, which is exactly what would start a roll without that guard.
- **Reduced motion:** the existing global kill-switch (`--duration-instant`) snaps the drums — no new handling, no movement.
- **Colors:** tag `--color-text-subtle`, digits `--color-text-bright`, `%` `--color-text-subtle` (the ramp 105/108 already own; the inspiration's blue readout is echoed by our blue progress line instead of re-coloring the digits, keeping 105's monochrome-accent direction).
- **Copy/sanction:** the tag stays dict-sourced (`lang.en` / `lang.fr`), digits and `%` are chrome (the existing sanction family), and `aria-valuetext` keeps the exact spec format (`FR 42 %`, nbsp) — only the *visual* FR space becomes a narrow layout gap instead of a full glyph.
- **Driver seam:** `frame()` passes structured pieces (`{ ratio, percent, tag, french, text }`) instead of one formatted string — the view needs per-place digits and cannot parse the format back; `text` stays the canonical `aria-valuetext`. `refreshRuler()` (language switch) needs no change.

**Not in scope:** the tick scale/readout labels (ticket 110), lane geometry / viewport centering (110), the thumb's drag surface and touch behaviour (102/103 decisions).

**Status:** in-review

- [ ] The readout renders upright: no `writing-mode: vertical-*` anywhere in the ruler, measured glyph row horizontal
- [ ] Three drums show the current depth (blank-padded, no leading zeros) and the visible glyph per drum concatenates to `percent` at every sampled depth
- [ ] The strip rolls on change through a transform transition matching `--duration-base` / `--ease-standard`; the first paint is settled (no load-time spin)
- [ ] Readout width is identical at 5 / 42 / 100 and fits inside the 28px lane at 1440 and 375 (no overflow)
- [ ] `aria-valuenow` = percent and `aria-valuetext` = the spec format (`EN 42%` / `FR 42 %` with nbsp) — contract unchanged; FR renders the narrow gap before `%`
- [ ] Reduced motion: drums snap (no roll), digits still correct
- [ ] Drag + keyboard (arrows / Home / End / PageUp / PageDown) unchanged; token gate clean; no new copy or keys; zero console errors
