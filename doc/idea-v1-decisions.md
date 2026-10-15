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

## 2026-10-15 — ticket breakdown (to-tickets)

- **Tickets:** 7 tracer-bullet slices in `doc/tickets/`, one file per ticket numbered `001-` to `007-` (user override of skill default `.scratch/<slug>/issues/` + `01-` numbering): 001 scaffold, 002 Lenis foundation, 003 reveals/ticker shell, 004 bilingual wiring, 005 hero/education/contact, 006 projects/skills, 007 hardening. Each shippable and mergeable on its own.
- **Blocking edges:** 001 gates everything; 002 blocked by 001; 003 blocked by 002; 004 blocked by 001 only (parallel with 002/003); 005 and 006 blocked by 001+003+004 (parallel with each other); 007 blocked by 002+003+004+005+006.
- **Vendor scope (user-confirmed verify-only):** 001 verifies pinned versions only, no re-download (files already verified above).
- **Content split (user-confirmed 3+2):** 005 carries hero/education/contact + code-drawn KB monogram favicon/OG + reserved anti-CLS slots; 006 carries projects/skills with all bullets visible, no expand.
- **Git (user-confirmed):** one ticket = one commit; implement one ticket → screenshot check (375px/1440px) → code review → stop; never commit without explicit approval.

## 2026-10-15 — spec review (backend-architect + security-engineer + product-manager)

- **Review ran:** three parallel read-only reviews of `doc/idea-v1-spec.md` + all 7 tickets against `doc/content.md`, `AGENTS.md`, and this log. Each agent asked clarifying questions first, then gave concerns + recommendations. Full output in `doc/idea-v1-spec-review.md`; no spec or ticket files changed in this pass.
- **Backend-architect deltas (pending fold-back):** pin authoring-time partial inlining in 001; Lenis↔ScrollTrigger bridge + pre-init reduced-motion guard + vendor order in 001/002; CSS-marquee ticker + re-measure hook in 003; namespaced i18n keys/arrays/attr keys + `setLanguage()` refresh sequence in 004; token allowlist + per-ticket grep gate and perf budget in 001; 005/006 file ownership split.
- **Security-engineer deltas (pending fold-back):** `target="_blank" rel="noopener noreferrer"` + new-tab announcement on all 5 outbound links; bare `mailto:` only with spam-risk accepted; `textContent`-only i18n binding, `^(en|fr)$` whitelist, try/catch storage with namespaced key; committed `sha256` vendor provenance + zero-external-request check in 007; favicon-now/OG-gated-until-hosting; CSS motion fallback + anchor focus + `aria-hidden` ticker clone + `<button>` switch with `aria-pressed`.
- **Product-manager deltas (pending fold-back):** cap hero above fold (name/tagline/cue) with about below; minimal persistent nav owning 5 anchors + switch; ticker source key + separator + nowrap + duplication + 375px check; `fr*`→FR-else-EN fallback; motion re-verified with real copy; projects stack-as-chips scannability; contact CTA from existing copy only; 007 gains 768px + reduced-motion captures and combined CLS check.
- **Next step:** user folds approved items back into spec and tickets; no auto-apply.

## 2026-10-15 — build kickoff (pre-ticket-001 resolutions)

- **Review skill:** the user's requested "code-review-expert" does not exist; resolved to `requesting-code-review` after each ticket.
- **Git override of the commit+push request:** user chose to keep `AGENTS.md` ("never commit without my approval"). Workflow per ticket stays: implement one ticket → screenshot check (375px/1440px) → `requesting-code-review` → STOP for explicit approval. No auto-commit and no auto-push, even though the kickoff message asked for both.
- **Spec-review deltas:** user chose "agent decides". The agent folds low-risk review items from `doc/idea-v1-spec-review.md` into the ticket it owns and logs each fold-back here, rather than applying them all up front.

## 2026-10-15 — ticket 001 (scaffold) decisions

