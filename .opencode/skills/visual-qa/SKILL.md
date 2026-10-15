---
name: visual-qa
description: Use after building or changing any section, before reporting it as done.
---
1. Start the dev server (python -m http.server or equivalent).
2. With the Playwright MCP, screenshot the section at 375px and 1440px, in EN and FR.
3. Check: no horizontal scroll, no overflow with the longer French text, no console errors,
   language switch updates every string, reduced-motion state renders correctly.
4. Report defects as file:line, or "approved". Do not fix unrelated things.