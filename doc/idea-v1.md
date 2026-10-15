# Portfolio idea v1

## Goal (restated)

Build a static personal portfolio for Mohamed Khalil Becheikh, L3 informatique at UPPA (Pau, graduation summer 2027), targeting DevOps / Cloud / SRE. Its job is to make conversations with experts easier: instead of explaining background and skills from scratch, one link shows craft first and substance second. It is early preparation for a 27/28 alternance search, but v1 itself says nothing about alternance.

## Why

Talking to an expert without something to show forces repeated explaining. A polished, fast, bilingual site that presents three real infrastructure-flavored projects plus tiered skills lets the expert quickly trust the person behind it. The site's own construction (clean vanilla code, smooth but respectful motion, correct bilingual handling, accessible, fast) is itself evidence of professionalism and CS capacity.

## Scope — what v1 is

- Five sections in fixed order: hero → projects → skills → education → contact (contact last).
- Hero carries the about material: name, tagline, about paragraphs, and human languages (Arabic, French, English), exactly as placed in `doc/content.md`. No separate about section. No invented CTA copy: any hero/nav links reuse existing section titles as anchors only (my call, to respect the no-hardcoded-copy rule).
- Projects: Homelab, GymTrack, Kshell with stack lines, all detail bullets shown at once with scroll reveals (no expand/collapse), plus repo links.
- Marquee ticker reuses the existing tagline from content ("DevOps & Infrastructure" + student line) in each language — zero new copy.
- Visuals: text-first v1 with reserved image slots (anti-CLS sized) plus favicon/OG now; project screenshots and portrait arrive later from the user.
- Skills in four tiers exactly as in content file: core (production), hands-on (real setups), academic (C/C++ coursework only), currently learning (Terraform, AWS, Kubernetes).
- Education: UPPA Licence Informatique L3, expected summer 2027.
- Contact: email + GitHub profile + LinkedIn + location. Links only, no form.
- Bilingual EN/FR with visible switch, persisted choice, browser-language default, `<html lang>` updated, all copy from dictionaries (keys in HTML only).
- Feel inspired by the reference linked in idea-v0 (dark theme, marquee ticker, numbered sections, scroll-revealed rows), reimplemented from scratch. No reference code copied.
- Calm pacing: never throws everything at once; progressive reveals guide the eye.
- Fully polished on both phone and desktop; verified at 375px and 1440px.

## Non-goals / anti-goals

- No alternance banner, availability, or rhythm in v1.
- No contact form, no blog, no CV download (not in content file).
- No frameworks, no bundler, no backend.
- No information dump: density and pacing are capped so each section breathes.
- No copying of reference code or assets.

## Constraints

- Vanilla HTML/CSS/JS (ES modules), no build step. Lenis 1.3.x (lerp ~0.12, anchors on) + GSAP 3.15 / ScrollTrigger, vendored locally. Libraries only from `/vendor`; ask before any new dependency.
- Copy: `doc/content.md` is the approved source; runtime dictionaries at `src/i18n/en.json, fr.json`; never hardcode text in HTML except `data-i18n` keys.
- Tokens only as CSS variables in `src/styles/tokens.css`. One section = `src/sections/<name>/` (html partial, css, js).
- `prefers-reduced-motion` disables Lenis + animations. Keyboard accessible. Lighthouse performance > 90. Static files only; hosting TBD.
- Never commit without approval. Workflow: plan → ticket → implement one ticket → screenshot check → code review → stop.

## Assumptions

- The FR and EN texts in `doc/content.md` are final and carried over faithfully (translation, not rewriting).
- Hero = about material; no separate about section.
- Project links and contact links are plain links the visitor follows; email via mailto link.
- `/vendor` holds Lenis 1.3.27 + GSAP 3.15.0/ScrollTrigger (verified 2026-10-15, versioned filenames). No other dependencies.
- JSON dictionaries are generated/kept in sync from `doc/content.md` without changing wording.
- "As soon as it finishes" means no hard deadline; quality and polish win over speed.

## Unknowns

- Whether a CV download or any extra contact channel gets added later (out of v1).
- Alternance details for a future version (dates, rhythm, school wording) — deliberately not collected now.

## Decided during checks (moved out of unknowns)

- Links: external project/social links open in a new tab (`target="_blank" rel="noopener"`); email uses a same-tab mailto link (call, a11y-safe default).
- Hosting: out of scope for the build plan — v1 stops at local static files; host choice stays TBD.

## What is left to the builder

- Section-by-section plan and tickets following the repo workflow.
- Exact reveal choreography, ticker behavior, and numbering within the reimplemented feel.
- Dictionary key scheme (`data-i18n`) and the content.md → JSON sync step.
- Screenshot checks at 375px and 1440px, plus reduced-motion and keyboard passes.