- **Authoring-time partial inlining (backend-architect delta, folded):** with no build step, `src/sections/<name>/<name>.html` is the authoritative per-section source, and `index.html` carries the inlined result of those partials. The partial and its inlined copy are kept in sync by hand; a comment in `index.html` states the convention to prevent drift. No runtime `fetch` of partials (keeps the page readable without JS and avoids a network round-trip).
- **Styles split:** `src/styles/tokens.css` holds design tokens, as CSS variables only (per repo rule). A small `src/styles/base.css` holds the reset + base element styling that consumes those tokens; tokens are not declared anywhere else.
- **Sections are empty in 001:** each section is a bare `<section id="…">` with its class only. Headings, copy, numbering, i18n keys and `data-i18n` bindings arrive in later tickets (003 numbering, 004 dictionaries, 005/006 content). No visible copy is hardcoded.
- **`<title>`:** 001 ships a literal `<title>` (the person's name — data, not translated marketing copy). Ticket 004 will drive it from an i18n `meta.title` key instead.
- **Section JS:** `src/main.js` is the single module entry; each section ships a stub `*.js` (its behaviour lands in later tickets). Section CSS is linked from `index.html` for every section.

## 2026-10-15 — ticket 001 fold-backs from spec review (applied)

- **Vendor provenance (security rec 4):** SHA-256 of the four vendored files committed to `vendor/README.md` with a compare-only rule and an update policy. `vendor/README.md` also records the "ask before bumping" rule.
- **Token allowlist + grep gate (backend rec 6):** every raw value (colour, size, duration, easing) must live in `src/styles/tokens.css`; `base.css` and `src/sections/*/*.css` may only consume `var()`. Runnable gate per ticket:
  `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|[0-9]*\.?[0-9]+(px|rem|em|ms|vh|vw|svh|ch)\b' src/styles/base.css src/sections/*/*.css`
  → must print nothing. Token total is intentionally small now; categories grow with the tickets that need them.
- **Perf budget (backend rec 7):** system font stack only (no webfonts), fixed-aspect-ratio slots later, one module entry (no bundler), section CSS is small and render-blocking but bounded. Final budget recorded in 007.
- **Local test note (backend rec 1):** ES modules require an HTTP origin; test with `python3 -m http.server` (not `file://`). Recorded here so later tickets do not chase phantom CORS failures.
- **CSS-level reduced-motion reset (security rec 6, partial):** `src/styles/base.css` neutralises animation/transition durations and `scroll-behavior` under `prefers-reduced-motion`, independent of the JS kill-switch that ticket 002 adds.
- **`<title>` (recorded earlier):** literal for now; ticket 004 switches it to the `meta.title` i18n key.

## 2026-10-15 — ticket 001 verification

- **Load:** all resources served `200` from `python3 -m http.server 8123`; zero 404s.
- **Console:** none (Chromium headless, `--enable-logging`, live DOM dump).
- **Structure:** `main > section` order is hero → projects → skills → education → contact; anchors present.
- **Copy:** rendered body text is empty — no hardcoded visible copy.
- **Reduced motion:** renders (nothing animated yet).
- **Token gate:** grep above prints nothing.
- **Screenshots:** `/tmp/opencode/001-375.png`, `/tmp/opencode/001-1440.png`, `/tmp/opencode/001-375-reduced.png` (blank dark page, as expected for an empty scaffold).
- **Known gap:** `/favicon.ico` still 404s in a browser (browsers request it unprompted). Deliberately deferred: the code-drawn KB monogram is ticket 005. The 001 "zero 404s" claim means zero 404s for *referenced* resources.

## 2026-10-15 — ticket 001 code review (requesting-code-review)

- **Review:** dispatched one reviewer subagent over the uncommitted working tree (base `48f89a0`). Verdict: "with fixes". No Critical issues. It independently confirmed section order/anchors, the token gate (prints nothing), and that the four vendor SHA-256 hashes match the bytes on disk.
- **Fixed from review:** `index.html` load-order comment corrected ("alphabetical" → "document order, hero → contact").
- **Accepted as-is (deliberate, logged):** the literal `<title>` (pre-authorized above, ticket 004 binds `meta.title`); the deferred favicon 404 (ticket 005).
- **Forwarded to later tickets:** widen the per-ticket token gate to `src/styles/*.css` excluding `tokens.css` (so a future `layout.css` cannot slip past it); in 002, reconcile `html { scroll-behavior: smooth }` (the no-JS baseline) with Lenis owning anchor scroll; in 007, optionally assert each `src/sections/*/*.html` fragment appears verbatim in `index.html`.

## 2026-10-15 — ticket 001 committed + hosted

- **User approved commit + hosting.** Two commits on `main`: `b4cc247` (ticket 001 code + decisions) and `b373440` (v1 tickets, spec review, repo skills). No co-author trailer. This is the point where the "never commit without approval" rule was explicitly satisfied for ticket 001.
- **Remote:** private GitHub repo `Khalil-bec/portfolio` (created via `gh repo create --private`, SSH remote `origin`, default branch `main`). v1 still stops at local static files — the repo is a convenience, not a deployment.

## 2026-10-15 — ticket 002 (motion foundation) decisions

- **Persistent nav deferred to 004 (user-confirmed).** The 5 anchors + EN/FR switch carry copy, and all copy must come from the i18n dictionaries, which do not exist until 004. Building the nav in 002 would force either hardcoded labels or blank `data-i18n` labels. So 002 ships the scroll/focus *mechanism* only; the nav (and its keyboard reachability) lands with the dictionaries in 004. The ticket-002 criterion "anchors reachable keyboard-only" is verified mechanically with a throwaway anchor fixture that is **not committed**.
- **002 is Lenis-only; GSAP/ScrollTrigger deferred to 003 (user-confirmed).** The spec-review suggested putting the Lenis↔ScrollTrigger bridge in 002, but the ticket scopes reveals (and therefore GSAP) to 003. Loading GSAP a ticket before any animation exists would be unverifiable dead weight, so 003 loads `gsap` → `ScrollTrigger` and wires `lenis.on('scroll', ScrollTrigger.update)` + the `gsap.ticker` bridge. `initSmoothScroll()` returns `{ lenis, reducedMotion }` for 003 to consume. **003 takes over the rAF loop** (swap it for `gsap.ticker`) instead of starting a second loop.
- **Vendor loading (002).** `vendor/lenis-1.3.27.min.css` links in `<head>` before `tokens.css`; `vendor/lenis-1.3.27.min.js` loads as a deferred classic script before the `src/main.js` module. Deferred classics and non-async modules execute in document order, so the `window.Lenis` global exists before the module runs. Vendored libs are UMD globals, not ES modules (the AGENTS "vanilla ES modules" rule applies to first-party `src/` code).
- **`scroll-behavior` reconciliation (001 forward item, resolved).** `base.css` keeps `html { scroll-behavior: smooth }` as the no-JS baseline and adds `html.lenis { scroll-behavior: auto }` so Lenis owns the scroll once it adds the `lenis` class to `<html>`; otherwise the native baseline would smooth-scroll underneath Lenis. The reduced-motion media query already resets to `auto`.
- **Anchor focus moves (security rec 6).** A delegated `a[href^="#"]` click listener moves DOM focus to the target (`tabindex="-1"` + `focus({ preventScroll: true })`), so keyboard users land where they navigated. Focus handling is registered **independent of Lenis**, so it also works on the reduced-motion instant-jump path. Scope is deliberately click-only (mouse + keyboard Enter both fire `click`); `hashchange` (back/forward, direct `#hash` load) is **not** handled in 002 and is left for a later ticket.
- **Reduced-motion kill-switch is a pre-init snapshot (one-way, fail-safe).** `prefers-reduced-motion` is read once at init; loading with reduce on never constructs Lenis. Toggling reduce on at runtime is covered by Lenis' own `respectReducedMotion: true` default; toggling it off after load needs a reload. Logged in the module docstring.
- **`LERP = 0.12` is a JS tuning constant, not a CSS token.** The "tokens only as CSS variables" rule governs CSS; a lerp is an algorithm parameter, not a design token.
- **Token gate widened and run (001 forward item):** `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|[0-9]*\.?[0-9]+(px|rem|em|ms|vh|vw|svh|ch)\b' src/styles/*.css src/sections/*/*.css --exclude=tokens.css` prints nothing. `base.css`'s only new literal is the keyword `auto`.

## 2026-10-15 — ticket 002 verification (visual-qa)

- **Harness:** local `python3 -m http.server 8123`; Playwright 1.64.1 bundled Chromium (Playwright's `chrome` channel is not installed; used the cached `chromium-1248`). Scripts kept in `/tmp/opencode/qa-002*.mjs` (not committed).
- **Smooth path:** at 1440×900 and 375×812 the page shows `html.lenis`, `window.lenis.version === "1.3.27"`, computed `scroll-behavior: auto`. Zero console errors, zero page errors, no horizontal overflow (`scrollWidth === clientWidth`).
- **Anchor navigation:** clicking `#contact` lands at the section with focus on it (`activeElement.id === "contact"`, `tabindex="-1"`); same for keyboard Tab→Enter on `#projects`. Scroll trajectory sampled per frame is monotonic (0→204→…→1800, **0 jump-backs**), i.e. Lenis' smooth scroll wins cleanly and the native fragment jump is never painted — the double-action Minor raised in review is verified absent.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, no `lenis` class and no Lenis instance; anchor click still jumps instantly and moves focus.
- **No-JS:** with JavaScript disabled, computed `scroll-behavior: smooth` (no-JS baseline intact), no `lenis` class.
- **Screenshots:** `/tmp/opencode/002-375.png`, `/tmp/opencode/002-1440.png`, `/tmp/opencode/002-1440-reduced.png` (dark, empty sections — expected before 005/006).
- **Visual-qa note:** the skill's EN/FR + language-switch checks do not apply yet (no switch until 004); nothing to flips-test.
- **Forwarded to 007:** `vendor/lenis-1.3.27.min.css` ends with a `sourceMappingURL` pointing at a jsDelivr `.map` — confirm it never becomes a runtime external request (devtools-only concern).

## 2026-10-15 — ticket 002 code review (requesting-code-review)

- **Review:** one reviewer subagent over the uncommitted working tree (base `55a68a6`). Verdict: "with fixes". **No Critical, no code defects.** Both Important items were process/docs: (1) `doc/status.md` still said `todo`, (2) the two pre-coding decisions were not yet in this log — both fixed in this pass. It independently confirmed the Lenis contract (`autoRaf:false` default), the token gate, the load-order reasoning, and the four vendor SHA-256s.
- **Fixed from review:** reworded the `index.html` stylesheet-order comment (removed an implied token/vendor cascade conflict); added docstring notes for the one-way reduced-motion snapshot and for 003 taking over the rAF loop.
- **Verified, no change (Minor 3):** the per-frame trajectory (above) shows no jump-back, so not `preventDefault`-ing is fine as-is.
- **Accepted as-is / deferred (Minors):** click-only focus (no `hashchange`) — logged above; permanent `tabindex="-1"` + full-section `:focus-visible` ring — standard skip-link behavior; `reducedMotion` snapshot — logged; `LERP` literal — logged.

## 2026-10-15 — ticket 003 (reveals + numbered sections + ticker shell) decisions

- **Scope — mechanisms only (user-confirmed).** Dictionaries (004) and real copy (005/006) do not exist yet, so 003 commits the reveal/numbering/ticker *mechanisms* and binds the ticker to the `hero.tagline` i18n key (empty until 004). Motion is verified with a throwaway Playwright fixture (`qa-003-fixture.html`, **not committed**, deleted after use), the same pattern 002 used for the keyboard-anchor fixture. No invented copy; the sections stay copy-free.
- **Numbered sections (user-confirmed: all five, hero = 01).** `main { counter-reset: section }` + `.section { counter-increment: section }`, number drawn by `.section__index::before` as `counter(section, decimal-leading-zero)` → 01–05. The index span is `aria-hidden`, so screen readers do not hear "01". 003 solely owns the counters (per spec review), so content tickets only add headings/rows after the index.
- **Ticker (user-confirmed: fixed bottom bar).** A CSS-keyframe marquee (spec-review preference), not GSAP. JS clones the `[data-ticker-source]` item into two mirrored `.ticker__group`s and animates the track to `-50%` for a seamless loop. Clone count is computed to cover the viewport; the loop duration = group width / speed, written to `--ticker-duration` per element (the token holds the default). Clones are `aria-hidden`, so the tagline is announced once. `refreshTicker()` rebuilds from the current source text (the 004 hook — it re-fills after a language switch changes the tagline length, avoiding a loop gap). An empty tagline → `.ticker--idle` (hidden), so 003-alone shows no dotted empty bar.
- **Reduced motion / no-JS progressive enhancement.** No GSAP, no reveals, no marquee: reveals are GSAP-only and rows are never hidden by CSS, and the ticker falls back to a single static, in-flow, readable line. `prefers-reduced-motion` remains the pre-init snapshot from 002. `body.has-ticker` adds bottom padding only while the pinned bar is live (bottom padding causes no layout shift).
- **Reveals.** `[data-reveal]` rows are revealed by `ScrollTrigger.batch` (`once: true`, `start: top 85%`); the hidden start state is applied by `gsap.set` in JS only, so a failed script leaves every row visible (007's "no content hidden if JS fails").
- **GSAP bridge + rAF takeover.** 003 loads `gsap` → `ScrollTrigger` → `lenis` (deferred classics) and wires `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` (002's self-owned rAF retired) — one loop. If GSAP/ScrollTrigger are missing, the bridge drives Lenis with a fallback rAF instead, because Lenis preventDefaults wheel/touch scroll while active (without a driver the page would freeze).
- **Token placement (extends the 002 precedent).** Reveal pacing (`--reveal-duration`, `--reveal-distance`, `--reveal-stagger`, unitless) and ticker values (`--ticker-height`, `--ticker-speed`, `--ticker-dot`, `--ticker-duration`) are design tokens in `tokens.css` (visual values). `LERP` stays a JS constant (algorithm parameter). The GSAP ease string stays a JS constant (`power2.out`) because GSAP cannot consume a raw CSS cubic-bezier without CustomEase. Added `--border-width` for the ticker's top border.
- **Shared token reader.** New `src/motion/tokens.js` exports `readNumberToken`, used by both `reveals.js` and `ticker.js` (removes a duplicated reader flagged in review).
- **Token gate** (widened, run): prints nothing.
- **Visual QA:** fixture at 1440×900 and 375×812 (motion) and 1440 reduced; the committed `index.html` at 1440 motion and 375 reduced. Section order hero → contact; zero console/page errors; no horizontal overflow; rows reveal 0 → 1 on scroll; the ticker builds two mirrored groups with `aria-hidden` clones and re-fills to ≥ viewport after a simulated shorter language switch; reduced motion leaves rows visible and the ticker static; the committed page hides the empty ticker. Screenshots `/tmp/opencode/003-*.png`.
- **Code review:** two parallel axes (`Standards` + `Spec` via the `code-review` skill). Findings triaged: fixed a raw `40s` duration literal (now the `--ticker-duration` token); fixed a freeze risk when the vendor GSAP is missing (fallback rAF); extracted the shared token reader; made `refreshTicker` rebuild groups (fixes a loop gap on a shorter language switch). Accepted as-is (logged): renamed `ctx`→`state` and `refresh`→`sync` for clarity; the LERP-vs-tokens split is deliberate (algorithm param vs visual value); `.section` spanning `base.css` + `motion.css` is the numbering owner's one line; `refreshReveals` / `refreshTicker` are pre-authorized 004 hooks (Middle Man by design).

