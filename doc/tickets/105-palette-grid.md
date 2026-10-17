# 105: Palette + grid (colors & borders pass)

**What to build:** The colors-and-borders pass from `doc/inspo-vs-product-colors-borders.md` §1/§3: warm-neutral palette (measured values, re-tokenized as our own), monochrome accent (mint retired; ruler/focus blue kept), hairline translucent borders, wider centered column, full-bleed section dividers + nav/ticker bars, reduced section padding, sharp reserved slots with the dot grid removed. Zero copy, zero dependencies, no typography scale, nav restyle, sticky eyebrow, or lane-geometry changes (those are follow-up tickets per the doc).

**Blocked by:** none (104 is `done`).

**Status:** ready-for-agent

- [ ] Palette tokens retuned to warm neutral (bg ~#121316, ink ~#f2f1ee, 60% muted, 55% subtle, 15% hairline); mint accent retired to monochrome; all raw values only in `tokens.css`; token gate prints nothing
- [ ] Contrast walk passes AA on the new palette (text, muted, subtle, labels, switch)
- [ ] Container widened to 1280px; section padding capped at 5rem (1440px)
- [ ] Section dividers, nav bottom rule and ticker band rules span the full viewport width (token-driven, no overflow) at 375/768/1440
- [ ] Reserved slots render sharp (no radius, no dot grid); project/contact link hovers give feedback without color (underline)
- [ ] EN/FR + reduced-motion + keyboard passes still green; no horizontal overflow; zero console errors
