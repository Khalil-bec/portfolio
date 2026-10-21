import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const CLI = fileURLToPath(
  new URL("../../node_modules/lighthouse/cli/index.js", import.meta.url),
);

/** Run one Lighthouse pass through Playwright's Chromium. Returns the raw LHR.
 * No report file is written: the harness keeps the numbers it needs. */
export async function runLighthouse({ url, chromePath, preset }) {
  const args = [
    CLI,
    url,
    "--output=json",
    "--output-path=stdout",
    "--only-categories=performance,accessibility",
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
  ];
  if (preset === "desktop") args.push("--preset=desktop");

  const { stdout } = await run(process.execPath, args, {
    env: { ...process.env, CHROME_PATH: chromePath },
    maxBuffer: 64 * 1024 * 1024,
    timeout: 180_000,
  });

  return JSON.parse(stdout.slice(stdout.indexOf("{")));
}

/** Pull the fields the acceptance criteria care about out of one LHR. */
export function readScores(report) {
  const audit = (id) => report.audits[id];
  return {
    performance: report.categories.performance.score * 100,
    accessibility: report.categories.accessibility.score * 100,
    lcp: audit("largest-contentful-paint").numericValue,
    fcp: audit("first-contentful-paint").numericValue,
    cls: audit("cumulative-layout-shift").numericValue,
    tbt: audit("total-blocking-time").numericValue,
  };
}
