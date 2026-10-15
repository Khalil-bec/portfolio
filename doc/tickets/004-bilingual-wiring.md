# 004: Bilingual wiring

**What to build:** A visible EN/FR switch that flips every string on the page, remembers the choice, and respects the visitor's browser language on first visit.

**Blocked by:** 001 (needs the skeleton; parallel with 002/003).

**Status:** ready-for-agent

- [ ] `en.json` + `fr.json` generated from `doc/content.md` faithfully, without rewording; keyed per string
- [ ] HTML carries keys only (`data-i18n`); no hardcoded visible copy
- [ ] Switch is visible, flips every string including ticker tagline, updates `<html lang>` on switch
- [ ] Choice persists in localStorage across reload; first-visit default comes from `navigator.language`
- [ ] Ticker reuses the existing tagline per language (zero new copy)
