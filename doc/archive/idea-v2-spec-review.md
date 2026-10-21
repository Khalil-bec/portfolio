# Idea v2 — spec review (backend-architect + security-engineer + product-manager)

Three parallel read-only reviews of `doc/idea-v2-spec.md` + tickets `100–104` against `doc/idea-v1-spec.md`, `doc/content.md`, `AGENTS.md`, and `doc/idea-v1-decisions.md`. Each agent asked clarifying questions first (recorded, then answered by stated assumption), then gave concerns + recommendations. No spec or ticket files changed in this pass — fold back only what you approve.

## Backend-architect

### Clarifying questions

1. Where do ruler/rail code live, given one module per `src/sections/<name>/` but these are global chrome, not sections?
2. What is the exact scroll-driver seam — single `scroll-driver` module owning Lenis, with ruler/rail as callers, or direct Lenis calls?
3. What are the lane widths/tokens for ruler vs rail at 1440px and 375px, and who owns them?
4. Does hiding native scroll mean `scrollbar-width: none` (still scrollable) vs `overflow: hidden` (breaks Lenis)?
5. What ARIA pattern does the ruler thumb use, and do its labels need new i18n keys?
6. What does "moves focus sensibly" mean concretely for rail jumps?
7. Who owns active-section state for rail highlight, and at what threshold?
8. Should 102 be split into readout + drag/keyboard driver?

### Assumptions

New `src/chrome/` home (decision appended); one `scroll-driver` seam owning Lenis + ticker loop; lane geometry as named tokens from 100; `scrollbar-width: none` hiding, never `overflow: hidden`; thumb is `role="slider"` with i18n aria labels; rail/nav jumps move DOM focus to the target; highlight derives from the driver's ScrollTrigger positions (no second listener); 102 stays whole unless the implementer reports overflow.

### Concerns + recommendations

