# 111: Eyebrow right-side meta (existing strings only)

**What to build:** §5/§5b of `doc/inspo-vs-product-colors-borders.md` shipped the eyebrow bar's shell in 106 but left its right side empty, because the inspiration's per-section qualifier (`Free & open source`) has no counterpart anywhere in our dictionaries and the repo forbids inventing copy. The user has since decided (2026-10-17, `doc/idea-v2-decisions.md`) to fill that side **only from strings that already exist** — no new copy, no new keys. This ticket adds the decorative meta at the bar's inline end, sourced per section from the shipped dictionaries.

**Blocked by:** 106 (committed `12c783f`) for the bar itself, and — **before implementation** — the user's sanction of one narrow-screen mechanism (see OPEN below).

**First: measure the inspiration's right meta** (never measured; 105–110 covered its palette, grid, type scale, nav, rail and ruler, not the eyebrow's right half). Dump from getartcraft.com: the meta's font family / size / weight / `text-transform` / colour, its inline offsets from the cell edge and the left index, and the viewport width at which it disappears. Only then fix ours, and record the delta in the decisions log like the earlier passes.

**Decisions taken (user, 2026-10-17):**

- **Copy: reuse only.** Candidates read off the shipped dictionaries: education → `education.graduation` ("Expected graduation: Summer 2027" / "Diplôme prévu : été 2027") or `education.location` ("Pau, France"); contact → `contact.location` ("Pau, France"). Hero, projects and skills have nothing that is not the bar's own name (`nav.hero`, `projects.title`) or a block label (`projects.items[].stackLabel` = "Stack"), so those three bars stay one-sided. **The asymmetry is inherent to "reuse only"** and is what the visual check below judges; the fallback is the decision's other branch — leave every bar empty and close this ticket as "declined" — which costs nothing to take.
- **Reuse is a visual echo, not duplication of meaning:** 106 made the bar `aria-hidden` (the section's real heading below carries the semantics), so the meta repeats something already shown in the block — the same relationship the inspiration's `Free & open source` has to its body copy — and assistive tech never hears it twice.
- **Binding:** a third flex child of `.section__index`, after the name, bound with `data-i18n` like every other string (no literal text in `index.html`; the i18n engine already binds nested keys such as `education.graduation`). Pushed to the inline end with `margin-inline-start: auto`.

**Decided (user, 2026-10-17): reuse the already-sanctioned `768px` boundary — option 1.** The meta shows above the narrow-mode threshold and is hidden at or below it, and the reuse costs **no new literal**: the existing `@media (max-width: 768px)` query at the end of `tokens.css` (already the owner of the 768px condition for `--lane-total`, and excluded from the token gate) also flips an `--eyebrow-meta-display` token to `none`, which `motion.css` reads for `display`. No new media query, no second occurrence of the literal, and the two narrow-mode changes stay together at one boundary. Cost, accepted: at 640–768px the meta would have fitted and is hidden anyway.

Why not the alternatives: a `640px` literal (option 2) buys only that 640–768px window and costs the repo its single-breakpoint discipline; `flex-wrap` (option 3) makes the pinned bar two rows tall on the narrowest screens (nav 102px + bar) and gives EN and FR different bar heights.

**Not in scope:** new copy or new dictionary keys (excluded by the decision); the bar's sticky offset, blur, counter and name (106, unchanged); lane geometry / viewport centering (its own ticket); the rail; the ruler.

**Status:** todo — unblocked (narrow-screen mechanism decided: option 1).

- [ ] The inspiration's right meta is measured first, and the delta recorded in the decisions log
- [ ] Each intended section's bar renders its chosen existing string at the inline end, bound with `data-i18n` (no literal text in the HTML)
- [ ] No new dictionary keys; EN and FR both resolve; a live language switch re-binds the meta
- [ ] Only the sections with a defensible string show it; the rest keep a one-sided bar
- [ ] Zero horizontal overflow and no clipping/truncation at 375 / 768 / 1440 in EN and FR
- [ ] Reduced motion unaffected (the bar is sticky and has no JS)
- [ ] The visual check judges the partly-filled rule: if it reads as unfinished, fall back to empty-everywhere and log it
- [ ] Token gate clean; screenshot check; code review
