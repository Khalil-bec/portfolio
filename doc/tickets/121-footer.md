# 121: Footer — mark + email, two columns, © bar; contact flip lands

**What to build:** the new `#footer` section after `#contact` in the approved board's shape:
brand-mark + mono mailto email left; `NAVIGATION` / `ELSEWHERE` mono-labelled columns right;
hairline-topped © bar (`© 2026 <name>` left, `hero.role` uppercase right). The added page
height finally puts the contact flip inside `maxScroll`.

**Blocked by:** 120 (page height + geometry final; the flip verification closes the arc).

**Decisions taken:**

- Partial `src/sections/footer/footer.{html,css}` + index.html inline; NOT a centred column
  member: the inspiration's footer bleeds full width with its own 1280 content column inside;
  the ruler lane overlays its right edge as everywhere (its bottom band stops before the page's
  true end — the names-layer bottom stack region).
- Copy sources: `NAVIGATION`/`ELSEWHERE` headers = two new dict keys (`footer.navigation`,
  `footer.elsewhere`); column items reuse `nav.*` and `contact.githubLabel/linkedinLabel`
  (labels mono-uppercase by CSS); the email link + hrefs are data in the partial (the mailto +
  the gh/li URLs from doc/content.md; new-tab + `a11y.newTab` announcements where external).
- The © year is code (JS stamp or static `2026` data-node? — static year as *data*, not copy:
  the 005 favicon-comment precedent; year literal is tolerated as data with a comment).
- The footer is a section stop? The names layer's bottom stack lists `#contact` last today —
  decision: the footer is NOT a name-layer row (theirs isn't; the footer is chrome). The ruler
  scale spans the document including the footer (grades = document %) — nothing to change.
- The contact-flip bug close: measure section tops + docH + maxScroll after the page reshapes;
  assert flipping to contact at max scroll reaches `#contact` (live flip in the harness). Record
  the final numbers in this ticket + idea-v3-decisions.
- Spare credits row (the "MADE BY …" right side = `footer.role` = `hero.role` reuse).

**Scope:**

- [ ] footer partial + css + index.html inline; stylesheets order updated (about.css neighbor).
- [ ] Dicts: `footer.navigation`, `footer.elsewhere` (EN/FR); hero.role consumed again.
- [ ] Geometry: post-build measure of tops/docH/maxScroll; live contact-flip check at 1440 +
      375 (the flip must land ≤ maxScroll, the sticky bar + names layer behaving at the end).
- [ ] Keyboard/copy audits: the new links keyboard-reachable, aria labels right EN/FR.
- [ ] Baseline harness + footer checks green; screenshots 375/1440 EN/FR + reduced;
      token gate clean; code review; status row.

**Not in scope:** ruler/name-layer machinery changes; dictionary relocations (119 done).

**Status:** todo.
