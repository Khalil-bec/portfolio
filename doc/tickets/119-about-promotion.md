# 119: About promotion — its own section, portrait retired, Home/About rows

**What to build:** the hero's below-fold about block becomes `<section id="about">` between the
ticker and `#projects` (the inspiration's structure), the reserved portrait deletes, copy moves
to `about.*` keys, and the section stops (name layer rows, section indexes, ruler grades)
grow by one: hero = Home, about = About.

**Blocked by:** 118 (hero geometry finalised first — the promotion reflows the page).

**Decisions taken:**

- New partial `src/sections/about/about.{html,css}`; index.html inlined copy synced (001 rule).
- Dict moves (no copy edits, only relocation): `hero.about[0..2]` → `about.body[0..2]`,
  `hero.languages` → `about.languages`, `hero.aboutTitle` → `about.title`. `nav.hero` value →
  EN "Home" / FR "Accueil" (the hero stop is the name hero); new `nav.about` = About / À propos.
  Every `data-i18n="hero.about…"` reference updates (grep-driven).
- `#about` children: `section__index` (num + name `nav.about`), `about__title` (reuse the 106
  display-scale title form), the three reveal paragraphs + the languages line. No portrait, no
  grid (the "just the paragraph" brief).
- Name layer: six rows in index.html (hero/projects/skills/education/contact + about in
  document order); ruler + section tops re-measured post-reflow (the tops change: hero loses
  its below-fold height); `name.js` needs no code change (rows are markup-driven; measureTops
  reads `data-name` rows).
- Section numbering: `section__num` renders from the order — verify with the existing eyebrow
  mechanism (no JS change expected).
- The `contact` flip check advances (4501 vs 4231 status noted; the footer finishes it in 121).

**Scope:**

- [ ] about partial + css + index.html inline; ticker sandwich unchanged (hero → ticker → about
      → projects) — confirm the ticker still scrolls away with the page (it sits between
      sections in source order; verify).
- [ ] Dicts EN/FR: the moves above + the two value changes; grep-clean of the old keys.
- [ ] Name layer + rows + geometry re-measured (record tops); names layer gains the about row
      with its letter-split working FR.
- [ ] Baseline harness green; screenshot sweep 375/1440 EN + FR + reduced (about stop named
      correctly in both).
- [ ] Token gate clean; code review; status row.

**Not in scope:** footer (121), intro (120); hero visuals (118 done).

**Status:** done — implemented + both-axis review 2026-10-18 (standards PASS, zero hard
violations; spec PASS on substance after the records landed). In-scope-by-necessity:
`hero.js` publishes `--hero-index-h` (the sticky index bar is in-flow; the cell must end at
one viewport; the 106 measured-parameter precedent) + the matching tokens.css 0px no-JS
fallback — decisions recorded. The portrait slot's tokens deleted (zero consumers).

**Verification:** qa-119 18/18 (6 names rows in order, about = 2nd section → counter 02,
title/3 paragraphs/languages bound EN+FR, portrait + hero-about gone, hero = one viewport
(950→900 after the index measurement), names current flips to #about at depth, zero
overflow/errors 1440+375 EN/FR) + qa-118 29/29 rerun green (hero/ticker unaffected).
Tops re-measured: hero 47 / projects 1512 / skills 3383 / education 4127 / contact 4577,
maxScroll 4133 — contact 4577 > 4133, the clamp (contact flip) lives on, closed by the
121 footer. Screenshots: v119-fold.png (01/HOME + express row), v119-about.png (02/ABOUT +
03/PROJECTS), v119-375-about.png.
