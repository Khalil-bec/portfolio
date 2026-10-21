# Inspiration vs product — colors & borders (detail pass)

Scope: visual/behavioral comparison only. No reference code copied; behaviors below are
re-described in our own words for reimplementation. User call: colors + borders first;
ruler orientation, rail dynamics, and sticky titles are out of scope for this pass.

Method (2026-10-16): headless Playwright (bundled chromium-1248,
`NODE_PATH=/tmp/opencode/artcraft/node_modules`), viewport 1440x900, inspiration in
dark mode via its theme toggle, ours from `python3 -m http.server 8124`. Screenshots:
`/tmp/opencode/cmp-*-*.png`, `inspo-own2-dark.png`, `inspo-ownership-dark.png`.
Measured computed styles quoted below; our token values from `src/styles/tokens.css`.

## 1. Palette

- Theirs (dark, measured): body bg `rgb(18,19,22)` (~`#121316`, warm near-black);
  ink `rgb(242,241,238)` (warm off-white); muted = 60% ink; hairline = 15% ink;
  headline pure white `rgb(255,255,255)`; outlined button bg = page bg, 1px border
  40% ink, square corners, 11px mono uppercase. Light mode mirrors it:
  bg `rgb(242,241,238)`, ink `rgb(16,16,20)`.
- Ours (measured): body bg `rgb(10,12,16)` (`--color-bg: #0a0c10`, cooler/darker);
  text `rgb(231,234,240)` (`--color-text: #e7eaf0`, cooler); muted `#a2acbb`;
  subtle `#767f8f`; borders opaque `#262d38` / `#37404e`; accents mint
  `#6ee7b7` + blue `#7dd3fc` (dots, pills, mailto, progress, rail current).
- Difference: warm neutral vs cool blue-gray; translucent hairlines vs opaque
  borders; monochrome (white button) vs two saturated accents competing at once.
- Changes to make: retune surface/text/border tokens toward warm neutrals
  (bg ~`#121316`, ink ~`#F2F1EE`, muted 60%, hairline 15%, headline pure white);
  reserve one quiet accent or none (button = outlined monochrome); keep every raw
  value in `tokens.css` and re-run the token gate + an AA contrast walk
  (subtle text currently 4.85:1 — re-verify after warming).

## 2. Typography

- Theirs: display sans ~60px/61px, weight ~620, tracking about -2px, leading
  ~1.02; one accent word in serif italic at normal weight; body ~18px relaxed;
  micro-labels mono uppercase ~11px, letter-spacing wide, muted/faint.
  Families: grotesk display + serif italic + inter-like body + mono labels.
- Ours: system sans only, no serif; hero name 88px/700 but body titles only
  32px/600 (`.section__title`); micro index mono 0.78rem; body 16px/1.6.
  No italic display accent exists in the design language.
- Difference: theirs gets its editorial feel from size contrast (60px vs 11px)
  plus the single serif-italic word; ours has one scale jump (hero) then
  everything small and uniform, so sections read dense.
- Changes to make: add a display treatment for section headlines (larger,
  tighter tracking, ~1.02–1.1 leading) and a serif-italic accent mechanism
  driven by dictionaries (no hardcoded words); promote micro-labels to true
  mono uppercase with wide tracking on both sides of the eyebrow bar. System
  stack stays (no webfonts — perf budget); serif comes from the system serif
  stack via a token, not a download. Needs explicit user sanction as new chrome
  if any label text is added (reuse existing keys where possible).

## 3. Grid & borders

- Theirs: centered column max ~1280px with hairline side rules; each section
  opens with a full-bleed 1px top rule; the 3-cell row is equal columns separated
  by 1px gaps that show the hairline color through (no double borders); all
  corners sharp (button radius 0).
- Ours: centered column max 1152px (`--container-max: 72rem`) with 1px side
  borders + bottom border per section; measured section padding 144px top/bottom
  at 1440px; dividers are per-section borders (correct) but the right
  lane reservation (rail 120px + ruler 28px = 148px body padding) narrows the
  column and breaks the full-bleed rule alignment; slots/chips use 16px radius
  and pills.
- Difference: same idea, different discipline — theirs is full-width rules with
  sharp cells; ours has heavier padding, rounded placeholders, and lane padding
  that visually detaches content from the grid.
