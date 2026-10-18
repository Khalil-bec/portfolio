# 120: Intro animation — mark → split letters → name reveal

**What to build:** the four-beat load intro from the approved board (`kb-mark-plan.html` beat
row): the KB mark at centre with a glow → the mark fades while the stylized K and the
standalone B scale in apart → the letters exit as the real hero name reveals → the rest of the
first viewport blooms, overlay unmounts. Replays each load; never runs under reduced motion
or without JS.

**Blocked by:** 119 (the hero's settled layout is final — the reveal lands on it).

**Decisions taken:**

- Module `src/intro/intro.{js,css}`; overlay markup injected by JS at boot (index.html stays
  bare: no-JS = no overlay = settled page at once). `--z-intro: 300` (over nav 180); overlay
  `pointer-events: none`, `position: fixed inset-0`; unmounted after the last beat
  (element removed — no dead listeners).
- Beats + tokens (durations/offsets in tokens.css as `--intro-*`):
  1. `0 → .4s` `use#brand-mark` fades/scales in (`.08 → 1`, ease-out) + a soft ink glow
     (`filter: drop-shadow(...)` tokenised blur/alpha).
  2. `.4 → .9s` mark opacity → 0 (slight scale-up 1.04); `use#brand-k` (left) +
     `use#brand-b` (right) fade/scale in at equal heights (~42vh glyph height at 1440 →
     tokens), K/B ink equal.
  3. `.9 → 1.35s` K/B scale toward their sides + fade out; the hero name's `is-hidden`
     class lifts (`visibility` + opacity, no layout change — the name already occupies its
     settled box).
  4. `1.35 → 1.7s` tagline/CTA/meta/cue + ticker + chips reveal the same way (`is-hidden`
     lifting class choreography from intro.js, applied through the hero's own attributes),
     overlay fades and is removed.
- The reveal classes: hero children start `is-intro-hidden` ONLY when intro.js decides to run
  (JS adds the class at boot, before first paint via the module's early execution —
  `<body>`-flash guarded by the injected overlay covering everything at 0ms); no-JS /
  reduced-motion pages never get the class (no flash possible).
- All timing via CSS transitions on the classes (no rAF choreography needed — the beats are
  simple opacity/scale/blur), Web Animations-free.
- FR/reduced/375: no overlay in reduced; 375 — the overlay's mark scales down via the tokens'
  narrow steps (the letters may exceed — their glyph-height token has a narrow value).

**Scope:**

- [ ] intro.js + intro.css + tokens block; main.js registers the module (boot order note).
- [ ] Hidden-class choreography on hero children (name/tagline/meta/cue/CTA/ticker/backdrop).
- [ ] Timings as tokens; reduced-motion + no-JS paths proven (classes absent, no overlay).
- [ ] Baseline harness + intro checks (beats exist, overlay unmount, class choreography,
      reduced path) green; screenshots of beats 1/2/3 via burst frames at 1440 + 375.
- [ ] Token gate clean; code review; status row.

**Not in scope:** footer (121); any scroll-plane change (no lock).

**Status:** todo.
