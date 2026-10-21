# 129: Names layer — the current title names the section in view

**Status:** `done` (2026-10-21) — `a00debd` (with 130; 129's occupancy rule is
superseded by 130, its record stands).
**Superseded in part by 130** (2026-10-21) — the occupancy rule below is the
live rule no more: the user rejected the title changing at the section's
**middle** and asked for the moment the section is **discovered**. Ticket 130
implements that (the section the page has reached), measured against the
reference; this ticket's rule, its reasoning and its measurements stay as the
record of what was tried. Everything else here — the band measurement seam,
the pure `currentSection()` seam, the harness checks and ticket 125's
`i18n.keys-resolve` mode-blind defect fix — is carried forward unchanged.

**Why (user report, 2026-10-21):**

> "you put the education title (the vertical one that goes up when you reach
> the section) when you reach contact, and contact when you reach the footer —
> so i want all the titles proportional to when you reach its section"

The names layer's current word lagged the page by one section. The ruler
showed **education** while the contact section was already on screen, and
**contact** only once the footer was in view.

**Root cause (measured, not assumed):**

`src/names/name.js` decided the current row from a single fixed viewport
offset — 114's `TRIGGER = 0.25`: a section became current only once its **top**
had risen into the top quarter of the viewport (`section.top ≤ scrollY + 0.25·vh`).
A section's top enters the viewport a full viewport *before* that line, so
every title trailed the content by up to a quarter of the screen. The short end
sections never caught up: education (450 px) and contact (456 px) could only
flip once their top had climbed to 225 px, which by then meant the footer.

Measured before the change (1440×900, document: about 944–1461, projects
1461–3332, skills 3332–4076, education 4076–4526, contact 4526–4982, footer
4982–5499; `maxScroll` 4599):

| Scroll position | What is on screen | Current title (before) | Correct |
| --- | --- | --- | --- |
| 3626 | education fills the lower half | **skills** | education |
| 4082 | contact fills the lower half | **education** | contact |
| 4599 (max) | footer in view | contact | contact |

**Decision (user, 2026-10-21):** the title must be proportional to the section
reached; **no footer row** — contact holds through the footer.

**What was built (`src/names/name.js`):**

> **Superseded by 130:** the occupancy rule described in the first bullet below
> is replaced by the reached rule (the last section whose top has entered the
> viewport). The other bullets still describe the live code.

- The current row is now **the section the viewport is actually looking at**:
  the one whose band covers the most of the screen. A tie goes to the **later
  section in document order** (the one being scrolled into on the way down),
  so the handover lands at the halfway point instead of trailing. Before the
  first named section is on screen (the hero, which has no row of its own
  since 119) the first row stays current — the layer's behaviour since 114,
  unchanged here.
- `measureTops()` → **`measureBands()`**: the measurement seam now records each
  section's document-space **band** (top *and* bottom), whole-px, re-measured
  on resize, completed font loads and language switch (114's seam, unchanged
  in cadence).
- The rule itself is a **pure seam**, `currentSection(bands, scrollY, vh)` —
  bands in, index out — so it can be reasoned about on its own instead of
  living inline in the render callback. The QA harness re-implements the
  rule independently: it asserts the *documented* rule, so it is a second
  implementation, not a call into this one.
- `TRIGGER` retired — the rule is no longer a fixed offset.
- The letter travel (115) is untouched: it still spawns at the state flip and
  still rides 1:1 with scroll. The handover happens **225 px earlier** in the
  scroll: the contact handover moves from scrollY 4301 to 4076, so the
  distance from the handover to the page's end grows from **298 px to
  523 px** (max scroll 4599) — more scroll in which a train can finish its
  exit. The exit geometry itself is unchanged (the 0.4·vh line,
  viewport-relative).
- No CSS change, no token change, no markup change: the rows, the stack, the
  geometry and the 2× current word are exactly as 114/127 built them.

**Evidence (fresh, 2026-10-21):**

- Probe sweep at 1440×900 and 1024×800: at every depth the current row is the
  section in view — rest → `#about`, about → `#about`, projects →
  `#projects`, skills → `#skills`, education → `#education`, contact →
  `#contact`, footer → `#contact` (held, no footer row).
- The two reported failures now read correctly: `education @ fully-in-view`
  (3626) → **#education** (was #skills); `contact @ fully-in-view` (4082) →
  **#contact** (was #education).
