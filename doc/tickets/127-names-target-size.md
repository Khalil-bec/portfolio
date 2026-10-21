# 127: Names layer target size

**Status:** `done` (2026-10-21) — `4aedc2b`. Reviewed (both axes, findings applied).

**Why (ticket 125 baseline, 2026-10-20):**

Desktop accessibility was **96** (was 100 before v3). Lighthouse `target-size`
failed on `body > div.names > a.names__row`: five fixed rows were 24 px tall on
a **20 px pitch** (`--name-pitch: 1.25rem`), recreating the reference's
deliberate 4 px overlap. Adjacent links therefore overlapped, violating WCAG
2.5.8 AA (24 × 24 target size or 24 px spacing). Mobile is unaffected because
the layer is hidden ≤768.

**Decision (user, 2026-10-20):** fix the pitch rather than accept the AA
deviation.

**What was built (`src/styles/tokens.css`):**

- `--name-pitch: 1.25rem → 1.5rem` (24 px), matching `--name-row-h`. Rows then
  touch instead of overlap; every target is 24 px tall with 24 px spacing.
- `--name-transit-cell` stays `1.25rem` (the letter train's reading pitch is a
  separate measured value; 115's geometry is computed from live rects).
- No stack/word-gap retune was needed: the five rows still fit at 1440×900 and
  1440×1080, the current word keeps its 2× letter scale and air, and the contact
  flip lands.

**Evidence (fresh, 2026-10-20):**

- `names.target-size`: `minGap=0.0`, heights `40/24/24/24/24` — green.
- Desktop Lighthouse accessibility **100**; performance **98**.
- 1440 rest/mid/deep screenshots: no collisions; the letter travel still runs
  (`qa-124` **69/69** green), contact flip still lands (harness
  `flip.contact`; `qa-121` **246/246** green).
- Full harness: **106 passed, 0 failed**.

**Scope:**

- [x] `tokens.css`: pitch token; no geometry retune needed (recorded here).
- [x] Verify: `names.target-size` green (`minGap >= -0.5`, heights ≥ 24);
      desktop Lighthouse a11y **100**; the five rows still fit the stack at
      1440×900 and 1440×1080; current word remains 2× letters with its air;
      contact flip still lands; 115 letter-travel regression (`qa-124`) green.
- [x] Screenshots: 1440 rest / mid / deep, no collisions.
