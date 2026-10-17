# 112: Band geometry — centred column, overlay chrome, no reservation

**What to build:** the last open v2 item (§3 of `doc/inspo-vs-product-colors-borders.md`, plus the 2026-10-17 recording analysis). Today the right edge *reserves* layout width: `--lane-total` (rail 120px + ruler 32px = 152px) is `body` padding-inline-end, so the container is centred inside the *padded* box and the whole content column sits 76px left of true centre — the "cheap asymmetry". The inspiration (measured again this session, `inspo-band*.mjs` + the user's recording) has **no reservation at all**: a centred column, and chrome that overlays the right gutter as marginalia. This ticket installs that model and retires the rail.

**Blocked by:** 111 (done, committed `e5f95e5`). Approved by the user ("go ahead", 2026-10-17; plan + scope in the chat and `doc/idea-v2-decisions.md`).

**Measured on the inspiration (2026-10-17, live + `/home/khalil/Downloads/Screen_Recording_20261017_194347_Orbiscreen.mp4`):**

- **Column = centred container, nothing reserved.** Section content bounds: 293..1507 @1800, 113..1327 @1440, 33..991 @1024, 33..735 @768 — i.e. `max-width: 1280px`, `padding-inline: 32px`, `margin-inline: auto` at every width (their hero container chain is `max-w-[1280px] mx-auto`; content ≈ 1214-1216 = 1280 − 2×32). Chrome overlays the right edge: the ruler lane is 60px wide at the very edge at *every* width, and at ~1000px it grazes the content's right edge — they tolerate the overlap rather than reserve.
- **No persistent second rail.** There is no desktop label list; the "section list" *is* the name layer (one `fixed inset-0` overlay, one `Jump to X` anchor per section) — ticket 114's build.
- **Narrow: the chrome is simply missing.** At 640 and 375 the DOM holds neither the ruler lane nor the name layer (React unmounts them) — just content plus a near-full-width sticky eyebrow bar. Note their native scrollbar is visible there; our native bar is hidden in every mode in favour of the ruler (102).
- **Bar and nav geometry that ours already match structurally:** nav full-bleed ~48px; the sticky bar frame-bound (measured `[81, 48, 1278]` @1440 = the container's width), pinned flush under the nav. 106/107 already build this — only the reservation offset moves ours.

**Decisions taken (user-approved plan, 2026-10-17):**

- **The rail retires in this ticket, not in 114** (a deviation from the approved plan's sequencing, forced by the approved content): a fixed 120px rail lane and "no reservation" cannot coexist, so once the body padding goes, the rail must go with it. The nav's mono section links keep the jump affordance (theirs does the same); 114 reinstates the list in the inspiration's name-layer form. The 103/108 settle dynamics ship as superseded — recorded as accepted loss, not regretted cost.
- **The ruler survives ≤768** (unlike theirs, which unmounts it): our native scrollbar is *hidden in every mode* (102), so the ruler is the only scroll readout — hiding it on mobile would regress 102's contract. And it is geometrically free: with the reservation gone, the 32px lane sits exactly on top of the 2rem padding gutter — the measured arithmetic: at every width a full-width frame's right padding (2rem) + border (1px) = 33px vs the 32px lane, nowhere an overlap, and above 1280px the gutter is 80px wider still (QA: deepest content ≤ vw−33 at 375/768/1024/1440). The accepted divergence from "exactly like theirs" is logged here and in the decisions log.
- **The 768px boundary stays single:** rail retirement needs no media query at all; `--eyebrow-meta-display` (111) stays the narrow query's other switch.

**Scope:**

- [x] `body` loses `padding-inline-end: var(--lane-total)` (base.css); the column centres in the plain viewport
- [x] `--container-pad` → flat `2rem` (theirs, measured: 32px at every width; content width 1216 inside 1280)
- [x] All the lane-correction recipes simplify: `.section::after` → true 50% centring; `nav.css` and the ticker lose their `--lane-total` negative margins and the compounded padding-inline-end; the bar keeps its frame-bound form (unchanged from 106)
- [x] Rail retired wholesale: `index.html` markup (lines 329–341) + `<link>`, `src/rail/rail.js` import/`initRail` call in `src/main.js`, both rail files deleted, `--lane-rail`, `--lane-rail-narrow`, `--z-rail` and the dictionaries' `rail.aria` block retired in EN + FR; comments referencing the rail updated
- [x] `--lane-total` has no consumers left → retire it and the narrow re-point (the 768px query keeps only `--eyebrow-meta-display`); the full-bleed consumers' comments corrected
- [x] Ruler unchanged at 32px, now overlaying: verified zero overlap between the lane and any section's inner content at 375 / 768 / 768+ / 1024 / 1440 (lane fits the 33px pad+border gutter when the frame is full-width; gutter = 80+32 when centred)
- [x] Full-bleed rules meet the centred column cleanly: no doubled lines, no gaps at the frame's side borders, ticker adjacency intact, at 375 / 768 / 1024 / 1440 EN + FR
- [x] Zero horizontal overflow and zero console errors in all configs; reduced motion unaffected (all-CSS geometry change); token gate clean; screenshot check; code review

**Not in scope:** the ruler rescale to the inspiration's 60px / 20–10px ticks and the travelling-rule marker (113); the fixed name layer (114); the letter-travel animation (115); the bar's own metrics, blur, counter, name, meta (106/111, unchanged); the dictionaries beyond the `rail` block.

**Status:** in-review.

**Visual check (2026-10-17; `/tmp/opencode/v112-*.png`, 18 configs):** the centred column verified against the inspiration's own measured numbers — frame insets 80/80 @1440 (their content 113..1327), bar `1278@81` pinned flush at 47 = their measured bar verbatim; @1024 the frame is full-width with 33px gutters = their 33..991; the ruler rides the 33px gutter at 375/768/1024 with zero overlap and the thumb stays contained (FR row 27.8px inside the 31px thumb). No doubled hairlines; ticker adjacency intact. QA `/tmp/opencode/qa-112.mjs` — 373 checks, ALL GREEN (8 configs incl. FR, reduced, live EN→FR→EN switch).
