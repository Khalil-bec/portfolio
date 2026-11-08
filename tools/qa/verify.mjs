#!/usr/bin/env node
/**
 * Final verification gate (ticket 125).
 *
 * One command checks the shipped static site against the current acceptance
 * criteria: static audits, the runtime matrix, keyboard/reduced-motion/deep-link
 * flows, Lighthouse, and a screenshot sweep.
 *
 * It is dev-only tooling. The site keeps its no-build, no-runtime-dependency
 * contract; nothing under src/ imports anything from here.
 *
 *   npm run verify                 full gate (Lighthouse + screenshots)
 *   node tools/qa/verify.mjs --skip-lighthouse --skip-screenshots
 */

import { spawnSync } from "node:child_process";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";
import { runLighthouse, readScores } from "./lighthouse.mjs";
import { serve } from "./serve.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT = join(ROOT, "qa-out");
const args = new Set(process.argv.slice(2));
const SKIP_LH = args.has("--skip-lighthouse");
const SKIP_SHOTS = args.has("--skip-screenshots");

const results = [];
const add = (id, ok, detail = "") => {
  results.push({ id, ok, detail });
};

const read = (path) => readFile(join(ROOT, path), "utf8");

/* ---------------------------------------------------------------- static --- */

const norm = (value) =>
  String(value)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const normHtml = (value) =>
  String(value).replace(/\s+/g, " ").replace(/> </g, "><").trim();

const walkPaths = (value, path = "", out = []) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkPaths(item, `${path}[${index}]`, out));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkPaths(child, path ? `${path}.${key}` : key, out);
    }
  } else {
    out.push([path, value]);
  }
  return out;
};

const resolvePath = (root, path) => {
  let current = root;
  for (const segment of path.split(".")) {
    const array = segment.match(/^(\w+)\[(\d+)\]$/);
    current = array ? current?.[array[1]]?.[Number(array[2])] : current?.[segment];
  }
  return current;
};

// Copy keys that are deliberate UI additions, not in doc/content.md.
const sanctioned = new RegExp(
  "^(meta\\.|nav\\.|lang\\.|a11y\\.|ruler\\.|footer\\.(navigation|elsewhere|madeBy)$)" +
    "|Label$|^hero\\.(cta|role)$|^projects\\.items\\[\\d+\\]\\.alias$|^skills\\.all$",
);

