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

/** Read a CSS time token as milliseconds, accepting both `0.4s` and `400ms`
 * (ticket 122's intro beats). */
export function readTimeToken(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}
