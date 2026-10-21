# 126: Intro must not gate first paint on phones — and the mobile LCP path

**Status:** `done` (2026-10-21) — `62e10f2`. Reviewed (both axes); the review's
nav-reservation and boot-path findings are applied and recorded below.

**Why (ticket 125 baseline, 2026-10-20):**

Mobile Lighthouse was **85–86** against the v1 acceptance criterion "performance
> 90". The boot guard in `index.html` set `data-intro="run"` before first paint
at every width, and `intro.css` held the hero text at `opacity: 0` until the
bloom beat (~1.7 s). Desktop escaped the score cost only because its text painted
before the module pipeline applied the gate; on throttled mobile the gate won and
LCP landed at 3.8–3.9 s.

**Decision (user, 2026-10-20):** keep the intro where it has room, skip it on
the narrow breakpoint. This follows the project's existing mobile policy:
letter travel is already disabled ≤768 (115), and the v3 spec's intro is a
desktop-scale brand moment.

**What was built (`index.html` boot guard):**

- The guard returns early when `matchMedia("(min-width: 769px)")` is false, in
  addition to the existing reduced-motion check. No `data-intro` attribute is
  set, so `intro.js` never mounts, `.is-pending` is never added, and the settled
  hero is the first paint at ≤768.
- Above 768 nothing changes: same guard, same 3 s failsafe, same overlay,
  same reduced-motion skip.
- `intro.js` is untouched; it already refuses anything but the boot flag.

**Implementation finding — the intro was not the whole LCP story:**

Skipping the intro raised the median only to 76–81. The hero text was still bound
by JavaScript, behind the full module graph and the three deferred vendor scripts
(GSAP, ScrollTrigger, Lenis, ~140 KiB). Lighthouse's trace showed an *observed*
LCP of 135 ms but a *simulated* LCP of 3.5 s: the simulation charges the
JS-bound text for the requests and main-thread work before the bind. The fix is
therefore three-part:

1. **Critical path split (`src/main.js`, `src/i18n/i18n.js`):** `main.js`'s only
   static import is the i18n engine. After the dictionary bind and two animation
   frames, it dynamically imports the intro and the motion shell; the vendor
   scripts are inserted after the paint instead of sitting in the document.
   `modulepreload` now covers only `main.js` + `i18n.js`. `i18n.js` dynamically
   imports ticker/ruler/names/reveals only after a user language switch.
2. **Static LCP text (`index.html`, `src/sections/hero/hero.html`):** the `<h1>`
   carries the pre-boot name `Mohamed Khalil BECHEIKH`. It is language-invariant
   (identical in EN and FR), so it is safe before the dictionary loads; i18n
   still owns `hero.name` and rebinds it. This is the documented exception to
   the "never hardcode copy" rule (see `AGENTS.md` and
   `doc/idea-v3-decisions.md`). Without a text node in the initial HTML the
   simulated LCP stayed at ~3.5 s.
3. **Reserve settled space before the bind (CLS):** the in-flow ticker band
   reserved its live height from the first frame via `data-motion`, and the
   wrapped nav list reserves its measured two/three/four-row height at narrow
   widths. The boot guard also publishes an early `lang` hint so the FR nav
   height is correct on the first frame. Ticker CLS 0.19 → 0.006 in the
   diagnostic; final mobile CLS 0.056 (the remaining shift is the tagline/CTA
   bind, below the score threshold).

**Evidence (fresh, 2026-10-20):**

- `npm run verify`: **106 passed, 0 failed**.
- Mobile Lighthouse: **97 / 97 / 97**, LCP **2258 / 2257 / 2259 ms**, a11y
  **100 / 100 / 100**, CLS **0.056**, TBT **0**.
- Desktop Lighthouse: **98**, a11y **100**, LCP 529 ms.
- `intro.absent-768-en`, `intro.absent-375-en`, `intro.absent-375-fr` green;
  `intro.present-1440-en`, `intro.present-1024-en`, `intro.present-1440-fr`
  green and settle.
- `qa-124` 69/69 and `qa-121` 246/246 regressions green.
- Screenshots: 375 EN/FR show the hero immediately, no overlay frame; 1440
  intro midpoint still shows the KB mark stage.

**Scope:**

- [x] `index.html`: width condition + pre-paint `data-motion`/`lang` hints.
- [x] `doc/idea-v3-spec.md` §5: amendment note pointing at this ticket.
- [x] `src/main.js`: critical-path split; intro and motion after the bind.
- [x] `src/i18n/i18n.js`: on-demand motion refresh imports.
- [x] `src/styles/motion.css`, `src/nav/nav.css`, `src/styles/tokens.css`:
      pre-paint ticker/nav height reservation.
- [x] Static `<h1>` fallback in both the partial and `index.html`; AGENTS
      exception + decisions entry.
- [x] Verify: `intro.absent-*` green; `intro.present-*` green; mobile
      Lighthouse median > 90 and LCP < 2.5 s in three runs; desktop perf ≥ 95;
      reduced motion and no-JS unchanged.
- [x] Screenshots at 375 show the hero immediately, with no overlay frame.

**Amendment (2026-10-21, the 125–130 code review):** the review of this
ticket's diff found two things worth fixing inside its own scope.

1. **The nav reservation's breakpoints were guesses, and one of them was
   wrong.** The reservation mapped the list's row count to widths that were
   never measured: it reserved two rows for EN up to 520 px and nothing at all
   from 521 px, while EN still wraps to two rows until 529 px — so the sticky
   bar **grew by 33 px after the dictionary bound** at 521–529 px, and by the
   same amount at ≤358 px, where EN wraps to four rows and only three were
   reserved. The wrap boundaries are now **measured** (Playwright, the shipped
   fonts, both languages): EN 4 rows ≤358, 3 rows 359–375, 2 rows 376–529,
   1 row from 530; FR 4 rows ≤375, 3 rows 376–392, 2 rows 393–564, 1 row from
   565. Each edge keeps the taller reservation one pixel longer than measured,
   so a wrap that lands one pixel later is still covered. The new
   `nav.reservation-{en,fr}` check (ticket 125) measures the bar's height
   across the bind at every boundary and is validated against the old mapping.
2. **The motion path could take the page down with it.** The critical path
   splits the imports, but the ten motion modules were awaited with
   `Promise.all` — one rejected import left an unhandled rejection and none of
   the modules after it initialised. They are now awaited with
   `Promise.allSettled` and each module's init runs inside its own guard, so a
   module that fails to load or throws degrades to "that feature is absent"
   (the copy has already painted) instead of breaking the page.
