# 100: Table divisions + edge lanes

**What to build:** The ArtCraft table feel across the whole page: every section renders as a 1px table-like cell with a small numbered header continuing the existing 01–05 counter, and the right edge reserves two non-overlapping lanes (one for the future ruler, one for the future rail) at desktop and mobile widths.

**Blocked by:** 007 commit (needs the hardening baseline committed first).

**Status:** ready-for-agent

- [ ] All five sections show 1px cell borders with numbered headers in the existing counter sequence
- [ ] Right-edge ruler lane and rail lane coexist without overlap at 1440px and 375px, in EN and FR; under 768px the rail lane collapses to icon mode (narrow media-query exception, lane widths only)
- [ ] No horizontal overflow at 375px and 1440px in either language; all content readable under reduced motion
- [ ] All values used for borders, spacing, and lanes live in design tokens; zero new copy
