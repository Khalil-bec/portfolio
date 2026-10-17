# 106: Typography scale + sticky eyebrow bar

**What to build:** The typography pass and the "title persists under nav" mechanism from `doc/inspo-vs-product-colors-borders.md` §2 + §5: section headlines get the display treatment (larger clamp scale, tighter leading/tracking), micro-labels become true mono, and the `NN ---` header line is rebuilt as a sticky translucent brow pinned flush under the nav with the section name in it (`02 / Projects`), reusing existing dictionary keys with zero new copy. The right-side meta line stays out (no copy exists; §5b pending user call).

**Blocked by:** 105 (uncommitted working tree builds directly on its palette/tokens).

**Status:** ready-for-agent

- [ ] Section titles render on the display scale (~34px mobile → ~58-60px desktop, ~1.05 leading, ~-0.03em tracking); all values tokenized; token gate clean
- [ ] Micro-labels (project Stack/Why, contact rows, hero about header) use the mono stack
- [ ] Eyebrow bar per section: sticky under the nav (top retargeted by live measurement — nav can reflow), translucent blurred band, hairline bottom border, `NN / NAME` drawn from the existing counter + dictionary keys; number/name kept aria-hidden (the section h2 stays the semantic heading)
- [ ] `02 ---` full-width rule retired — the bar's own bottom border continues the numbered-header look; single hairlines everywhere (no doubling at hero/ticker)
- [ ] Pin verified at 1440/768/375 in EN and FR (nav reflow on switch re-measures), reduced motion safe (no animation, blur okay), keyboard walk unchanged (bar not focusable), no overflow, zero errors
- [ ] Serif-italic display accent NOT shipped — needs a user-provided word per headline (single-word titles); logged as pending input
