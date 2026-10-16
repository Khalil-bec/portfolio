# 101: Ticker under hero

**What to build:** The moving bar lives as an in-flow band directly under the hero and scrolls away with the page (no longer pinned), showing the active-language tagline and staying out of the way while empty.

**Blocked by:** 007 commit (parallel with 100 after the baseline lands).

**Status:** ready-for-agent

- [ ] Ticker renders in-flow directly under the hero and scrolls away instead of staying fixed
- [ ] Ticker shows the tagline in the active language and flips on EN/FR switch; empty tagline renders no bar
- [ ] Under reduced motion the ticker is a static readable line with no animation
- [ ] No horizontal overflow at 375px and 1440px in either language; zero new copy
