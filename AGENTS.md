# Portfolio
Static vanilla site. Spec: doc/idea-v1-spec.md. Content: doc/content.md.

## Rules
- No frameworks, no bundler. Libraries only from /vendor.
- All copy comes from i18n dictionaries (src/i18n/en.json, fr.json). Never hardcode text.
- Design tokens only as CSS variables in src/styles/tokens.css.
- One section = src/sections/<name>/ (html partial, css, js).
- Do not copy code from the reference site; reimplement the behavior.
- Respect prefers-reduced-motion. Test 375px and 1440px.
- Ask before adding any dependency. Never commit without my approval.
- Read doc/idea-v1-decisions.md first; append decisions there.

## Workflow
Plan → ticket → implement one ticket → screenshot check → code review → stop.