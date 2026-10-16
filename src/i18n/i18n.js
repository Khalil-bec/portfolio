/**
 * Bilingual wiring — i18n engine (ticket 004).
 *
 * Loads the EN/FR dictionaries (src/i18n/en.json, fr.json) and flips every
 * bound element when the language changes. Binding is TEXT-ONLY and never uses
 * `innerHTML`: a small marker renderer (`**bold**`, `*italic*`, `` `code` ``)
 * builds `<strong>` / `<em>` / `<code>` nodes with `createElement` +
 * `textContent`, so a future non-literal string can never become a same-origin
 * XSS sink (security review, ticket 004).
 *
 * Storage contract: one namespaced key, `mkb-portfolio:lang`, read through a
 * `try/catch` and whitelisted to `en|fr`, so a corrupt value or a storage
 * exception (private mode) can never break the page. First-visit default:
 * a primary browser language starting with `fr` maps to FR, anything else to EN.
 *
 * `setLanguage()` is the refresh sequence the spec pins: bind every string
 * (including the ticker's source) -> set `<html lang>` -> re-measure the ticker
 * -> `ScrollTrigger.refresh()`. The language switch calls it.
 *
 * An element may opt out of rich rendering with `data-i18n-mode="text"`: the
 * markers are stripped and plain text is set, which is what the marquee ticker
 * wants (it clones `textContent`, so it must not inherit `<strong>` nodes).
 *
 * Copy arrives at runtime, so with JavaScript off the bound elements stay empty
 * (the ticket forbids hardcoded fallback copy in the HTML). Deliberate, logged
 * in doc/idea-v1-decisions.md.
 */

import { refreshTicker } from "../motion/ticker.js";
import { refreshRuler } from "../ruler/ruler.js";
import { refreshReveals } from "../motion/reveals.js";

const SUPPORTED = ["en", "fr"];
const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "mkb-portfolio:lang";

/** `**bold**`, `*italic*` or `` `code` `` spans; the code form is matched whole
 * so a `*` inside backticks is never read as emphasis. */
const MARKER = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

let dictionaries = null;
let currentLanguage = DEFAULT_LANGUAGE;

/** Fetch one dictionary; `null` on any failure (file://, 404, bad JSON). */
async function loadDictionary(language) {
  try {
    const response = await fetch(new URL(`./${language}.json`, import.meta.url));
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/** Resolve a dotted path with array indices, e.g. `projects.items[0].bullets[1]`. */
function resolve(dictionary, path) {
  return path.split(/\.|\[(\d+)\]/).reduce((node, segment) => {
    if (segment === undefined || segment === "") return node;
    return node == null ? undefined : node[segment];
  }, dictionary);
}

/** Split a marker token into its element tag and its visible text. */
function markerPart(token) {
  if (token.startsWith("**")) return { tag: "strong", text: token.slice(2, -2) };
  if (token.startsWith("`")) return { tag: "code", text: token.slice(1, -1) };
  return { tag: "em", text: token.slice(1, -1) };
}

/** Build inline nodes from a marked-up string (no `innerHTML`). */
function renderRich(text) {
  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const match of text.matchAll(MARKER)) {
    if (match.index > cursor) {
      fragment.append(document.createTextNode(text.slice(cursor, match.index)));
    }

    const { tag, text: inner } = markerPart(match[0]);
    const element = document.createElement(tag);
    element.textContent = inner;
    fragment.append(element);

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    fragment.append(document.createTextNode(text.slice(cursor)));
  }
  return fragment;
}

/** Drop the inline markers, keeping the visible text (used by `-mode="text"`). */
function toPlain(text) {
  return text.replace(MARKER, (token) => markerPart(token).text);
}

/** Bind every `[data-i18n]` text and `[data-i18n-attr]` attribute under `root`. */
function bind(root, dictionary) {
  for (const element of root.querySelectorAll("[data-i18n]")) {
    const value = resolve(dictionary, element.getAttribute("data-i18n"));
    if (typeof value !== "string") continue;

    if (element.getAttribute("data-i18n-mode") === "text") {
      element.textContent = toPlain(value);
    } else {
      element.replaceChildren(renderRich(value));
    }
  }

  for (const element of root.querySelectorAll("[data-i18n-attr]")) {
    for (const pair of element.getAttribute("data-i18n-attr").split(",")) {
      const separator = pair.indexOf("=");
      if (separator === -1) continue;

      const attribute = pair.slice(0, separator).trim();
      const value = resolve(dictionary, pair.slice(separator + 1).trim());
      if (typeof value === "string") element.setAttribute(attribute, value);
    }
  }
}

/** Reflect the active language on the switch buttons (`aria-pressed`). */
function updateSwitch() {
  for (const button of document.querySelectorAll("[data-lang-switch] button[data-lang]")) {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-lang") === currentLanguage));
  }
}

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function persistLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Private mode or storage disabled: the choice simply does not persist.
  }
}

/** `fr*` -> FR, anything else -> EN (primary browser language only). */
function detectLanguage() {
  const preferred = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  return preferred.toLowerCase().startsWith("fr") ? "fr" : DEFAULT_LANGUAGE;
}

function applyLanguage(language, { persist }) {
  if (!SUPPORTED.includes(language)) return;

  currentLanguage = language;
  const dictionary = dictionaries && dictionaries[language];
  if (dictionary) bind(document, dictionary);

  document.documentElement.lang = language;
  updateSwitch();
  if (persist) persistLanguage(language);

  refreshTicker();
  refreshRuler();
  refreshReveals();
}

/** Switch language and remember the choice (called by the language switch). */
export function setLanguage(language) {
  applyLanguage(language, { persist: true });
}

/**
 * Load both dictionaries and apply the stored / detected language. Resolves even
 * when a dictionary fails to load, so the rest of the boot (reveals, ticker,
 * nav) still runs.
 */
export async function initI18n() {
  const [en, fr] = await Promise.all([loadDictionary("en"), loadDictionary("fr")]);
  dictionaries = { en, fr };

  applyLanguage(readStoredLanguage() || detectLanguage(), { persist: false });
}