- **Lane-geometry ownership is a name, not a contract (100).** "Reserves two lanes" with no tokens, DOM structure, or JS API will not unblock parallel 102/103 — both will invent conflicting widths/z-index. Recommend: 100 delivers `--lane-ruler`/`--lane-rail` tokens, the edge DOM skeleton, and a consume-without-redefining contract for 102/103.
- **Ruler driver risks a second loop + feedback cycle (spec §3; 102).** Read (scroll→thumb) and write (drag→scroll) through Lenis smoothing can fight each other and the reveals. Recommend: 102 renders only from `driver.onScroll` inside the existing ticker callback, drag calls `driver.scrollTo` (no private rAF, no direct `window.scrollTo`), plus `ScrollTrigger.refresh()` after ticker relocation/language flip.
- **Keyboard-via-driver under-specified (102; spec acceptance).** If native scroll is hidden, arrows/space die unless the thumb is a focusable slider. Recommend: `role="slider"`, `tabindex="0"`, arrow/PageUp/PageDown/Home/End handlers, `aria-valuenow` = depth %; 104 tabs to the thumb.
- **Rail highlight has no seam (103).** Independent observers double-subscribe scroll state and drift. Recommend: rail subscribes to the driver's single active-section publisher (same source as ScrollTrigger), threshold defined (e.g. section top crosses 50% viewport).
- **375px edge cannot fit two lanes unspecified (100; 103).** Recommend: 100 states the 375px composition as tokens (narrowed/stacked lanes, min touch targets); 104 keeps the no-overlap screenshot gate.
- **102 is two tickets disguised as one.** Recommend split into 102a readout + 102b drag/keyboard (conflicts with the user's one-ticket call — needs explicit re-confirmation).
- **AGENTS.md friction:** ruler/rail placement + new aria-label i18n keys need explicit carve-outs appended to decisions before 100 starts.

## Security-engineer

### Clarifying questions

1. What ARIA role must the ruler thumb use (`slider` with value attributes vs plain button)?
2. Which keys must the ruler support, and with what step sizes?
3. Where must focus land after a rail jump (section container `tabindex="-1"` per 002 pattern, or first heading/link)?
4. Must drag use Pointer Events with `setPointerCapture` + `pointercancel`, and what `touch-action`?
5. Is a `<noscript>`/no-JS scroll-blocked disclosure required, and how is it reconciled with no-hardcoded-copy?
6. Does hidden native scroll mean `scrollbar-width: none` rather than `overflow: hidden`?
7. Must rail/ruler introduce any new persisted state, or stay stateless?

### Assumptions

`role="slider"` 0–100 required; arrows + Home/End + PageUp/PageDown (Space stays page-scroll); focus lands on section container (`tabindex="-1"`, `preventScroll`) after the jump; Pointer Events + capture + `touch-action: none` on thumb only; explicit user-visible no-JS notice required; `scrollbar-width: none` hiding; zero new storage keys.

### Concerns + recommendations

- **Ruler keyboard contract vague (102).** Recommend: focusable thumb, `role="slider"`, `aria-valuemin=0/max=100/now`, ArrowUp/Down (±5), PageUp/Down (±20), Home/End, visible `:focus-visible`, no trap.
- **Rail focus vs unrevealed rows (103).** "Moves sensibly" risks focusing an `opacity:0` row or double-scrolling via `focus()` default scroll fighting Lenis. Recommend: reveal-first, then Lenis `scrollTo`, then `target.focus({preventScroll:true})` on `tabindex="-1"`; 104 Tab-verifies each jump.
- **Drag robustness (102).** Recommend: `setPointerCapture`, `pointerup`/`pointercancel` release, `touch-action:none` on thumb only, single-rAF-throttled `scrollTo`.
- **No-JS disclosure inadequate (spec Non-goals + 102).** "Scrolling requires JS" is logged but invisible to affected users — an availability regression over v1 (v1 no-JS at least scrolled). Recommend: sanctioned `noscript` chrome key (like `a11y.newTab`); 104 view-source checks it. (Conflicts with no-hardcoded-copy — needs explicit sanction.)
- **Reduced-motion (spec Acceptance + 102).** "Instant" must cover thumb CSS too. Recommend: thumb/progress transitions disabled under `prefers-reduced-motion`; jumps bypass Lenis.
- **V1 posture confirmed safe, pin explicitly.** No new copy/deps/network is correctly safe; stateless rail/ruler preserves the single-key storage contract. Recommend 102/103 explicitly forbid `innerHTML` (use `textContent`/existing binder), restate outbound-link contract unchanged, re-run vendor + zero-external-request gates in 104.

## Product-manager

### Clarifying questions

1. At 375px, if ruler + rail cannot both fit 44px tap targets, which wins?
2. What defines "current section" — top crossing viewport center, or largest visible share?
3. Is `%` integer 0–100, and does FR localize spacing (`42 %` vs `42%`)?
4. Does ruler drag work on touch, or is touch native-swipe with readout-only ruler?
5. Is nav+rail duplication intentional, or should rail hide where nav is visible?
6. What is the hero above-fold budget now that the ticker pushes content down?
7. What keyboard role does the ruler thumb expose?
8. With JS disabled, is content still required readable/SEO-indexable?

### Assumptions

Rail wins at 375px; ruler collapses to readout-only progress line. "Current" = top crossed viewport middle. Integer `%`, FR non-breaking space (`42 %`). Touch scrolls natively; drag is pointer-mouse only. Duplication intentional (nav owns language, rail owns position). Hero + ticker still fit first viewport at 1440px, ticker one line max. Thumb is `role=slider`. No-JS readability waived.

### Concerns + recommendations

- **Nav+rail duplication (spec §Scope-4/5; 103).** Two persistent anchor systems risk confusing keyboard/SR users and cluttering the first-seconds feel. Recommend: spec nav owns anchors+language, rail owns position feedback; 103 adds rail `aria-current` + labels reusing nav keys; 104 verifies one tab stop per section per system.
- **Ticker relocation (101).** In-flow band pushes projects focus below fold, weakening hero pass-through. Recommend: 101 caps ticker to single-line height token; 104 screenshots hero+ticker above fold at 1440px.
- **"Reflects and drives" unmeasurable (102 + Acceptance).** Recommend: readout = `Math.round(scrollY/max)`; thumb within 2px of native ratio; single rAF loop; drag latency <100ms.
- **`%` localization (spec §Scope-4).** Recommend: declare `EN 42% / FR 42 %` (nbsp) in spec §Data; 104 checks both languages.
- **375px collision (100; 102; 103).** Recommend: 100 defines lane widths in tokens (e.g. ruler 24px + rail min-44px targets); 103 requires collapsed/icon rail mode under 768px. (Note: 768px breakpoint vs the token-gate/no-media-query precedent needs a decision.)
- **Granularity (102 too big, 100 too thin).** Recommend: split 102 readout vs drive/keyboard; 100 delivers visible borders + reserved empty lanes with screenshots.
- **Journey break.** Recommend: 104 adds driver-failure test (Lenis blocked → arrows/space still scroll); no-JS inert stays explicitly logged.

## Fold-back checklist (needs your call per item)

1. 100 gains lane tokens + edge DOM skeleton + consume-contract; 375px composition as tokens.
2. 102 gains slider semantics (role, keys, `aria-valuenow`, focus-visible), single-loop render rule, `scrollbar-width: none` (never `overflow: hidden`), reduced-motion thumb freeze, readout tolerance (`Math.round`, 2px, <100ms drag).
3. 103 gains reveal→scrollTo→`focus({preventScroll:true})` sequence, single-publisher highlight with threshold, `aria-current`, per-system tab-stop check in 104.
4. Sanctioned chrome decisions: ruler/rail aria-label i18n keys, `noscript` no-JS notice, `EN 42% / FR 42 %` format — each needs explicit approval to bend no-new-copy/no-hardcoded-copy.
5. Open conflicts with your earlier calls: 102 split (backend + PM recommend, you chose whole); 768px rail-collapse breakpoint (token-gate tension); touch-drag vs readout-only (agents split: pointer-only vs readout-only assumptions).
6. 104 gains: thumb tab stop, per-jump Tab verification, noscript view-source check, hero+ticker above-fold screenshot, driver-failure arrows/space test, vendor + zero-external gates.
