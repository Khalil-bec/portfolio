# Idea v0 — decisions

Locked with the user on 2026-10-15. Source: `doc/idea-v0.md`, `doc/content.md`, and clarification conversation.

## Locked decisions

1. **Purpose:** personal portfolio for a CS student targeting DevOps / Cloud / SRE, built early so expert conversations go easier ahead of a 27/28 alternance search.
2. **V1 has no alternance mention.** Alternance intent (dates, rhythm, school) is deferred until applying starts. Hero stays focused on who you are and the craft.
3. **First impression order:** polish and well-done-ness of the site itself first, then achievements and skills as substance. The site build is part of the proof of professionalism and CS capacity.
4. **Feel:** reimplement the whole rhythm of the reference linked in idea-v0 (dark theme, marquee ticker, numbered sections, scroll-revealed rows) from scratch with our own code. No code copied from the reference.
5. **Section order:** hero → projects → skills → education → contact. Contact is last.
6. **Content is settled:** `doc/content.md` is approved as-is. V1 must carry every resource in it: GitHub profile, LinkedIn, email, location (Pau), all three projects (Homelab, GymTrack, Kshell) with stacks and detail bullets, four skill tiers, UPPA L3 education with summer 2027 graduation, and languages (Arabic, French, English).
7. **Contact behavior:** email plus per-project repo links for digging deeper. Links only, no form. Full set carried: GitHub profile, LinkedIn, email, location.
8. **Builder-check resolutions (2026-10-15, corrected by v1 brainstorming check):** projects show all bullets with reveals (no expand); ticker reuses the existing tagline in each language (zero new copy, user chose tagline reuse); v1 is text-first with reserved image slots plus favicon/OG now, screenshots/portrait arrive later. My calls: hero = name/tagline/about/languages from content.md with no invented CTA copy (nav reuses section titles as anchors); languages live in hero/about per content.md, not Skills; external links new-tab with rel=noopener, mailto same-tab; build plan stops at local static files, host stays TBD.
9. **Anti-goal:** never throw everything in the face at once. Calm pacing, progressive reveals, numbered sections.
10. **Responsive:** both phone and desktop get full polish, no priority side. Replaces the earlier "mobile-first" vs "pc first" debate. Still verify at 375px and 1440px per repo rules.
11. **Stack (from v0, unchanged):** vanilla HTML/CSS/JS (ES modules), no build step. Lenis 1.3.x (lerp ~0.12, anchors on) for smooth scroll + GSAP 3.15 / ScrollTrigger for reveals. Libraries vendored locally; libraries only from `/vendor`; ask before adding any dependency.
12. **i18n:** English + French with visible EN/FR switch. Choice persists (localStorage), default from `navigator.language`, `<html lang>` updated. No hardcoded copy in HTML except keys (`data-i18n`). Repo rule says dictionaries live at `src/i18n/en.json, fr.json`; `doc/content.md` is the approved source text that feeds them.
13. **Style/section structure (repo rules):** design tokens only as CSS variables in `src/styles/tokens.css`; one section = `src/sections/<name>/` (html partial, css, js).
14. **Motion/accessibility/perf:** `prefers-reduced-motion` disables Lenis + animations; keyboard accessible; Lighthouse performance > 90; static files only.
15. **Timeline:** no fixed date; first shippable version as soon as it is finished. Early prep, not a rush job.
16. **Workflow:** Plan → ticket → implement one ticket → screenshot check → code review → stop. Never commit without approval.

## Explicitly deferred (not in v1)

- Any alternance banner, availability date, or rhythm details.
- Hosting choice (still TBD, static files only).
- CV download (undecided; not in content file, so not in v1 unless asked).
