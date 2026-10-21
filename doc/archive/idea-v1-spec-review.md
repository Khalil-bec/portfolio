# Idea v1 — spec + tickets review

Source: `doc/idea-v1-spec.md` + `doc/tickets/001-007` reviewed 2026-10-15 by three parallel reviewers (backend-architect, security-engineer, product-manager). Each reviewer asked clarifying questions first where context was missing, then gave concerns tied to spec lines/tickets plus foldable recommendations. No spec or ticket changes made in this pass — fold-back is pending user approval.

---

## 1. Backend-architect

### Clarifying questions
1. Partial assembly strategy (001): are `src/sections/<name>/` partials inlined into `index.html` at authoring time, or `fetch()`-injected at runtime? Decides FOUC, i18n timing, ScrollTrigger measurement.
2. i18n key scheme + rich-text binding (004): flat vs nested keys? `textContent` only, or sanctioned `innerHTML` for bold/links/`code` bullets? How are attributes (`aria-label`, `title`) keyed?
3. Vendor module format + load order (001/002): vendored files expose globals via classic `<script>`, but AGENTS.md mandates vanilla ES modules — do section `js` consume globals or import ESM builds? Exact `<script>`/`<link>` order?
4. Lenis↔ScrollTrigger contract (002/003): is `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` bridge assumed? Ticker CSS-animation or GSAP-driven? Changes kill-switch and re-measure logic.

### Concerns
1. Partial-per-section vs no-bundler assembly (spec Scope-1, 001): 5×(html+css+js) with no build step implies 15+ requests or runtime fetch-injection; fetch breaks motion-first (stale trigger positions, i18n race, CLS cost). 001 names no mechanism.
2. Motion-before-content invalidation (Scope-2→3, 002/003→005/006): reveals calibrated on placeholders, then long bullets land (~15 + stack lines) with no mandated `ScrollTrigger.refresh()` + ticker re-measure; FR↔EN length deltas worsen it.
3. Ticker↔i18n ownership gap (003+004): 003 builds ticker on placeholder key, 004 flips strings including ticker — neither owns re-render + re-measure + refresh on switch.
4. i18n keying/markup unspec'd (spec Data, 004): bold, `code`, links, blockquote note cannot render via `textContent` alone; unscoped keys collide across projects. No namespace/array/attribute convention.
5. Vendor integration footgun (001/002): no declared CSS/JS order, no Lenis↔ScrollTrigger bridge spec; sections may load before globals (`ScrollTrigger is not defined`).
6. Reduced-motion flash (002/003): kill-switch evaluated after Lenis init causes smoothed flash; ticker tech undecided (CSS media-query kill vs GSAP `matchMedia` teardown).
7. Token discipline unenforceable until 007: no allowed-token list, layering order, or grep gate before hardening — literals will ship for five tickets unchecked.
8. Lighthouse >90 vs asset fan-out (007): ~15 render-blocking requests with no budget (`defer`, non-blocking CSS) set in 001. Mitigator: no webfonts — keep system stack.
9. 005 ∥ 006 merge hazard: both touch `index.html` order, dictionaries, section rhythm with no file ownership split.

### Recommendations
1. Pin assembly in 001: partials are authoring-time fragments inlined into `index.html` (single served document, no runtime fetch); add acceptance "renders with JS disabled except language default".
2. Add refresh contract: 003 exposes ticker re-measure hook; 004 owns `setLanguage()` (bind incl. ticker → set `<html lang>` → re-measure → `ScrollTrigger.refresh()`); 005/006 call refresh after fit-in.
3. Specify i18n scheme in 004: namespaced dotted keys + arrays (e.g. `projects.homelab.bullets[0]`), `data-i18n` for text, allowlisted `data-i18n-html` only for markup-bearing strings, `data-i18n-attr` for attributes; grep gate for visible literals.
4. Specify vendor order in 001, bridge in 002: head Lenis CSS (non-blocking) → tokens → section CSS; body end `gsap` → `ScrollTrigger` → `lenis` (deferred classics) then one module entry; 002 includes `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` bridge and pre-init `matchMedia('(prefers-reduced-motion: reduce)')` guard skipping Lenis.
5. Decide ticker tech in 003: prefer CSS keyframe marquee over duplicated span (one media-query kill, trivial re-measure); if GSAP-driven, require `matchMedia` teardown same ticket.
6. Move token gate left to 001: allowed categories + layering order + runnable grep check each ticket; 007 keeps final audit.
7. Set perf budget in 001: cap render-blocking CSS, `defer` scripts, system fonts only, fixed `aspect-ratio` slots; 007 records Lighthouse run config with score.
8. Split 005/006 ownership: 005 owns hero/education/contact + favicon/OG + slots; 006 owns projects/skills; order frozen by 001; 003 solely owns numbered-section counters.

