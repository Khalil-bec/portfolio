# 005: Content fit-in — hero + education + contact

**What to build:** The human entry and exit of the page: who Mohamed Khalil is, where he studies, and how to reach him — plus the brand assets and reserved image slots that prevent layout shift later.

**Blocked by:** 001, 003, 004 (needs skeleton + motion shell + dictionaries; parallel with 006).

**Status:** ready-for-agent

- [ ] Hero shows name, tagline, about paragraphs, human languages; education shows UPPA Pau L3 + expected graduation Summer 2027; contact is last with GitHub, LinkedIn, location, email — all FR/EN faithful to `doc/content.md`
- [ ] GitHub/LinkedIn open new tab with `rel="noopener"`; email is same-tab `mailto`
- [ ] Favicon + OG present as code-drawn monogram (dark square, KB); no photo needed
- [ ] Reserved sized empty slots for portrait/later images hold their size (no CLS when assets land)
- [ ] No alternance banner, no contact form, no CV download, no new copy beyond dictionaries