- Changes to make: widen container toward ~1280px (token); make section
  top/bottom rules full-bleed and hairline-translucent; convert cell dividers to
  single 1px shared dividers (no doubled lines); set placeholder/media slots and
  buttons to sharp corners in this style pass (radius tokens stay for chips only
  if kept); re-verify lane adjacency so rules meet the rails cleanly at 375/768/1440.

## 4. Nav (context for the border line)

- Theirs (measured): bar height ~49px; mono uppercase links; active link boxed
  (dark fill, light text); hairline bottom rule; trailing black CTA block.
- Ours (measured): bar height ~63px; sentence-case sans links; pill EN/FR switch
  with mint fill; bottom border opaque `#262d38`.
- Difference: 14px taller, rounder, cooler; the top table edge reads heavier.
- Changes to make: tighten nav height/padding toward ~48–52px; switch nav links
  to mono uppercase micro-labels (dictionary values stay, only styling changes);
  restyle the language switch as a quiet outlined control (no saturated fill);
  thin the bottom rule to the hairline token. No copy or key changes.

## 5. Section eyebrow header (sticky title)

- Theirs: a bar pinned just under the nav while its section is active, with blur
  over content; left `02 / Ownership`, right `Free & open source` (hidden on
  small screens); hairline top+bottom borders.
- Ours: `.section__index` (`01 ---` rule) scrolls away; no sticky behavior, no
  right-side meta, no blur.
- Difference: this is the "title persists under nav" mechanism the user named;
  ours cannot do it today.
- Changes to make (border pass includes the bar shell only): introduce a sticky
  eyebrow element per section reusing the existing counter + section title keys
  plus the per-section meta line already in copy where one exists; translucent
  bg + blur; `top` = nav height token; hidden right meta under ~640px via an
  intrinsic rule where possible (a breakpoint literal needs the same sanction
  as the 768px lane rule). Motion (settle transition) stays in the later
  rail/ruler pass, not here.

## 5b. Right meta text (copy constraint)

- Theirs shows a short right-side qualifier per section (`Free & open source`).
- Ours has no such strings in `doc/content.md`, and repo rules forbid new copy
  beyond dictionaries. Do NOT invent meta lines. For this pass the eyebrow
  right side stays empty (or reuses an existing dictionary string only with
  explicit approval); the bar shell + sticky behavior still ship.

## 6. Headline + subcopy block

- Theirs: generous but bounded block padding, headline measure ~3xl, subcopy
  measure ~xl at 18px muted, one idea, short lines.
- Ours: hero name + tagline are fine at top; section bodies immediately follow
  with long stack lines and 4–6 two-line bullets per project, so the "headline
  moment" never lands in Projects/Skills.
- Difference: not a color issue — density. Colors/borders alone cannot make a
  6-bullet card read like a 2-line cell.
- Changes to make in THIS pass: none to copy (all bullets stay visible per
  spec). Only give headlines room: larger title, muted summary capped at a
  measure, dividers that isolate the header from the list. Restructuring or
  trimming copy is a separate content ticket with user approval.

## 7. Reserved slots vs finished media

- Theirs: media fills sharp rectangles edge to edge; no placeholder language.
- Ours (measured): slot bg `rgb(18,22,29)`, 1px opaque border, 16px radius,
  faint dot grid. Reads as unfinished, especially the 320x200 project boxes
  next to dense text.
- Difference: the dot grid + round corners signal "missing" instead of
  "reserved".
- Changes to make: restyle empty slots as sharp hairline frames with no dot
  grid (or an extremely faint flat fill), same aspect ratios (anti-CLS boxes
  unchanged); keep `aria-hidden`; keep sizes. Screenshots/photo land later.

## 8. Verification plan for the change ticket

- Token gate clean (no literals outside `tokens.css`); vendor SHAs unchanged.
- Playwright 375/768/1440 x EN/FR: zero overflow, zero console errors,
  eyebrow sticks at `nav height`, rules align edge to edge, slots hold size.
- Contrast walk: headline/body/muted/subtle/labels all AA on the new bg.
- Screenshots at 375 + 1440 (light: n/a — we are dark-only; inspiration dark
  used as reference), plus reduced-motion pass (blur/transitions off, content
  readable). Lighthouse optional; perf budget unchanged (no fonts, no deps).
- Code review via `code-review` skill, then stop for approval; never commit
  without explicit approval.