- Harness: **158 passed, 0 failed** (`npm run verify`; **148/0** with
  `verify:fast` — the 10 Lighthouse and screenshot checks are the difference).
  The harness grew by **12**: eight new checks — `names.current-section-*` and
  `names.current-visible-*` at 1440 and 1024 (×900) × EN and FR — plus four
  incidental `settle.names-*` settle checks. The expected value in the
  harness encodes the documented rule (occupancy, ties to the later
  section); the point of the check is that the rule holds at **every
  sampled depth**, including the ones where 114's old trigger named the
  previous section.
  - **The checks were validated against the bug**: restoring 114's
    `0.25·vh` trigger makes the gate go red at exactly the reported depths —
    `#education@3626 got=#skills want=#education` and
    `#contact@4082 got=#education want=#contact` — in EN and FR, at 1440 and
    1024 (144 passed, 4 failed). The sampled depths are the section centred in
    the viewport **and** the section fully in view; the latter is where the
    old rule named the previous section.
  - **The one documented exception is asserted, not assumed.** Depth 0 (the
    hero, where no named section is on screen) is sampled too, and the
    expected value there is the **first row** — the layer's behaviour since
    114. `names.current-visible-*` then asserts the stronger property: once
    a named section *is* on screen, the current title is never a section
    that is off it.
- Lighthouse unchanged: mobile **97 / 97 / 97**, LCP **2257 / 2258 ms**, a11y
  **100 / 100 / 100**; desktop **98**, a11y **100**.
- Letter travel still flies: **16 letters airborne** on the downward
  education → contact handover, measured in-page at scrollY 4095 / 4158
  (7 still airborne at 4218, the train settling as it exits) —
  `/tmp/opencode/v129-train-*.png`. Reduced motion: 0 airborne, no flight.
- Geometry invariants from 114 re-verified at 1440×900 and 1024×800, EN and
  FR: the
  anchor's right edge at `vw − 56`, the letters ending exactly at the ruler
  lane's edge (1380 / 964), the current word the widest, zero horizontal
  overflow, zero console errors; the layer unmounts ≤768; reduced motion
  shows the instant state with no flying letters.

**Harness defect found and fixed (`tools/qa/verify.mjs`):**

`i18n.keys-resolve` required every bound key to be a **string**, but
`skills.all` is an **array** bound with `data-i18n-mode="join"` (ticket 118's
ticker source). The check is now mode-aware: a `join` binding must resolve to
an array in both dictionaries, every other binding to a string. The defect is
in **ticket 125's** audit, not in 129's logic, so it is recorded and amended
in `doc/tickets/125-verification-harness.md`; the fix rides the same
uncommitted batch because the gate cannot be green without it.

**Superseded rules (tickets 114, 115 and 121):**

114's "The trigger" bullet and 115's "Spawn = the 114 state trigger" bullet
both recorded the `0.25·vh` offset as the live rule. Both are now marked
**superseded in part by 129**; the measured figures stay as the record of what
the inspiration did. 115's travel is unchanged — it still spawns at the state
flip and still rides 1:1 with scroll — only the flip's depth moved.

121's footer-length requirement is the third consequence: it was derived from
114's trigger (`contact.top ≤ maxScroll + 0.25·vh`, margin 298 at 1440). Under
the occupancy rule the requirement **relaxes** — at max scroll education
measures **0 px** and contact **383 / 383 / 242 / 81 px** (1440 / 1024 / 768 /
375), so contact is the only named band on screen and is current at every
width; the footer now only has to stay shorter than the viewport. 121 is
marked superseded in part; its footer's height was also sized for its own
reasons, which this ticket did not change.

**Scope:**

- [x] `src/names/name.js`: band measurement + most-visible current rule;
      `TRIGGER` retired; the 115 travel untouched.
- [x] `tools/qa/verify.mjs`: `names.current-section-*` +
      `names.current-visible-*` regression checks at 1440 + 1024 × EN + FR,
      validated against the bug. (The `i18n.keys-resolve` join-mode fix in
      the same file is **not** 129's scope — it is ticket 125's defect,
      recorded and amended there; it rides this batch only because the
      gate cannot be green without it.)
- [x] Tickets 114, 115 and 121 marked superseded in part.
- [x] Full harness green; Lighthouse unchanged; screenshots at 1440/1024/375
      × EN/FR + reduced.
- [x] Decisions appended (`doc/idea-v3-decisions.md`); `doc/status.md` updated.
- [x] Code review (Standards + Spec) — both axes run; the findings above
      are applied.
- [x] User approval before commit (tickets 125–129 are all uncommitted) —
      approved by the user 2026-10-21; the batch ships with 130's reached
      rule, so 129's occupancy rule is history (its record stands).
