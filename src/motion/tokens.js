/**
 * Design-token reader shared by the motion modules (ticket 003).
 *
 * Motion pacing lives as unitless numeric tokens in tokens.css (e.g.
 * `--reveal-duration: 0.7`); this reads one back as a Number so GSAP and the
 * ticker measure share a single source of truth.
 */
export function readNumberToken(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}
