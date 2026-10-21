# 130: Names layer — the title names the section you have reached

**Status:** `done` (2026-10-21) — `a00debd`. Reviewed (both axes); the review's
findings are applied and recorded below.

**Why (user report, 2026-10-21):**

> "its still not what i want, i want the the section title in the scroll ruler to
> appear just when i discover the section not at its middle — take a look at
> getartcraft and see exactly how"

129 had replaced 114's fixed offset with an **occupancy** rule: the title named
the section that covered the most of the screen, so it changed when the new
section reached the **middle** of the viewport — the thing the user rejected.
The ask is the earlier moment: the title changes when the section is
**discovered**, i.e. when its top crosses the viewport's bottom edge.

**Measured reference (getartcraft.com, 1440×900, dark, `probe` in
`/tmp/opencode/inspo-*.mjs`):** their names layer is a `fixed inset-0` overlay
whose section words are per-letter spans whose `transform` matrix carries the
state — **scale 0.4706 + warm gray** for a word at rest, **scale 1 + full ink**
for the current one, and anything in between while a word is in flight. The
handover is the moment the incoming word's flight **spawns** (its letters leave
the resting scale) and the settled word changes ~800 px later — the flight is
scroll-linked and long, so the *visual* settle is not the rule.

Measured spawn depths against the sections' bands
(`hero 49–901, features 943–3497, ownership 3497–4152, made-with 4152–4693,
start 4693–5199`):

| Incoming word | Flight spawns | Section's top enters the viewport | Visible at the spawn |
| --- | --- | --- | --- |
| FEATURES | 129 | 43 | 86 px (9.6 %) |
| OWNERSHIP | 2644 | 2597 | 47 px (5.2 %) |
| COMMUNITY | 3273 | 3252 | 21 px (2.3 %) |
| GET STARTED | 3813 | 3793 | 20 px (2.2 %) |

**The reference hands over at discovery** — 20–86 px after the section's top
crosses the viewport's bottom edge, with the new section filling 2–10 % of the
screen. Never at the middle, never later. (The spawn was read per word from
the word's own letter range in the overlay, so a flight in progress could not
be mistaken for another word's.)

**What was built (`src/names/name.js`):**

- The current row is now **the section the page has reached**: the last one in
  document order whose top has entered the viewport (`top ≤ scrollY + vh`).
  The title therefore names a section the moment it is discovered, and it
  never trails the page. Before the first named section is reached (the hero,
  which has no row of its own since 119) the first row stays current — the
  layer's behaviour since 114, unchanged.
- `currentSection()` keeps the same shape — bands in, index out — and the
  harness re-implements the rule independently (it asserts the *documented*
  rule, so it is a second implementation, not a call into this one).
- `measureBands()` now returns **null** for a section the markup does not
  have, instead of a `{top: 0, bottom: 0}` band. Under the reached rule a
  zero band would satisfy `top ≤ scrollY + vh` on every frame and could win
  the state — a latent bug in 129's version, closed here.
- The letter travel (115) is untouched: it still spawns at the state flip and
  still rides 1:1 with scroll. Only the flip's depth moved — **every handover
  is 450 px earlier** than under 129's occupancy rule (1440×900, EN: projects
  1011 → 561, skills 2882 → 2432, education 3626 → 3176, contact 4076 → 3626)
  and 675 px earlier than under 114's trigger (projects 1236, skills 3107,
  education 3851, contact 4301). **About has no handover**: it is the first
  row, so it stands in from scrollY 0 under both rules — its own reached
  depth (944 − 900 = 44) is never a visible change. The exit geometry (the
  0.4·vh line) is unchanged, and the **distance from the last handover to the
  page's end grows 523 px → 973 px** (max scroll 4599): more scroll in which
  a train can finish its exit.
- No CSS change, no token change, no markup change.

**Evidence (fresh, 2026-10-21):**

