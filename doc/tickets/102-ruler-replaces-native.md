# 102: Ruler replaces native scroll

**What to build:** The right-edge ruler becomes the scroll readout and driver: 0–100 ticks with a blue progress line and a page-depth % at the thumb, reflecting position on a single animation loop, draggable to scroll, and keyboard-operable — with the native scrollbar hidden.

**Blocked by:** 100 (needs the edge-lane geometry) plus the 007 commit.

**Status:** ready-for-agent

- [ ] Ruler shows ticks 0–100, blue progress, and current-depth % (`EN 42%` / `FR 42 %`) that tracks scrolling smoothly on one animation loop; touch scrolls natively with the ruler readout-only
- [ ] Dragging (or activating) the ruler thumb scrolls the page; arrow/space keys scroll through the ruler driver
- [ ] A static bilingual `noscript` notice states scrolling needs JS (sanctioned chrome)
- [ ] Under reduced motion the ruler reflects position instantly with no smoothing or animation; all content stays readable
- [ ] Native scrollbar stays hidden; no horizontal overflow at 375px and 1440px; accepted limitation logged: scrolling requires JS