async function staticAudits() {
  const en = JSON.parse(await read("src/i18n/en.json"));
  const fr = JSON.parse(await read("src/i18n/fr.json"));
  const content = await read("doc/content.md");
  const index = await read("index.html");
  const html = index;

  // Key parity: every leaf path exists in both dictionaries.
  const enPaths = new Set(walkPaths(en).map(([path]) => path));
  const frPaths = new Set(walkPaths(fr).map(([path]) => path));
  const onlyEn = [...enPaths].filter((path) => !frPaths.has(path));
  const onlyFr = [...frPaths].filter((path) => !enPaths.has(path));
  add(
    "i18n.parity",
    onlyEn.length === 0 && onlyFr.length === 0,
    `en=${enPaths.size} fr=${frPaths.size} onlyEn=${onlyEn.slice(0, 3)} onlyFr=${onlyFr.slice(0, 3)}`,
  );

  // Every string in either dictionary must still be verbatim source copy.
  const titleLine = content
    .split("\n")
    .findIndex((line, i) => i > 50 && line.startsWith("# Mohamed Khalil BECHEIKH"));
  const frContent = norm(content.split("\n").slice(0, titleLine).join("\n"));
  const enContent = norm(content.split("\n").slice(titleLine).join("\n"));
  const missingCopy = [];
  for (const [dict, corpus, language] of [
    [en, enContent, "en"],
    [fr, frContent, "fr"],
  ]) {
    for (const [path, value] of walkPaths(dict)) {
      if (typeof value !== "string" || sanctioned.test(path)) continue;
      if (!corpus.includes(norm(value))) missingCopy.push(`${language}:${path}`);
    }
  }
  add(
    "i18n.copy-traceable",
    missingCopy.length === 0,
    `${missingCopy.length} missing; ${missingCopy.slice(0, 5).join(", ")}`,
  );

  // The v1 tree's approved copy must survive every later migration.
  const gitShow = (path) => {
    const run = spawnSync("git", ["show", path], { cwd: ROOT, encoding: "utf8" });
    return run.status === 0 ? run.stdout : null;
  };
  const v1En = gitShow("c706140:src/i18n/en.json");
  const v1Fr = gitShow("c706140:src/i18n/fr.json");
  if (v1En && v1Fr) {
    const currentEn = new Set(walkPaths(en).filter(([, v]) => typeof v === "string").map(([, v]) => norm(v)));
    const currentFr = new Set(walkPaths(fr).filter(([, v]) => typeof v === "string").map(([, v]) => norm(v)));
    const lost = [];
    for (const [dict, current, language] of [
      [JSON.parse(v1En), currentEn, "en"],
      [JSON.parse(v1Fr), currentFr, "fr"],
    ]) {
      for (const [path, value] of walkPaths(dict)) {
        if (typeof value === "string" && !current.has(norm(value))) lost.push(`${language}:${path}`);
      }
    }
    add("i18n.v1-survival", lost.length === 0, `${lost.length} lost; ${lost.slice(0, 5).join(", ")}`);
  } else {
    // A check that cannot run must not report a pass: "not verified" is a
    // failure of the gate, not a green light (ticket 125's own rule).
    add("i18n.v1-survival", false, "v1 commit c706140 unavailable — copy survival NOT verified");
  }

  // Each section partial must match the hand-inlined copy in index.html.
  const sectionEntries = (await readdir(join(ROOT, "src/sections"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));
  const partials = [];
  for (const entry of sectionEntries) {
    const path = `src/sections/${entry.name}/${entry.name}.html`;
    const source = await readFile(join(ROOT, path), "utf8").catch(() => null);
    if (source !== null) partials.push({ name: entry.name, path, source });
  }
  const indexNorm = normHtml(index);
  const mismatched = partials
    .filter((partial) => !indexNorm.includes(normHtml(partial.source)))
    .map((partial) => partial.name);
  add("partials.in-sync", mismatched.length === 0, mismatched.join(", "));

  // Every key the HTML asks i18n to bind must exist in both dictionaries.
  // This is separate from the runtime string audit, which skips unknown keys.
  // A key bound with `data-i18n-mode="join"` is an array by design (the
  // ticker's skill list, ticket 118) and is resolved as one joined text node.
  const boundKeys = new Set();
  const joinedKeys = new Set();
  for (const source of [index, ...partials.map((partial) => partial.source)]) {
    for (const match of source.matchAll(/\bdata-i18n="([^"]+)"/g)) boundKeys.add(match[1]);
    for (const match of source.matchAll(
      /data-i18n="([^"]+)"[^<>]*data-i18n-mode="join"|data-i18n-mode="join"[^<>]*data-i18n="([^"]+)"/g,
    )) {
      joinedKeys.add(match[1] ?? match[2]);
    }
    for (const match of source.matchAll(/\bdata-i18n-attr="([^"]+)"/g)) {
      for (const pair of match[1].split(",")) {
        const key = pair.split("=")[1]?.trim();
        if (key) boundKeys.add(key);
      }
    }
  }
  const unresolved = [...boundKeys].filter((key) => {
    const enValue = resolvePath(en, key);
    const frValue = resolvePath(fr, key);
    return joinedKeys.has(key)
      ? !Array.isArray(enValue) || !Array.isArray(frValue)
      : typeof enValue !== "string" || typeof frValue !== "string";
  });
  add("i18n.keys-resolve", unresolved.length === 0, unresolved.slice(0, 5).join(", "));

  // One section = one directory with its html + css pair.
  const missingSectionFiles = [];
  for (const entry of sectionEntries) {
    for (const extension of ["html", "css"]) {
      try {
        await access(join(ROOT, `src/sections/${entry.name}/${entry.name}.${extension}`));
      } catch {
        missingSectionFiles.push(`${entry.name}.${extension}`);
      }
    }
  }
  add("sections.structure", missingSectionFiles.length === 0, missingSectionFiles.join(", "));

  // Design tokens are the only home for raw values.
  const cssFiles = [];
  const walkCss = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walkCss(path);
      else if (path.endsWith(".css")) cssFiles.push(path);
    }
  };
  await walkCss(join(ROOT, "src"));
  const literals = [];
  for (const file of cssFiles) {
    if (file.endsWith("tokens.css")) continue;
    // Breakpoints live in @media preludes, where CSS custom properties are
    // not allowed; they are not tokenizable values and are stripped before
    // the literal scan. Everything else must come from tokens.css.
    const css = (await readFile(file, "utf8"))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/@media[^{]+/g, "@media ");
    for (const match of css.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b\d+(?:\.\d+)?(?:px|rem|em)\b/g)) {
      literals.push(`${file.replace(ROOT, "")}:${match[0]}`);
    }
  }
  add("tokens.no-literals", literals.length === 0, literals.slice(0, 6).join(", "));

  // No visible copy outside the dictionaries. A bound element may carry a
  // *language-invariant* pre-boot fallback, but only the two documented keys;
  // anything else with static text is flagged instead of being skipped just
  // because it has data-i18n.
  const languageInvariantFallbacks = new Set(["hero.name", "meta.title"]);
  const copyOffenders = [];
  const htmlFiles = [
    "index.html",
    ...sectionEntries.map((entry) => `src/sections/${entry.name}/${entry.name}.html`),
  ];
  for (const file of htmlFiles) {
    const source = await readFile(join(ROOT, file), "utf8").catch(() => null);
    if (source === null) continue;
    const stripped = source
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    for (const match of stripped.matchAll(/<([a-z][\w-]*)([^>]*)>([^<]*[A-Za-z]{3,}[^<]*)<\/\1>/gi)) {
      const [, , attributes, text] = match;
      const value = text.trim();
      if (!value) continue;
      const key = attributes.match(/\bdata-i18n="([^"]+)"/)?.[1];
      if (key) {
        const enValue = resolvePath(en, key);
        const frValue = resolvePath(fr, key);
        const invariant =
          typeof enValue === "string" &&
          typeof frValue === "string" &&
          norm(enValue) === norm(frValue) &&
          norm(enValue) === norm(value);
        if (languageInvariantFallbacks.has(key) && invariant) continue;
        copyOffenders.push(`${file}: ${key} has static "${value.slice(0, 40)}"`);
        continue;
      }
      if (/^[\w.+-]+@[\w.-]+$/.test(value)) continue;
      if (/^(This portfolio needs JavaScript|Ce portfolio nécessite)/.test(value)) continue;
      copyOffenders.push(`${file}: ${value.slice(0, 50)}`);
    }
  }
  add("copy.no-hardcoded", copyOffenders.length === 0, copyOffenders.slice(0, 5).join(" | "));

  // Local references and content URLs.
  const refs = [...html.matchAll(/(?:href|src)="([^"#:]+?)"/g)]
    .map((match) => match[1])
    .filter((ref) => !/^(https?:|mailto:|\/\/)/.test(ref));
  const missingRefs = [];
  for (const ref of new Set(refs)) {
    try {
      await access(resolve(ROOT, ref));
    } catch {
      missingRefs.push(ref);
    }
  }
  const contentUrls = [...new Set([...content.matchAll(/https?:\/\/[^\s)]+/g)].map((match) => match[0]))];
  const missingUrls = contentUrls.filter((url) => !html.includes(url));
  add("assets.references", missingRefs.length === 0, missingRefs.join(", "));
  add("links.content-urls", missingUrls.length === 0, missingUrls.join(", "));

  const external = [...html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]+"[^>]*>/g)].map((match) => match[0]);
  const unsafe = external.filter(
    (anchor) => !anchor.includes('target="_blank"') || !/rel="[^"]*noopener/.test(anchor),
  );
  add("links.external-safe", unsafe.length === 0, unsafe.slice(0, 3).join(" | "));
  add("links.mailto", /href="mailto:[^"]+"/.test(html));

  // The delivered page loads only repo-local scripts/styles (vendor is the
  // sanctioned library home); the QA tooling must never leak into the site.
  const scriptSources = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
  const badScripts = scriptSources.filter((src) => !/^(src|vendor)\//.test(src));
  const remoteAssets = [
    ...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="((?:https?:)?\/\/[^"]+)"/g),
  ].map((match) => match[1]);

  // Ticket 126 moved the vendor scripts off the document: main.js injects them
  // after the first paint, so the static scan above cannot see them. Check the
  // injected paths too — they must be repo-local files under vendor/.
  const mainSource = await readFile(join(ROOT, "src/main.js"), "utf8");
  const injected = [...mainSource.matchAll(/loadScript\("([^"]+)"\)/g)].map((match) => match[1]);
  const badInjected = [];
  for (const src of injected) {
    if (!/^vendor\//.test(src)) {
      badInjected.push(`${src} (not under vendor/)`);
      continue;
    }
    try {
      await access(resolve(ROOT, src));
    } catch {
      badInjected.push(`${src} (missing)`);
    }
  }

  // Nothing under src/ may import the QA tooling or a node_modules package:
  // the site ships no runtime dependency (ticket 125's contract).
  const srcFiles = [];
  async function collectSources(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await collectSources(path);
      else if (entry.name.endsWith(".js")) srcFiles.push(path);
    }
  }
  await collectSources(join(ROOT, "src"));
  const leaks = [];
  for (const file of srcFiles) {
    const source = await readFile(file, "utf8");
    if (/(?:from|import)\s*\(?\s*["'][^"']*(?:tools\/|node_modules|playwright|lighthouse)/.test(source)) {
      leaks.push(file.replace(ROOT, ""));
    }
  }

  add(
    "architecture.local-assets",
    badScripts.length === 0 &&
      remoteAssets.length === 0 &&
      badInjected.length === 0 &&
      injected.length > 0 &&
      leaks.length === 0,
    [...badScripts, ...remoteAssets, ...badInjected, ...leaks].slice(0, 3).join(", "),
  );
}

/* --------------------------------------------------------------- runtime --- */

const dicts = {
  en: JSON.parse(await read("src/i18n/en.json")),
  fr: JSON.parse(await read("src/i18n/fr.json")),
};

let browser;
let base;

async function openPage({
  width = 1440,
  height = 900,
  locale = "en-US",
  reducedMotion = false,
  javaScriptEnabled = true,
  hash = "",
  device = null,
} = {}) {
  // Ticket 131: a named Playwright device brings what a resized desktop
  // viewport lacks (isMobile, hasTouch, the phone's DPR and user agent). Its
  // browser hint is dropped — the harness drives Chromium only.
  const { defaultBrowserType: _browserHint, ...profile } = device ? devices[device] : {};
  const context = await browser.newContext({
    viewport: { width, height },
    ...profile,
    locale,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    javaScriptEnabled,
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const requests = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(base + hash, { waitUntil: "load" });
  return { context, page, pageErrors, consoleErrors, requests };
}

async function settle(page, tag = "page") {
  const settled = await page
    .waitForFunction(
      () => {
        const name = document.querySelector(".hero__name");
        const tagline = document.querySelector(".hero__tagline");
        if (!name || !tagline) return false;
        if (name.classList.contains("is-pending")) return false;
        if (Number(getComputedStyle(tagline).opacity) < 0.99) return false;
        if (document.querySelector(".intro")) return false;
        return true;
      },
      null,
      { timeout: 6000 },
    )
    .then(() => true)
    .catch(() => false);
  add(`settle.${tag}`, settled, settled ? "" : "timed out after 6s");
  await page.waitForTimeout(200);
}

async function auditStrings(page, dict) {
  return page.evaluate((dictionary) => {
    const plain = (value) =>
      String(value)
        .replace(/\*\*|\*|`/g, "")
        .replace(/\s+/g, " ")
        .trim();
    const resolve = (root, path) => {
      let current = root;
      for (const segment of path.split(".")) {
        const array = segment.match(/^(\w+)\[(\d+)\]$/);
        current = array ? current?.[array[1]]?.[Number(array[2])] : current?.[segment];
      }
      return current;
    };
    const bad = [];
    for (const element of document.querySelectorAll("[data-i18n]")) {
      const key = element.getAttribute("data-i18n");
      const value = resolve(dictionary, key);
      if (typeof value !== "string") continue;
      if (plain(element.textContent) !== plain(value)) bad.push(key);
    }
    for (const element of document.querySelectorAll("[data-i18n-attr]")) {
      for (const pair of element.getAttribute("data-i18n-attr").split(",")) {
        const [attribute, key] = pair.split("=").map((part) => part.trim());
        const value = resolve(dictionary, key);
        if (typeof value === "string" && element.getAttribute(attribute) !== value) {
          bad.push(`${attribute}:${key}`);
        }
      }
    }
    return bad;
  }, dict);
}

async function runtimeAudits() {
  const configs = [
    { tag: "1440-en", width: 1440, height: 900, locale: "en-US" },
    { tag: "1024-en", width: 1024, height: 900, locale: "en-US" },
    { tag: "768-en", width: 768, height: 900, locale: "en-US" },
    { tag: "375-en", width: 375, height: 812, locale: "en-US" },
    { tag: "1440-fr", width: 1440, height: 900, locale: "fr-FR" },
    { tag: "1024-fr", width: 1024, height: 900, locale: "fr-FR" },
    { tag: "768-fr", width: 768, height: 900, locale: "fr-FR" },
    { tag: "375-fr", width: 375, height: 812, locale: "fr-FR" },
  ];

  for (const config of configs) {
    const language = config.locale.startsWith("fr") ? "fr" : "en";
    const session = await openPage(config);
    const { page } = session;

    // Sample the pre-settle gate: the intro must never run at phone/tablet width.
    await page.waitForTimeout(260);
    const gate = await page.evaluate(() => {
      const name = document.querySelector(".hero__name");
      const tagline = document.querySelector(".hero__tagline");
      return {
        flag: document.documentElement.getAttribute("data-intro"),
        overlay: Boolean(document.querySelector(".intro")),
        pending: name?.classList.contains("is-pending") ?? false,
        taglineOpacity: Number(getComputedStyle(tagline).opacity),
      };
    });
    if (config.width <= 768) {
      add(
        `intro.absent-${config.tag}`,
        gate.flag === null && !gate.overlay && !gate.pending && gate.taglineOpacity > 0.99,
        JSON.stringify(gate),
      );
    } else {
      add(
        `intro.present-${config.tag}`,
        gate.flag === "run" || gate.overlay,
        JSON.stringify(gate),
      );
    }

    await settle(page);

    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      overflow: document.documentElement.scrollWidth - innerWidth,
      stored: Object.keys(localStorage),
      sections: [...document.querySelectorAll("main > section, body > footer")].map((node) => node.id),
      name: document.querySelector(".hero__name")?.textContent.trim(),
      tickerText: document.querySelector("[data-ticker-source]")?.textContent.trim(),
      slots: [...document.querySelectorAll(".project__slot")].map((slot) => {
        const rect = slot.getBoundingClientRect();
        return [Math.round(rect.width), Math.round(rect.height)];
      }),
      favicon: Boolean(document.querySelector('link[rel="icon"]')),
      og: Boolean(document.querySelector('meta[property="og:image"]')),
      intro: Boolean(document.querySelector(".intro")),
    }));

    add(
      `sections.${config.tag}`,
      JSON.stringify(state.sections) ===
        JSON.stringify(["hero", "about", "projects", "skills", "education", "contact", "footer"]),
      state.sections.join(","),
    );
    add(`overflow.${config.tag}`, state.overflow <= 1, `overflow=${state.overflow}px`);
    add(
      `errors.${config.tag}`,
      session.pageErrors.length === 0 && session.consoleErrors.length === 0,
      [...session.pageErrors, ...session.consoleErrors].slice(0, 2).join(" | "),
    );
    add(
      `requests.${config.tag}`,
      session.requests.every((url) => url.startsWith(base)),
      session.requests.filter((url) => !url.startsWith(base)).slice(0, 3).join(","),
    );
    add(`lang.${config.tag}`, state.lang === language, state.lang);
    const mismatches = await auditStrings(page, dicts[language]);
    add(`strings.${config.tag}`, mismatches.length === 0, mismatches.slice(0, 4).join(", "));
    add(`intro.settled-${config.tag}`, !state.intro && Boolean(state.name) && state.name.length > 0);
    add(`slots.${config.tag}`, state.slots.length === 3 && state.slots.every(([w, h]) => w > 0 && h > 0 && Math.abs(w / h - 1.6) < 0.03), JSON.stringify(state.slots));
    add(`favicon-og.${config.tag}`, state.favicon && state.og);
    if (language === "en") {
      add(`storage.default-${config.tag}`, state.stored.length === 0, JSON.stringify(state.stored));
    }

    if (config.width === 1440 && language === "en") {
      const names = await page.evaluate(() => {
        const rows = [...document.querySelectorAll("[data-name]")]
          .map((anchor) => {
            const rect = anchor.getBoundingClientRect();
            return { href: anchor.getAttribute("href"), top: rect.top, bottom: rect.bottom, height: rect.height };
          })
          .filter((row) => row.height > 0)
          .sort((a, b) => a.top - b.top);
        let minGap = Infinity;
        for (let i = 1; i < rows.length; i += 1) {
          minGap = Math.min(minGap, rows[i].top - rows[i - 1].bottom);
        }
        return { rows, minGap };
      });
      add("names.count", names.rows.length === 5, String(names.rows.length));
      add(
        "names.target-size",
        names.minGap >= -0.5 && names.rows.every((row) => row.height >= 23.5),
        `minGap=${names.minGap.toFixed(1)} heights=${names.rows.map((row) => Math.round(row.height)).join("/")}`,
      );


      const projects = await page.evaluate(() => ({
        cards: document.querySelectorAll(".project").length,
        bullets: [...document.querySelectorAll(".project")].map(
          (card) => card.querySelectorAll("li").length,
        ),
        visible: [...document.querySelectorAll(".project li")].every((item) => {
          const style = getComputedStyle(item);
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
        }),
        links: [...document.querySelectorAll(".project__link")].map((anchor) => [
          anchor.getAttribute("target"),
          anchor.getAttribute("rel"),
        ]),
      }));
      add("projects.cards", projects.cards === 3, String(projects.cards));
      add(
        "projects.bullets",
        JSON.stringify(projects.bullets) === JSON.stringify([4, 5, 6]) && projects.visible,
        JSON.stringify(projects.bullets),
      );
      add(
        "projects.links",
        projects.links.every(([target, rel]) => target === "_blank" && rel.includes("noopener")),
        JSON.stringify(projects.links),
      );

      // Live switch + persistence.
      await page.click('[data-lang="fr"]');
      await page.waitForTimeout(600);
      const switched = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        stored: localStorage.getItem("mkb-portfolio:lang"),
        keys: Object.keys(localStorage),
        pressed: [...document.querySelectorAll("[data-lang]")].map((button) => [
          button.dataset.lang,
          button.getAttribute("aria-pressed"),
        ]),
      }));
      add("switch.lang", switched.lang === "fr", switched.lang);
      add("switch.storage", switched.stored === "fr" && JSON.stringify(switched.keys) === JSON.stringify(["mkb-portfolio:lang"]), JSON.stringify(switched));
      add("switch.pressed", JSON.stringify(switched.pressed) === JSON.stringify([["en", "false"], ["fr", "true"]]), JSON.stringify(switched.pressed));
      const switchedStrings = await auditStrings(page, dicts.fr);
      add("switch.strings", switchedStrings.length === 0, switchedStrings.slice(0, 4).join(", "));
      await page.reload({ waitUntil: "load" });
      await settle(page, "switch-reload");
      add("switch.persists", (await page.evaluate(() => document.documentElement.lang)) === "fr");

      // Contact flip at max scroll.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(900);
      const flip = await page.evaluate(() => ({
        current: [...document.querySelectorAll("[data-name].is-current")].map((row) => row.getAttribute("href")),
        footerVisible: document.getElementById("footer").getBoundingClientRect().top < innerHeight,
        atMax: Math.abs(scrollY - (document.documentElement.scrollHeight - innerHeight)) < 2,
      }));
      add("flip.contact", JSON.stringify(flip.current) === JSON.stringify(["#contact"]) && flip.footerVisible && flip.atMax, JSON.stringify(flip));
    }

    await session.context.close();
  }

  // The names layer's current title must name the section the page has
  // REACHED (ticket 130): the last section in document order whose top has
  // entered the viewport (`top ≤ scrollY + vh`) — the title changes the
  // moment the section is discovered at the bottom edge, not when it takes
  // over the screen. Measured on the inspiration (getartcraft.com, 1440×900):
  // its incoming word's flight spawns 20–86 px after the section's top
  // crosses the viewport's bottom edge — the new section fills 2–10 % of the
  // screen at the handover, never the middle and never later.
  // The expected value encodes the documented rule — the point of the check
  // is that the RULE HOLDS AT EVERY SAMPLED DEPTH, including the ones where
  // 114's fixed 0.25·vh trigger and 129's occupancy rule named the previous
  // section. The one documented exception is the hero: it has no row of its
  // own (119 dropped it), so before the first named section is reached the
  // FIRST row stands in — what the `expected === null` branch below asserts,
  // sampled at depth 0.
  // Runs at every width that mounts the layer, in both languages: the band
  // heights differ per language, so a rule that only holds in EN is a bug.
  for (const config of configs.filter((item) => item.width > 768)) {
    const session = await openPage({
      width: config.width,
      height: config.height,
      locale: config.locale,
    });
    const { page } = session;
    await settle(page, `names-${config.tag}`);
    const result = await page.evaluate(async () => {
      const rows = [...document.querySelectorAll("[data-name]")];
      const bands = rows.map((row) => {
        const section = document.getElementById(row.getAttribute("href").slice(1));
        if (!section) return null;
        const rect = section.getBoundingClientRect();
        return {
          href: row.getAttribute("href"),
          top: Math.round(rect.top + window.scrollY),
          bottom: Math.round(rect.bottom + window.scrollY),
        };
      });
      const frame = () =>
        new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
      const settleScroll = async (target) => {
        window.scrollTo(0, target);
        let last = -1;
        for (let i = 0; i < 60; i += 1) {
          await frame();
          if (window.scrollY === last) break;
          last = window.scrollY;
        }
        return window.scrollY;
      };
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const vh = window.innerHeight;
      // Four depths per section: the flip boundary itself (the section's top
      // crossing the viewport's bottom edge — the exact pixel the rule turns
      // on), the pixel before it (the previous section still current), the
      // section centred in the viewport, and the section fully in view (its
      // bottom on the viewport's bottom edge) — the depth at which 114's
      // trigger and 129's occupancy rule named the PREVIOUS section for the
      // short end sections.
      const positions = [];
      for (const band of bands) {
        if (!band) continue;
        const entry = band.top - vh;
        positions.push({ href: band.href, y: entry });
        positions.push({ href: band.href, y: entry - 1 });
        positions.push({ href: band.href, y: Math.round((band.top + band.bottom) / 2 - vh / 2) });
        positions.push({ href: band.href, y: Math.round(band.bottom - vh) });
      }
      const last = bands.filter(Boolean).at(-1);
      if (last) positions.push({ href: last.href, y: max });
      // Depth 0: the hero, where no named section has been reached yet. The
      // first row stands in (the layer's behaviour since 114) — the one
      // documented exception to "the current title names a section you have
      // reached".
      positions.push({ href: "hero", y: 0 });
      const mismatches = [];
      const unreached = [];
      for (const position of positions) {
        const y = await settleScroll(Math.max(0, Math.min(position.y, max)));
        // The documented rule, re-implemented here from its wording: the last
        // section whose top has entered the viewport.
        let reached = null;
        for (const band of bands) {
          if (!band) continue;
          if (band.top <= y + vh) reached = band.href;
        }
        // Nothing reached yet (the hero, which has no row since 119): the
        // first row stays current, as it did under 114's trigger.
        const expected = reached ?? bands.find(Boolean)?.href ?? null;
        const actual =
          document.querySelector(".names__row.is-current")?.getAttribute("href") ?? null;
        if (actual !== expected) {
          mismatches.push(`${position.href}@${y} got=${actual} want=${expected}`);
        }
        // The title must never name a section the page has not reached yet.
        // The hero's first-row fallback is the documented exception — before
        // any section is reached, the first row stands in by design.
        if (reached !== null) {
          const index = bands.findIndex((band) => band?.href === actual);
          const band = index >= 0 ? bands[index] : null;
          if (band && band.top > y + vh) unreached.push(`${actual}@${y}`);
        }
      }
      return { mismatches, unreached };
    });
    add(
      `names.current-section-${config.tag}`,
      result.mismatches.length === 0,
      result.mismatches.join("; "),
    );
    add(
      `names.current-reached-${config.tag}`,
      result.unreached.length === 0,
      result.unreached.join("; "),
    );
    await session.context.close();
  }

  // Cold deep link: focus lands silently on the target.
  {
    const session = await openPage({ hash: "#contact" });
    await settle(session.page, "deep-link");
    const deep = await session.page.evaluate(() => ({
      active: document.activeElement?.id,
      silent: document.getElementById("contact")?.classList.contains("is-silent-landing"),
    }));
    add("deep-link.focus", deep.active === "contact" && deep.silent === true, JSON.stringify(deep));
    await session.context.close();
  }

  // Reduced motion: no intro, no hidden reveals, static ticker, instant jump.
  {
    const session = await openPage({ reducedMotion: true });
    const { page } = session;
    await page.waitForTimeout(1200);
    const reduced = await page.evaluate(() => ({
      intro: Boolean(document.querySelector(".intro")),
      flag: document.documentElement.getAttribute("data-intro"),
      hidden: [...document.querySelectorAll("[data-reveal]")].filter(
        (element) => Number(getComputedStyle(element).opacity) < 1,
      ).length,
      tickerLive: document.querySelector("[data-ticker]")?.classList.contains("ticker--live"),
      tickerTransform: getComputedStyle(document.querySelector(".ticker__track")).transform,
      orbit: getComputedStyle(document.querySelector(".hero__orbit")).transform,
      tickerText: document.querySelector("[data-ticker-source]")?.textContent.trim().length,
    }));
    add("reduced.no-intro", !reduced.intro && reduced.flag === null, JSON.stringify(reduced));
    add("reduced.readable", reduced.hidden === 0, String(reduced.hidden));
    add(
      "reduced.static-ticker",
      !reduced.tickerLive && (reduced.tickerTransform === "none" || reduced.tickerTransform === "matrix(1, 0, 0, 1, 0, 0)") && reduced.tickerText > 0,
      JSON.stringify(reduced),
    );
    add("reduced.no-orbit", reduced.orbit === "none" || reduced.orbit === "matrix(1, 0, 0, 1, 0, 0)", reduced.orbit);
    const before = await page.evaluate(() => scrollY);
    await page.click('.nav__link[href="#contact"]');
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => ({
      y: Math.round(scrollY),
      top: Math.round(document.getElementById("contact").getBoundingClientRect().top),
    }));
    add("reduced.instant-jump", after.y > before + 100 && after.top < 900, JSON.stringify(after));
    add("reduced.errors", session.pageErrors.length === 0, session.pageErrors[0] ?? "");
    await session.context.close();
  }

  // Keyboard: every focusable is reachable and every stop paints a ring.
  {
    const session = await openPage();
    const { page } = session;
    await settle(page);
    const total = await page.evaluate(() => {
      // Rendered controls only: 132's menu button is display:none above 768.
      const nodes = [...document.querySelectorAll('a[href], button, [tabindex="0"]')].filter(
        (node) => node.checkVisibility(),
      );
      nodes.forEach((node, index) => node.setAttribute("data-qa-focus", String(index)));
      return nodes.length;
    });
    const reached = new Set();
    const noRing = [];
    for (let i = 0; i < total + 12; i += 1) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element) return null;
        const style = getComputedStyle(element);
        return {
          index: element.getAttribute?.("data-qa-focus"),
          ring: style.outlineStyle !== "none" || style.outlineWidth !== "0px" || style.boxShadow !== "none",
        };
      });
      if (!focused?.index) continue;
      reached.add(focused.index);
      if (!focused.ring) noRing.push(focused.index);
    }
    add("keyboard.reachable", reached.size === total, `${reached.size}/${total}`);
    add("keyboard.rings", noRing.length === 0, `missing on ${noRing.join(",")}`);
    add("keyboard.errors", session.pageErrors.length === 0, session.pageErrors[0] ?? "");
    await session.context.close();
  }

  // Vendor failure: the page still paints and stays usable.
  {
    const session = await openPage();
    await session.context.route("**/vendor/**", (route) => route.abort());
    const { page } = session;
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => ({
      name: document.querySelector(".hero__name")?.textContent.trim().length,
      hidden: [...document.querySelectorAll("[data-reveal]")].filter(
        (element) => Number(getComputedStyle(element).opacity) < 1,
      ).length,
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    add("vendor-fail.paints", state.name > 0 && state.hidden === 0 && state.overflow <= 1, JSON.stringify(state));
    add("vendor-fail.errors", session.pageErrors.length === 0, session.pageErrors[0] ?? "");
    await session.context.close();
  }

  // No-JS: the notice renders.
  {
    const session = await openPage({ javaScriptEnabled: false });
    const notice = await session.page.evaluate(() => {
      const element = document.querySelector(".noscript-notice");
      return { display: getComputedStyle(element).display, text: element.textContent.trim().length };
    });
    add("no-js.notice", notice.display !== "none" && notice.text > 0, JSON.stringify(notice));
    await session.context.close();
  }

  // Motion: marquee advances, anchored scroll is eased and settles.
  {
    const session = await openPage();
    const { page } = session;
    await settle(page);
    const first = await page.evaluate(() => getComputedStyle(document.querySelector(".ticker__track")).transform);
    await page.waitForTimeout(700);
    const second = await page.evaluate(() => getComputedStyle(document.querySelector(".ticker__track")).transform);
    add("motion.ticker", first !== second, `${first} -> ${second}`);
    await page.click('.nav__link[href="#projects"]');
    const samples = [];
    for (let i = 0; i < 8; i += 1) {
      await page.waitForTimeout(60);
      samples.push(await page.evaluate(() => Math.round(scrollY)));
    }
    add("motion.eased", new Set(samples).size >= 3, samples.join(","));
    await page.waitForTimeout(900);
    const top = await page.evaluate(() => Math.round(document.getElementById("projects").getBoundingClientRect().top));
    add("motion.settles", Math.abs(top) <= 80, `top=${top}`);
    await session.context.close();
  }
}

/* --------------------------------------------------------------- nav --- */

/**
 * Ticket 132 (replaces 126's reservation check): at ≤768 the bar is one row —
 * mark, menu button, EN/FR — so its height is a single constant across the
 * dictionary bind, at every narrow width, in both languages. The dictionaries
 * are held so the pre-bind layout can be read, then released and the same
 * widths read again. The widths keep 126's measured wrap boundaries (where the
 * old list changed row count) plus 768.
 */
async function navOneRowAudits() {
  const widths = [320, 358, 359, 375, 376, 390, 392, 393, 430, 529, 530, 564, 565, 768];

  for (const language of ["en", "fr"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: language === "fr" ? "fr-FR" : "en-US",
    });
    const page = await context.newPage();
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/src/i18n/*.json", async (route) => {
      await held;
      await route.continue();
    });

    await page.goto(base, { waitUntil: "domcontentloaded" });
    const barHeight = () =>
      page.evaluate(() => {
        const bar = document.querySelector(".nav");
        return bar ? Math.round(bar.getBoundingClientRect().height) : -1;
      });

    const heights = [];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(60);
      heights.push([width, "before", await barHeight()]);
    }

    release();
    await settle(page, `nav-${language}`);

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(60);
      heights.push([width, "after", await barHeight()]);
    }
    // The hero subtracts --eyebrow-top from its min-height, so a pre-measure
    // fallback that differs from the bar resizes it (and moves its rings)
    // when eyebrows.js lands — the 132 CLS finding. Same widths, both phases.
    const heroHeight = () =>
      page.evaluate(() => Math.round(document.getElementById("hero").getBoundingClientRect().height));
    const heroDrift = [];
    for (const width of [375, 412]) {
      await page.setViewportSize({ width, height: 823 });
      await page.waitForTimeout(60);
      const settled = await heroHeight();
      const measured = await page.evaluate(() => {
        const root = document.documentElement;
        const value = root.style.getPropertyValue("--eyebrow-top");
        root.style.removeProperty("--eyebrow-top");
        return value;
      });
      await page.waitForTimeout(60);
      const fallback = await heroHeight();
      await page.evaluate((value) => document.documentElement.style.setProperty("--eyebrow-top", value), measured);
      if (!measured) heroDrift.push(`${width}px: no measured --eyebrow-top`);
      else if (fallback !== settled) heroDrift.push(`${width}px: ${fallback}->${settled}`);
    }
    add(`hero.fallback-height-${language}`, heroDrift.length === 0, heroDrift.join(" | "));
    const values = new Set(heights.map(([, , height]) => height));
    add(
      `nav.one-row-${language}`,
      values.size === 1,
      values.size === 1
        ? `${[...values][0]}px at every width, before and after the bind`
        : heights.map(([width, phase, height]) => `${width}${phase[0]}:${height}`).join(" "),
    );
    await context.close();
  }
}

/**
 * Ticket 132: the narrow menu's behaviour (375, a phone profile) and the
 * desktop bar it must leave alone.
 */
async function navMenuAudits() {
  for (const language of ["en", "fr"]) {
    const session = await openPage({
      device: "iPhone 13",
      locale: language === "fr" ? "fr-FR" : "en-US",
    });
    const { page } = session;
    await settle(page, `menu-${language}`);
    const want = dicts[language].nav;

    const state = () =>
      page.evaluate(() => {
        const list = document.getElementById("nav-list");
        const button = document.querySelector(".nav__menu");
        const nav = document.querySelector(".nav").getBoundingClientRect();
        const panel = list.getBoundingClientRect();
        const label = [...button.querySelectorAll(".nav__menu-label")].find(
          (span) => getComputedStyle(span).display !== "none",
        );
        return {
          open: list.matches(":popover-open"),
          expanded: button.getAttribute("aria-expanded"),
          label: label?.textContent.trim() ?? "",
          buttonShown: getComputedStyle(button).display !== "none",
          focusOnButton: document.activeElement === button,
          navBottom: Math.round(nav.bottom),
          panelTop: Math.round(panel.top),
          panelWidth: Math.round(panel.width),
          rows: [...list.querySelectorAll(".nav__link")].map((link) =>
            Math.round(link.getBoundingClientRect().height),
          ),
          viewWidth: innerWidth,
        };
      });

    const closed = await state();
    add(
      `nav.menu-closed-${language}`,
      !closed.open && closed.buttonShown && closed.expanded === "false" && closed.label === want.menu,
      JSON.stringify({ open: closed.open, expanded: closed.expanded, label: closed.label }),
    );

    await page.click(".nav__menu");
    await page.waitForTimeout(100);
    const opened = await state();
    add(
      `nav.menu-open-${language}`,
      opened.open &&
        opened.expanded === "true" &&
        opened.label === want.menuClose &&
        Math.abs(opened.panelTop - opened.navBottom) <= 1 &&
        opened.panelWidth === opened.viewWidth &&
        opened.rows.length === 4 &&
        opened.rows.every((height) => height >= 44),
      JSON.stringify({ ...opened, focusOnButton: undefined }),
    );

    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
    const escaped = await state();
    add(
      `nav.menu-esc-${language}`,
      !escaped.open && escaped.expanded === "false" && escaped.focusOnButton,
      JSON.stringify({ open: escaped.open, expanded: escaped.expanded, focus: escaped.focusOnButton }),
    );

    if (language === "en") {
      // Outside tap closes (light dismiss).
      await page.click(".nav__menu");
      await page.waitForTimeout(100);
      await page.mouse.click(20, 600);
      await page.waitForTimeout(100);
      add("nav.menu-outside", !(await state()).open);

      // A chosen link closes the panel and the jump still lands.
      await page.click(".nav__menu");
      await page.waitForTimeout(100);
      await page.click('.nav__link[href="#skills"]');
      await page.waitForTimeout(1600);
      const landed = await page.evaluate(() => ({
        open: document.getElementById("nav-list").matches(":popover-open"),
        top: Math.round(document.getElementById("skills").getBoundingClientRect().top),
      }));
      add("nav.menu-link", !landed.open && Math.abs(landed.top) <= 80, JSON.stringify(landed));

      // Keyboard: Tab reaches the button, Enter opens, Tab enters the panel,
      // Escape closes with focus back on the button.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => document.querySelector(".nav__brand").focus());
      await page.keyboard.press("Tab");
      const onButton = await page.evaluate(() => document.activeElement?.classList.contains("nav__menu"));
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      await page.keyboard.press("Tab");
      const inPanel = await page.evaluate(() => Boolean(document.activeElement?.closest("#nav-list")));
      await page.keyboard.press("Escape");
      await page.waitForTimeout(100);
      const back = await state();
      add(
        "nav.menu-keyboard",
        onButton && inPanel && !back.open && back.focusOnButton,
        JSON.stringify({ onButton, inPanel, open: back.open, focus: back.focusOnButton }),
      );

      // Widening past 768 closes the panel and restores the desktop bar.
      await page.click(".nav__menu");
      await page.waitForTimeout(100);
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.waitForTimeout(150);
      const wide = await page.evaluate(() => {
        const list = document.getElementById("nav-list");
        return {
          open: list.matches(":popover-open"),
          listDisplay: getComputedStyle(list).display,
          button: getComputedStyle(document.querySelector(".nav__menu")).display,
        };
      });
      add(
        "nav.menu-resize",
        !wide.open && wide.listDisplay === "flex" && wide.button === "none",
        JSON.stringify(wide),
      );
    }

    add(`nav.menu-errors-${language}`, session.pageErrors.length === 0, session.pageErrors[0] ?? "");
    await session.context.close();
  }

  // The desktop bar is untouched: links inline in one row, no button.
  for (const width of [769, 1024, 1440]) {
    const session = await openPage({ width, height: 900 });
    await settle(session.page, `nav-desktop-${width}`);
    const bar = await session.page.evaluate(() => {
      const links = [...document.querySelectorAll(".nav__link")].map((link) => link.getBoundingClientRect());
      return {
        button: getComputedStyle(document.querySelector(".nav__menu")).display,
        list: getComputedStyle(document.getElementById("nav-list")).display,
        rows: new Set(links.map((rect) => Math.round(rect.top))).size,
        visible: links.every((rect) => rect.width > 0 && rect.height > 0),
      };
    });
    add(
      `nav.desktop-${width}`,
      bar.button === "none" && bar.list === "flex" && bar.rows === 1 && bar.visible,
      JSON.stringify(bar),
    );
    await session.context.close();
  }
}

/**
 * Ticket 131: the hero chips' narrow ceiling. Every chip's layout size
 * (offsetWidth — the orbit's rotation never changes it) must sit at or under
 * the live `--chip-size-cap`, the narrow cap must be the 131 value rather than
 * the desktop 22vw, and the page must never scroll sideways. Chips crossing
 * the hero's own edge are by design (kubernetes/python do at 1440 too), so
 * the edge rule is the document's, not the hero's. 769 and 1440 pin the
 * desktop cap.
 */
async function heroChipAudits() {
  const NARROW_CAP = 0.14;
  const DESKTOP_CAP = 0.22;
  // 768/769 pin the boundary: the narrow block's cap ends exactly at 768.
  for (const [width, ratio] of [
    [375, NARROW_CAP], [390, NARROW_CAP], [430, NARROW_CAP],
    [768, NARROW_CAP], [769, DESKTOP_CAP], [1440, DESKTOP_CAP],
  ]) {
    const session = await openPage({ width, height: 812 });
    await settle(session.page, `chips-${width}`);
    const state = await session.page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.inlineSize = "var(--chip-size-cap)";
      document.body.append(probe);
      const cap = probe.getBoundingClientRect().width;
      probe.remove();
      return {
        cap,
        chips: [...document.querySelectorAll(".hero__chip")].map((chip) => [chip.dataset.chip, chip.offsetWidth]),
        docWidth: document.documentElement.scrollWidth,
        viewWidth: window.innerWidth,
      };
    });
    const expected = width * ratio;
    const over = state.chips.filter(([, size]) => size > state.cap + 0.5);
    add(
      `hero.chip-cap-${width}`,
      Math.abs(state.cap - expected) <= 0.5 && state.chips.length === 13 && over.length === 0,
      `cap ${state.cap.toFixed(1)}px (want ${expected.toFixed(1)}), ${state.chips.length} chips` +
        (over.length ? `, over: ${over.map(([name, size]) => `${name}=${size}`).join(" ")}` : ""),
    );
    add(
      `hero.no-overflow-${width}`,
      state.docWidth <= state.viewWidth,
      `scrollWidth ${state.docWidth} vs ${state.viewWidth}`,
    );
    await session.context.close();
  }
}

/**
 * Ticket 133: the narrow names label. At 375 and 390 (phone profile), EN and
 * FR, the label must name exactly the section the page has reached — the
 * documented rule re-implemented here from its wording (the last section
 * whose top has entered the viewport), with NO stand-in on the hero: before
 * any section is reached the label is empty. Checked at each boundary pixel
 * and the pixel before it. It must sit in the ruler lane, below the nav.
 * Then the media swap: resizing across 768 leaves exactly one names surface
 * rendered, both ways.
 */
async function namesNarrowAudits() {
  // Its sheet stays off the critical path (133's FCP finding): index.html
  // must not link it; name.js inserts it after first paint.
  const index = await read("index.html");
  add(
    "names.narrow-sheet-deferred",
    !/<link[^>]+name-narrow\.css/.test(index) && /data-names-narrow[^>]*\bhidden\b/.test(index),
    "name-narrow.css must not be a render-blocking <link>; the label ships hidden",
  );

  for (const width of [375, 390]) {
    for (const locale of ["en-US", "fr-FR"]) {
      const tag = `${width}-${locale.slice(0, 2)}`;
      const session = await openPage({ device: "iPhone 13", locale });
      const { page } = session;
      await page.setViewportSize({ width, height: 664 });
      await settle(page, `names-narrow-${tag}`);
      const result = await page.evaluate(async () => {
        const rows = [...document.querySelectorAll("[data-name]")];
        const bands = rows.map((row) => {
          const section = document.getElementById(row.getAttribute("href").slice(1));
          if (!section) return null;
          return {
            word: row.getAttribute("aria-label"),
            top: Math.round(section.getBoundingClientRect().top + window.scrollY),
          };
        });
        const frame = () =>
          new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
        const settleScroll = async (target) => {
          window.scrollTo(0, target);
          let last = -1;
          for (let i = 0; i < 60; i += 1) {
            await frame();
            if (window.scrollY === last) break;
            last = window.scrollY;
          }
          // Past the whole cross-fade: out, swap, back in — twice
          // --names-narrow-fade (150 ms) plus a margin.
          await new Promise((done) => setTimeout(done, 450));
          return window.scrollY;
        };
        const vh = window.innerHeight;
        const max = document.documentElement.scrollHeight - vh;
        const positions = [0];
        for (const band of bands) {
          if (!band) continue;
          positions.push(band.top - vh, band.top - vh - 1);
        }
        positions.push(max);
        const label = document.querySelector("[data-names-narrow]");
        const nav = document.querySelector(".nav").getBoundingClientRect();
        const lane = parseFloat(getComputedStyle(document.querySelector(".ruler")).inlineSize);
        const mismatches = [];
        const misplaced = [];
        for (const target of positions) {
          const y = await settleScroll(Math.max(0, Math.min(target, max)));
          let want = "";
          for (const band of bands) if (band && band.top <= y + vh) want = band.word;
          const shown = label.classList.contains("is-shown") && getComputedStyle(label).opacity === "1";
          const got = shown ? label.textContent.trim() : "";
          if (got !== want) mismatches.push(`@${y} got="${got}" want="${want}"`);
          if (shown) {
            const rect = label.getBoundingClientRect();
            if (rect.left < innerWidth - lane - 0.5 || rect.right > innerWidth + 0.5 || rect.top < nav.bottom) {
              misplaced.push(`@${y} [${Math.round(rect.left)},${Math.round(rect.top)},${Math.round(rect.right)}]`);
            }
          }
        }
        return { mismatches, misplaced, checked: positions.length };
      });
      add(
        `names.narrow-${tag}`,
        result.mismatches.length === 0,
        result.mismatches.length ? result.mismatches.slice(0, 4).join(" | ") : `${result.checked} depths`,
      );
      add(`names.narrow-lane-${tag}`, result.misplaced.length === 0, result.misplaced.slice(0, 3).join(" | "));
      add(`names.narrow-errors-${tag}`, session.pageErrors.length === 0, session.pageErrors[0] ?? "");
      await session.context.close();
    }
  }

  // The swap: one surface at a time, both directions, no reload.
  const session = await openPage({ width: 1440, height: 900 });
  const { page } = session;
  await settle(page, "names-swap");
  await page.evaluate(() => window.scrollTo(0, document.getElementById("skills").offsetTop));
  await page.waitForTimeout(800);
  const surfaces = () =>
    page.evaluate(() => ({
      layer: getComputedStyle(document.querySelector("[data-names]")).display !== "none",
      narrow: getComputedStyle(document.querySelector("[data-names-narrow]")).display !== "none",
    }));
  const steps = [];
  for (const width of [1440, 375, 769, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(400);
    const state = await surfaces();
    const ok = width > 768 ? state.layer && !state.narrow : !state.layer && state.narrow;
    steps.push(`${width}:${ok ? "ok" : JSON.stringify(state)}`);
  }
  add("names.narrow-swap", steps.every((step) => step.endsWith(":ok")), steps.join(" "));
  add("names.narrow-swap-errors", session.pageErrors.length === 0, session.pageErrors[0] ?? "");
  await session.context.close();
}

/* ------------------------------------------------------------ lighthouse --- */

async function lighthouseAudits() {
  const chromePath = chromium.executablePath();
  const mobile = [];
  for (let i = 0; i < 3; i += 1) {
    mobile.push(readScores(await runLighthouse({ url: base, chromePath })));
  }
  const desktop = readScores(await runLighthouse({ url: base, chromePath, preset: "desktop" }));
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

  add("lh.mobile.perf", median(mobile.map((run) => run.performance)) > 90, mobile.map((run) => Math.round(run.performance)).join("/"));
  add("lh.mobile.lcp", median(mobile.map((run) => run.lcp)) < 2500, `${Math.round(median(mobile.map((run) => run.lcp)))}ms`);
  add("lh.mobile.a11y", mobile.every((run) => run.accessibility === 100), mobile.map((run) => run.accessibility).join("/"));
  add("lh.desktop.perf", desktop.performance >= 95, String(Math.round(desktop.performance)));
  add("lh.desktop.a11y", desktop.accessibility === 100, String(desktop.accessibility));

  return { mobile, desktop };
}

/* ----------------------------------------------------------- screenshots --- */

async function screenshots() {
  const dir = join(OUT, "screens");
  await mkdir(dir, { recursive: true });
  const shot = async (page, name) => page.screenshot({ path: join(dir, `${name}.png`) });

  for (const [name, options] of [
    ["1440-en", { width: 1440, height: 900 }],
    ["1440-fr", { width: 1440, height: 900, locale: "fr-FR" }],
    ["375-en", { width: 375, height: 812 }],
    ["375-fr", { width: 375, height: 812, locale: "fr-FR" }],
    ["1440-reduced", { width: 1440, height: 900, reducedMotion: true }],
    // Ticket 131: real phone profiles, not only a resized desktop viewport.
    ["iphone13-en", { device: "iPhone 13" }],
    ["pixel7-fr", { device: "Pixel 7", locale: "fr-FR" }],
  ]) {
    const session = await openPage(options);
    await settle(session.page, `screens-${name}`);
    await shot(session.page, `${name}-top`);
    await session.page.evaluate(() => document.getElementById("projects").scrollIntoView());
    await session.page.waitForTimeout(700);
    await shot(session.page, `${name}-projects`);
    await session.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await session.page.waitForTimeout(700);
    await shot(session.page, `${name}-footer`);
    await session.context.close();
  }

  // The intro's midpoint, desktop only.
  const intro = await openPage();
  await intro.page.waitForTimeout(700);
  await shot(intro.page, "1440-intro");
  await intro.context.close();
}

/* ------------------------------------------------------------------ main --- */

await mkdir(OUT, { recursive: true });
await staticAudits();

const server = await serve(ROOT);
base = server.url;
browser = await chromium.launch();

let lighthouse = null;
try {
  await runtimeAudits();
  await navOneRowAudits();
  await navMenuAudits();
  await heroChipAudits();
  await namesNarrowAudits();
  if (!SKIP_LH) lighthouse = await lighthouseAudits();
  if (!SKIP_SHOTS) await screenshots();
} finally {
  await browser.close();
  await server.close();
}

const failed = results.filter((result) => !result.ok);
const report = {
  generatedAt: new Date().toISOString(),
  url: base,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
  lighthouse,
};
await writeFile(join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);

for (const result of results) {
  if (!result.ok) console.log(`FAIL ${result.id}${result.detail ? ` :: ${result.detail}` : ""}`);
}
console.log(`\n${report.passed} passed, ${report.failed} failed${SKIP_LH ? " (Lighthouse skipped)" : ""}`);
console.log(`report: qa-out/report.json${SKIP_SHOTS ? "" : " + qa-out/screens/"}`);

process.exit(failed.length === 0 ? 0 : 1);
