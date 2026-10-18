# 117: Nav brand — the mark replaces the wordmark slot

**What to build:** the sticky bar's left end hosts the `brand-mark` as the home link (their
nav's own pattern, logo-only), and the nav list drops its hero link. Mono links + lang switch
unchanged on the right.

**Blocked by:** 116 (symbols exist).

**Decisions taken:**

- Markup: `<a class="nav__brand" href="#hero" data-i18n-attr="aria-label=nav.hero">` with
  `<svg aria-hidden="true"><use href="#brand-mark"/></svg>` inside. The link keeps the
  boxed-hover familiar treatment? No — *no* background box on the mark (theirs is a bare
  wordmark/link); hover = a soft ink opacity step only. 19-stop keyboard check unchanged.
- The nav `__list` loses the `#hero` item (`nav.hero` the KEY stays: the names layer row, the
  section index and the brand aria all still bind it).
- Sizing: mark heights as tokens — `--nav-brand-size: 1.375rem` (22px glyph height @1440) plus
  the wide aspect (923:687 ⇒ width `calc(var(--nav-brand-size) * 1.344)`); ≤768 the same token
  step down (their logo never unmounts narrow).
- `nav.css`: `.nav__brand { display inline-flex; align-items center; }` + focus-visible ring
  riding the existing focus token; no text.
- The FR dict needs no change (no new keys).

**Scope:**

- [ ] nav.html + index.html nav markup per above; nav.css additions under its 107 comment trail.
- [ ] tokens.css: `--nav-brand-size` (and its narrow literal-free narrow-query step via the
      existing narrow mode block).
- [ ] Keyboard: the bar's focus order = brand → PROJECTS…, lang switch; focus ring visible on
      the mark; zero overflow/errors at 1440/375 EN + FR.
- [ ] Baseline harness green (`qa-baseline.mjs`); screenshots rest + hover + focus.
- [ ] Token gate clean; code review; status row.

**Not in scope:** dictionary value changes (`nav.hero` → Home happens in 119 with the about
promotion); name layer (114 machinery); footer.

**Status:** todo.