---

## 2. Security-engineer

### Clarifying questions
1. localStorage key contract (004): namespaced key (e.g. `portfolio:lang`)? Whitelist to `en|fr` on read? Fully functional when storage throws (private mode) via try/catch + in-memory fallback?
2. Vendor verification record (001): what did "header-checked" verify — byte hash recorded where, over TLS from jsDelivr — and is SRI/hash-pin or provenance committed for later comparison?
3. Link hardening scope (005/006): `target="_blank" + rel="noopener"` vs `noopener noreferrer` uniformly on all 5 outbound links? Is `noreferrer` excluded intentionally?
4. OG absolute URL vs hosting TBD (005): `og:image`/`og:url` need absolute `https://` URLs that don't exist — v1 placeholder policy (relative, omitted-with-TODO, or stub) so no localhost ships?
5. External-request / CSP budget (007): is "zero runtime external requests" an explicit 007 check, and is a `<meta>` CSP in or deferred until hosting is known?

### Concerns
1. Referrer leak: `rel="noopener"` stops reverse-tabnabbing but still sends `Referer` to GitHub/LinkedIn.
2. New-tab without warning (005/006/007): five `target="_blank"` links with no announce-new-tab requirement; SR/keyboard users get no warning.
3. Email harvestability: plain `khalil.becheikh54@gmail.com` in content → dictionaries → `mailto:` is scraper-trivial; unacknowledged single exposure point.
4. `mailto:` construction risk: if `href` ever built from dictionary strings with params, unencoded `&`/`?`/newlines become injection. Currently bare, but unconstrained.
5. localStorage trust + failure mode (004): untrusted value, no whitelist/try-catch; generic key collides; private-mode throw can break load.
6. `data-i18n` injection sink (004): `innerHTML` binding would turn future markup in JSON into same-origin XSS sink. Nothing bans it.
7. Vendored supply chain verify-once/record-nowhere (001): no committed hash/provenance, no CVE-update policy; freezes code with no detection. `file://` testing can mask CORS failures.
8. OG/favicon absolute-URL trap (005): relative/localhost OG URLs ship broken/leaky metadata; no 007 check catches it.
9. No external-request assertion (007): stray font/analytics/sourcemap fetch would pass all gates.
10. Reduced-motion JS-only (002/003/007): CSS smooth-scroll/marquee could still move with JS disabled/failed; ticker clone `aria-hidden` and Lenis anchor focus (`tabindex="-1"` + focus) unspecified — focus-loss + SR duplication risk.
11. Switch semantics (004/007): "visible switch" with no element/ARIA contract could ship as `<div>`-with-click; `hreflang`/`aria-pressed`/`aria-label` unspecified.

### Recommendations
1. Pin link contract in 005/006: `target="_blank" rel="noopener noreferrer"`, `https://` only, visually-hidden "opens in new tab" / `aria-label` suffix; explicit 007 check. (Covers 1–2.)
2. Constrain `mailto:` in 005: bare `href="mailto:<address>"` only, same-tab, no params; validated constant, never concatenated dictionary HTML; log spam-harvesting as accepted risk. (Covers 3–4.)
3. Harden i18n binding in 004: `textContent` only (ban `innerHTML`); whitelist `^(en|fr)$`, fallback `navigator.language` → `en`; try/catch + in-memory fallback; namespaced key (e.g. `mkb-portfolio:lang`); 007 checks corrupt/disabled storage. (Covers 5–6.)
4. Record vendor provenance in 001: commit `sha256` of four files (+ URLs) to decisions log or `vendor/README`; "hash-compare only" check; CVE-watch note; 007 asserts zero runtime external requests incl. sourcemaps. (Covers 7, 9.)
5. Gate OG on hosting (005/007): favicon now; `og:image`/`og:url` relative-or-omitted-with-TODO until hosting lands, never localhost; 007 view-source check. (Covers 8.)
6. Dual-layer motion + focus (002/003/007): CSS `@media (prefers-reduced-motion: reduce)` fallback independent of JS kill-switch; Lenis jumps move DOM focus (`tabindex="-1"` + `focus({preventScroll:true})`); ticker clone `aria-hidden="true"`; switch as real `<button>` with `aria-pressed` + `:focus-visible`. Verify in 007. (Covers 10–11.)

---

## 3. Product-manager

