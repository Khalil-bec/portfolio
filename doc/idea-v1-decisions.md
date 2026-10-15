# Idea v1 — decisions

Append-only log. Earlier decisions live in `doc/idea-v0-decisions.md`. New entries below are from the idea-v1 brainstorming (2026-10-15), delegated to the agent by the user ("you decide the best choice based on everything i said").

## 2026-10-15 — build approach

- **Chosen:** journey-tuned pacing built on a readable skeleton first. Semantic sections with tokens and EN/FR dictionaries working before any motion; then motion budget spent per the expert journey (projects deepest, skills glanceable, ticker as identity line, image slots reserved).
- **Journey:** theme + scroll feel first, hero brief pass-through, projects carry focus, skills scanned, return to hero, then contact.
- **Ticker (superseded, kept for history):** short identity line about the person; wording was to be approved new copy. Replaced by tagline reuse below.
- **Visuals:** text-first v1 with image slots reserved; screenshots/photo arrive later; favicon/OG included.
- **Setup note (verified):** `src/` empty, no `/vendor` yet — scaffolding + vendoring Lenis/GSAP is step zero of every approach (dependency-approval gate applies).

## 2026-10-15 — brainstorming builder-check resolutions

- **Visuals contradiction resolved:** v1 is text-first with reserved anti-CLS image slots plus favicon/OG now; screenshots/portrait arrive later (per "i can add those later").
- **My calls:** external links open new tab with `rel="noopener"`, mailto same-tab; build plan stops at local static files, host stays TBD; plan starts with an approval-gated scaffolding/vendoring ticket.
- **Still owed by user:** exact ticker line in EN and FR (the only sanctioned new copy).
- **Resolved:** ticker reuses the existing tagline from content in each language — zero new copy (user chose tagline reuse).

## 2026-10-15 — spec strategy (to-spec)

- **Switched to strategy A (motion-first), user override.** The brainstorming doc had recorded C (journey-tuned on a readable skeleton first) as the delegated call; the user explicitly chose A instead. Spec in `doc/idea-v1-spec.md` follows A: approval-gated scaffolding + vendoring first, motion shell (ticker, numbered sections, Lenis + GSAP reveals, reduced-motion kill-switch, keyboard anchors) second, content/dictionaries fit-in after, hardening last.
- **Adaptation note:** a static site exposes no endpoints, so the spec lists the interaction surface (anchors, switch, outbound links, mailto) under "exposed endpoints" instead of inventing an API.

## 2026-10-15 — pre-build check fixes + vendor

- **Brainstorming decision corrected to A** in `doc/idea-v1-brainstorming.md` (C marked not chosen); numbering in `doc/idea-v0-decisions.md` fixed to 1–16; decided items moved out of "Unknowns" in `doc/idea-v1.md`.
- **Monogram brand mark (user-approved):** favicon + OG drawn in code from initials (dark square, KB), no photo needed. Assets built with implementation tickets.
- **Vendor verified:** `/vendor` holds `lenis-1.3.27.min.js` + `lenis-1.3.27.min.css` and `gsap-3.15.0.min.js` + `ScrollTrigger-3.15.0.min.js`, downloaded from jsDelivr and header-checked. Versions match the pinned ranges (Lenis 1.3.x, GSAP 3.15). No other dependencies.
