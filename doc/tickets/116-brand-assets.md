# 116: Brand assets — the KB mark, favicon, OG

**What to build:** the traced KB monogram (the user's PNG, geometry untouched, ink fill) becomes
the site's brand across the tab bar and the (future) nav/footer/intro: three inline `<defs>`
symbols, `favicon.svg` as the badge, `favicon.ico` re-rendered, OG image refreshed.

**Blocked by:** nothing (spec: `doc/idea-v3-spec.md` §1; decisions: `doc/idea-v3-decisions.md`).

**Decisions taken:**

- Path data (traced 2026-10-18, potracer, `~mask` — see decisions for the build command):
  - `brand-mark` `viewBox="0 0 923 687"`, one path, `fill-rule="evenodd"` (the two bowl
    counters are holes), 2.3 KB.
  - `brand-k` `viewBox="0 0 730 818"` (the full stylized K from its own PNG).
  - `brand-b` `viewBox="0 0 105 162"` (the standalone B from its own PNG).
- The symbols land in index.html now (single source of truth) but only the favicon/OG consume
  them this ticket; nav (117), hero chips are separate.
- Favicon badge: `#121316` rounded square (the site's bg, visible on light tab bars), mark in
  ink `#f2f1ee`, glyph 56px wide on the 64 box. ICO re-rendered from the SVG via
  playwright screenshot → PIL `save(…, sizes=[(16,16),(32,32),(48,48),(64,64)])`.
- og-image: same badge language at 1200×630 with the name in display type.
- The 005 palette comment replaced (the mint accent and the "code-drawn" wording retire with
  the glyph itself).

**Scope:**

- [ ] index.html: `<defs>` block with the three symbols near `<body>` top (document order note
      updated); zero `use` consumers yet besides the favicon file.
- [ ] favicon.svg replaced; favicon.ico re-rendered (4 sizes); both verified in the browser tab
      (direct fetch + playwright load, no console errors).
- [ ] og-image.svg + og-image.png refreshed; index.html comment updated.
- [ ] Head comment rewritten to cite 116 + the decisions file for provenance.
- [ ] Verification: screenshots (favicon.svg at 4 sizes, og at 1200), zero console errors, no
      layout change (the symbols render zero-sized — `<defs>` only); token gate clean.
- [ ] Code review after QA; status.md row.

**Not in scope:** nav/footer/intro consumption (117/120/121); any dictionary change.

**Status:** done — implemented + both-axis review 2026-10-18 (findings closed, see ticket
foot); feat commit next (user's "i approve … and move on" batching). Implementation notes:
symbols `brand-mark`/`brand-k`/`brand-b` inlined
at `<body>` top (comment cross-links the decisions file); favicon.svg = badge (mark on the
`#121316` rounded square; XML comment double-dash bug caught by the render check and fixed);
favicon.ico re-rendered 16/32/48/64 from the 4× raster; og-image.svg rebalanced (mark centred,
name under) + png re-rasterised. Playwright sweep: page 200, zero console errors, symbols
mounted with paths, favicon links intact, no layout change (uses: 0 this ticket). Screenshots:
`/tmp/opencode/favicon-256.png` (badge at 256 = 4×64), `/home/khalil/portfolio/og-image.png`.

**Review (both axes, sub-agents):** spec — three findings, all closed: the stale 005 head
comment (replaced by the merged 116 note), the untracked `.superpowers/` tooling dir inside
the repo tree (now `.gitignore`d), and the head/body comment duplication (body block deleted;
head carries the single note, "feeds future consumers" wording). Standards — no hard
violations; two wording fixes closed: the og comment's tier list (bg / ink / border + bright
ink tiers) and the present-tense `<use>` claim (the svg became inert with no local comment —
the head comment points at it). XML re-validated; page re-checked (200, zero errors).
