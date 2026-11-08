# 133: Names on phones — the reached title rides the narrow ruler

**Status:** `todo`

**Why (phone pass, 2026-11-08):**

> "the ruler doesnt have the section texts"

At ≤768 the names layer is unmounted (`--names-display: none`, ticket 114) and
the ruler's readout is retired (`--ruler-readout-display: none`, 113): the
narrow keeper is ticks and grades only. Both followed the reference, which
mounts neither below 640. On a phone the ruler therefore says *how far* but
never *where*.

**Decision (user, 2026-11-08):** show the **current section only** — one label
on the narrow ruler naming the section you have reached. No five-row list, no
letter travel, no jump targets. See `doc/idea-v3-decisions.md` (2026-11-08
phone pass); this amends 114's narrow switch, not its desktop layer.

**What to build:**

- **Rule — reuse, do not reinvent:** the label names `currentSection()` from
  `src/names/name.js` (130's **reached** rule: the last section whose top has
  crossed the viewport's bottom edge). The same `measureBands()` input, the
  same "missing section drops out" contract, the same keys the desktop rows
  bind. The hero is uncounted (122): while no named section is reached the
  label is empty / hidden.
- **Form:** an **upright letter column** in the 2rem narrow lane — one letter
  per `--name-transit-cell`, first letter on top (the 115/124 train's reading
  order and 109's upright-glyph rule; nothing in the chrome reads sideways).
  Pinned at the top of the lane, under the nav bar, at `--name-stack-top`
  depth or a new narrow token. Mono uppercase, the current-word ink.
- **Collisions:** the column sits over the ruler's grades. Give it the lane's
  ground as a backing so grades pass beneath it, the way 113's readout row did;
  the travelling rule may pass behind it. Measure the longest word in both
  languages (FR is the longer set) against the shortest supported viewport
  (iPhone SE 375×667 and landscape phones) — if the column does not fit, it
  steps the cell down; record the numbers.
- **Handover:** a short cross-fade on the swap (≤ 200 ms, a token); reduced
  motion swaps instantly. No per-letter flights at narrow widths.
- **Mounting:** `name.js` gains a narrow branch keyed on
  `matchMedia("(max-width: 768px)")` with a `change` listener, so rotating or
  resizing across 768 swaps desktop layer ↔ narrow label without a reload and
  without leaving stale state either way. The desktop layer's behaviour above
  768 is untouched. The label rides the same driver frame (one loop, 102).
- **Semantics:** `aria-hidden="true"`, no pointer events — it is a visual
  locator; the section headings and the 132 menu carry navigation and
  structure.
- **Stacking:** below the 132 panel and the nav bar (`--z-*` tokens), above
  content.
- **Tokens** (`tokens.css` narrow block): `--names-display` stays `none` for
  the desktop layer; a new `--names-narrow-display` (and position/fade tokens)
  owns the label.

**Out of scope:** tap-to-open list, letter travel at narrow widths, the %
readout (stays retired), desktop names behaviour.

**Blocked by:** 132 (z-order against the open panel, and the bar height the
label pins under).

**Scope:**

- [ ] `name.js`: narrow branch reusing `currentSection()`; media-change swap.
- [ ] `name.css` + `tokens.css`: the narrow label, its tokens, its backing.
- [ ] i18n: no new keys expected (reuses the rows' keys); language switch
      rebinds the label.
- [ ] Harness: `names.narrow-{en,fr}` at 375 and 390 — label empty in the
      hero; at each band boundary (top crossing the bottom edge, ±1 px) it
      names the reached section; it never trails or leads by a section.
      `names.narrow-swap` — resize 1440 → 375 → 1440 leaves exactly one
      surface mounted. The existing desktop `names.*` checks stay green.
- [ ] Decisions entry: the form, the longest-word measurement, the fade
      duration.

**Verify** (`.opencode/skills/visual-qa`, `.opencode/skills/scroll-motion`):

- [ ] `npm ci && npm run verify` green, including `qa-124`-style letter-travel
      and `flip.contact` regressions on desktop.
- [ ] Screenshots 375 / 390 / 430 / 768 EN + FR at hero, each section's
      handover, and the footer, plus device-emulated iPhone 13 and Pixel 7:
      the label readable, no collision with grades, nav, panel or content,
      no horizontal scroll.
- [ ] Landscape phone (e.g. 844×390): the column fits or steps down.
- [ ] Reduced motion at 375: instant swaps.
- [ ] 1440 names layer unchanged.
- [ ] Mobile Lighthouse median ≥ 90, LCP < 2.5 s, CLS ≤ 0.056, a11y 100
      (`name.js` loads on the motion path, after the paint — 126).