### Clarifying questions
1. Pass/fail signal for "feel the craft in the first seconds" (spec:7)? Qualitative first-viewport screenshot review or metric (LCP/TTI)? Acceptance lists only binary checks.
2. Hero density vs pass-through? Goal says pass through hero to projects, but 005 loads name + tagline + 3 paragraphs + languages. What sits above the fold vs below within `#hero`?
3. Language fallback for non-EN/FR (`ar`, `es`, `fr-CA`, `en-US`)? Only `en/fr.json` exist. Confirm rule (e.g. `fr*` → FR, else EN)?
4. Visible persistent nav or anchors only? Five anchors + switch listed, but no ticket builds a header/nav. How does the expert jump without manual scrolling?
5. Lighthouse >90 on which profile? Mobile/desktop, throttling, a11y/SEO floor?

### Concerns
1. Hero overload breaks journey (spec:7 + 005): three paragraphs + languages front-load reading before projects carry focus; motion tuned on placeholders worsens it.
2. No navigational UI (spec:29-33, 002/005): anchors + switch exist but no header/nav owns them; switch buried, mobile requires full scrub.
3. Ticker reuses full tagline verbatim (003/004): FR/EN length delta; 375px risks wrap/overflow/speed issues. No truncation/separator/re-render rule.
4. Bilingual key-parity risk (004): tier names differ structurally, education lines differ, Kshell `aide` stays French in EN. 1:1 key coverage unenforced — flips will miss/break.
5. Motion verified on placeholders, content after (A sequencing 002/003→005/006): reveal pacing tuned on short rows misbehaves on 15 dense bullets; only 007 re-checks, and only perf/screenshots.
6. Projects wall-of-text (006): all bullets visible with bold leads + stack line only; expert must read paragraphs for signals; empty slots add whitespace reading as broken.
7. Contact ends with no next-step cue (005, non-goals): no alternance wording (correct), no form — mailto + links with no CTA framing using existing copy.
8. Hardening gate narrow (007): perf-only, static 375/1440 screenshots, no 768px, no reduced-motion capture, no combined CLS check (slots + ticker + language flip).

### Recommendations
1. Cap hero above fold (005 + spec acceptance): name + tagline + positioning + scroll cue in first viewport; about + languages below fold within `#hero`.
2. Add minimal persistent nav (002 or 005): sticky/hero-top bar with 5 anchors + EN/FR switch, keyboard-reachable with visible focus.
3. Pin ticker contract (003/004): exact source key, separator (e.g. `·`), `white-space: nowrap`, duplication ×N, re-init on switch, 375px overflow check in 007. Zero new copy preserved.
4. Define fallback explicitly (004): `fr*` → FR else EN; persist override; set `<html lang>` on load + switch. Covers `ar` visitors without third dictionary.
5. Motion-with-real-copy re-verification (007 or 005/006 exit): re-check reveal pacing + ticker after content lands; "no content hidden if JS/GSAP fails".
6. Scannable projects layer without new copy (006): Stack line as chips/labels row, bold leads kept, consistent repo-link placement, literals (`service_healthy`, `$PATH`, `~/.ksh_aliases`) exact; slots get fixed aspect-ratio + intentional placeholder treatment.
7. Frame contact with existing copy only (005): email + Pau location + GitHub/LinkedIn as CTA block verbatim; no availability wording.
8. Harden 007: Lighthouse mobile perf >90 (state throttling), zero a11y errors on switch/anchors/focus; 375 + 1440 + 768 spot-check + reduced-motion capture; combined CLS check.

---

## Suggested fold-back (pending approval, not applied)

- 001: assembly rule, vendor order + provenance hashes, token allowlist + grep gate, perf budget, `file://` vs `http://localhost` test note.
- 002: Lenis↔ScrollTrigger bridge, pre-init reduced-motion guard, CSS fallback, persistent nav ownership, anchor focus behavior.
- 003: ticker tech (CSS marquee), source key + separator + nowrap + duplication, re-measure hook, `aria-hidden` clone, numbered-counter ownership.
- 004: namespaced key scheme + arrays + attr keys, `textContent`-only, `fr*`→FR-else-EN fallback, storage try/catch + whitelist, `setLanguage()` sequence with re-measure + refresh, `<button>` + `aria-pressed` switch.
- 005: hero above-fold cap, CTA framing with existing copy, bare-mailto constraint, favicon-now/OG-gated policy, file ownership.
- 006: stack-as-chips scannability, literals exact, slot placeholder treatment, file ownership.
- 007: mobile-throttling Lighthouse + run-config record, 375/1440 + 768 + reduced-motion captures, combined CLS + corrupt-storage + view-source + no-external-request checks.