- Probe sweep at 1440×900, EN and FR: the current row is the section reached
  at every sampled depth, and it flips **exactly at the boundary** — one pixel
  before the section's top crosses the viewport's bottom edge the previous
  section is still named; at that pixel the new one is. The reference's own
  handover is 20–86 px *after* that pixel.
- The reported failure now reads correctly: at scrollY 4082 (contact fully in
  view) the title is **#contact** — under 114's trigger it was **#education**,
  under 129's occupancy rule it was **#education** too.
- Harness: **148 passed, 0 failed** (`npm run verify:fast`; the full gate adds
  the 10 Lighthouse and screenshot checks). The 129 checks were rewritten
  against the new rule: `names.current-section-*` now samples **the flip
  boundary itself and the pixel before it** (plus the section centred and
  fully in view, depth 0 and max scroll), and `names.current-visible-*` became
  `names.current-reached-*` — the title must never name a section the page
  has not reached (the hero's first-row fallback is the documented exception).
  - **The checks were validated against both old rules.** Restoring 129's
    occupancy rule turns the gate red at every boundary —
    `#contact@3626 got=#education want=#contact`, `#education@3176 got=#skills
    want=#education`, … — and restoring 114's `0.25·vh` trigger turns it red
    at the reported depth too: `#contact@4082 got=#education want=#contact`.
    EN and FR, at 1440 and 1024 (144 passed, 4 failed in both runs).
- Visual QA approved (0 failures): 1440 / 1024 / 375 × EN + FR + reduced —
  no horizontal overflow, no console errors, the layer unmounts ≤768, exactly
  one current row at every boundary, contact holds through the footer, and
  reduced motion shows the instant state with no flying letters. Screenshots
  `/tmp/opencode/v130-*.png` (the `*-before-handover.png` / `*-handover.png`
  pair is the moment of the change).
- Letter travel still flies: **16–20 letters airborne** at each handover
  (measured in-page at 1440×900, EN and FR), 7 still airborne a few hundred
  px later; reduced motion: 0 airborne, no flight.

**Superseded rule (ticket 129):**

129's occupancy rule is **superseded by 130**. Its reasoning (a fixed offset
trails the page) and its measurements stand as the record of what was tried;
the live rule is the reached rule in 130. 129's other work — the band
measurement seam, the pure `currentSection()` seam, the harness checks and the
`i18n.keys-resolve` mode-blind defect fix (ticket 125's) — is carried
forward unchanged.

114 and 115's recorded trigger (`0.25·vh`) was already superseded by 129 and
is now superseded by **130** as well. 121's footer-length requirement was
relaxed under 129 and **still holds** under 130: at max scroll education
measures 0 px and contact 383 / 383 / 242 / 81 px (1440 / 1024 / 768 / 375),
so contact is the only named band on screen and is current at every width.

**Scope:**

- [x] `src/names/name.js`: the reached rule in `currentSection()`;
      `measureBands()` returns null for a missing section; the 115 travel
      untouched.
- [x] `tools/qa/verify.mjs`: `names.current-section-*` rewritten for the new
      rule (the flip boundary and the pixel before it are sampled);
      `names.current-visible-*` → `names.current-reached-*`.
- [x] Ticket 129 marked superseded by 130.
- [x] Harness green (148/0 fast); visual QA approved; screenshots written.
- [x] Decisions appended (`doc/idea-v3-decisions.md`); `doc/status.md` updated.
- [x] Code review (Standards + Spec) — both axes, 2026-10-21, findings applied:
      the fallback named row 0 even when that row's section was missing (it
      now stands in the first row that *has* a section, and returns −1 when no
      row has one); `measureBands()` carried a `bottom` field that only 129's
      occupancy rule read (retired with it — the band is the top edge now);
      the handover figures in this ticket were labelled one section off
      (corrected above: projects/skills/education/contact, and about has no
      handover); the harness's own `i18n.v1-survival` passed vacuously and
      `architecture.local-assets` could no longer see the injected vendor
      scripts (both fixed in ticket 125).
- [x] User approval before commit (tickets 125–130 are all uncommitted).
