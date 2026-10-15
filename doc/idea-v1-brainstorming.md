# Idea v1 — brainstorming (approaches)

Date: 2026-10-15. Source: `doc/idea-v1.md`, `doc/idea-v0-decisions.md`, `doc/content.md`, and clarification conversation. Basis for decisions recorded in `doc/idea-v1-decisions.md`.

## Expert journey (agreed)

First thirty seconds: the theme and scroll mechanism register first, the hero is a brief pass, then attention lands on projects. After projects, a quick glance at skills; if interested, the expert returns to re-read the hero and then goes to contact. So the page reads: hero briefly → projects with focus → skills scanned → education → contact, with return-to-hero supported.

## Clarifications gathered

- **Setup:** `src/` is empty and no `/vendor` exists yet, so every approach starts with scaffolding plus vendoring Lenis + GSAP (repo rule: ask before adding any dependency).
- **Ticker:** reuses the existing tagline from content in each language — zero new copy (user chose tagline reuse over new wording).
- **Visuals:** no screenshots or photo exist yet; the user adds them later. V1 ships text-first with image slots reserved (plus favicon/OG).
- **Hero:** carries name, tagline, about paragraphs, and human languages; no invented CTA copy.
- **Motion:** Lenis smooth scroll + GSAP reveals reimplementing the reference rhythm from scratch; `prefers-reduced-motion` disables both.

## Approaches considered

### A — Motion-first (faithful reimplementation up front)

Build the full reference rhythm immediately: ticker, numbered sections, row reveals, richest project choreography, then fit content into it.
Good when the wow factor is the top risk. Costs the most motion, keyboard/focus, and Lighthouse-budget work; content and i18n correctness arrive later.

### B — Content-first static skeleton

Build fully readable semantic sections with tokens and both dictionaries and zero JS first, then layer Lenis/GSAP as enhancement.
Good when readability, bilingual correctness, and performance are the top risks. Least wow early, but safest a11y and Lighthouse behavior, and motion degrades gracefully.

### C — Journey-tuned pacing (not chosen)

Same stack, but the motion and density budget follows the expert journey: hero quick, projects deepest reveals, skills glanceable, education compact, contact terminal. Ticker reuses the tagline; image slots reserved.
Good when attention placement is the top risk. Requires the most design decisions upfront, which this brainstorming has now supplied.

## Decision (corrected 2026-10-15: A motion-first, user override)

**A — motion-first:** approval-gated scaffolding plus vendored libraries first, then the full motion shell (ticker, numbered sections, row reveals), then content and dictionaries fitted in, then hardening. This overrides the earlier delegated call for C. Motion-first fits because the expert's first impression is the theme and scroll mechanism; content correctness follows in the fit-in step.
