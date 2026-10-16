# 103: Side rail

**What to build:** A persistent right-side stack of section names that always shows where the reader is, highlights the current section while scrolling, jumps back to any section on click with sensible focus, and follows the EN/FR switch.

**Blocked by:** 100 (needs the edge-lane geometry) plus the 007 commit; parallel with 102.

**Status:** ready-for-agent

- [ ] Rail persistently lists all five section names and highlights the current one while scrolling
- [ ] Clicking (or activating) a rail name jumps to that section and moves focus sensibly
- [ ] Rail labels flip with the EN/FR switch and reuse existing section headings (zero new marketing copy)
- [ ] Rail shares the 375px right edge with the ruler without overlap; reachable keyboard-only with visible focus
