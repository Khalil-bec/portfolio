# Portfolio
Static vanilla site, no framework or bundler. Libraries only from /vendor.

## Read at session start (only these)
1. doc/status.md
2. The ticket named in my prompt (doc/tickets/<NNN>-*.md)
Read doc/idea-v3-decisions.md, doc/idea-v3-spec.md or doc/content.md only if the ticket links to them.

## Never read or search
vendor/, doc/archive/, .screenshots/, *.min.*

## Where things are
src/sections/<name>/ one folder per section · src/styles/tokens.css tokens ·
src/i18n/{en,fr}.json all copy · src/motion/ scroll + GSAP · src/ruler, src/names, src/intro


## Rules
- No frameworks, no bundler. Libraries only from /vendor.
- All copy comes from i18n dictionaries (src/i18n/en.json, fr.json). Never hardcode text.
  Exception: two language-invariant pre-boot fallbacks — the hero `<h1>`
  (`Mohamed Khalil BECHEIKH`, ticket 126 — LCP) and the document `<title>`;
  `data-i18n="hero.name"` / `data-i18n="meta.title"` still own the keys and
  rebind them.
- Design tokens only as CSS variables in src/styles/tokens.css.
- One section = src/sections/<name>/ (html partial, css, js).
- Do not copy code from the reference site; reimplement the behavior.
- Respect prefers-reduced-motion. Test 375px and 1440px.
- Ask before adding any dependency. Never commit without my approval.
- Read doc/idea-v3-decisions.md first; append decisions there.

## Workflow
Plan → ticket → implement one ticket → screenshot check → code review → stop.
Update `doc/status.md` every time a ticket's implementation is done (and on any status change).
Verify with `npm ci && npm run verify` (dev-only Playwright + Lighthouse; nothing ships).

## When a ticket is done
Edit only that ticket's row in doc/status.md (status + commit SHA). The table
is the ledger; the narrative history lives in the log below.
Append one line to doc/status-log.md with `>>`; do not read that file. The log
is write-only — no length cap, nobody reads it back, and that is the point:
it keeps the long record out of every session's context.
Never commit without my approval.