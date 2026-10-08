/**
 * Polite HTTP client for the content migration.
 * - identifies itself with a clear User-Agent
 * - respects robots.txt Disallow rules for its agent and "*"
 * - throttles to one request per REQUEST_DELAY_MS (default 1000ms)
 * - caches responses on disk so pages are fetched only once
 * - never retries around 401/403/429 or proxy blocks: those are reported, not bypassed
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { HTML_CACHE_DIR, ORIGIN } from "./paths";
import { writeText } from "./io";

export const USER_AGENT =
  process.env.CRAWLER_USER_AGENT ?? "JUNEStudio-MigrationBot/1.0 (+contact: info@phonerepairs.nl redesign project)";
const DELAY = Number(process.env.REQUEST_DELAY_MS ?? 1000);

export class AccessBlockedError extends Error {
  constructor(
    public url: string,
    public reason: string,
  ) {
    super(`Access blocked for ${url}: ${reason}`);
  }
}

let lastRequest = 0;
async function throttle() {
  const wait = lastRequest + DELAY - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

export type FetchResult = { url: string; finalUrl: string; status: number; contentType: string; body: string; fromCache: boolean };

const cachePath = (url: string) => join(HTML_CACHE_DIR, createHash("sha1").update(url).digest("hex") + ".json");

export async function politeFetch(url: string, { useCache = true } = {}): Promise<FetchResult> {
  const path = cachePath(url);
  if (useCache && existsSync(path)) return { ...JSON.parse(readFileSync(path, "utf8")), fromCache: true };
  if (!(await isAllowed(url))) throw new AccessBlockedError(url, "disallowed by robots.txt");

  await throttle();
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xml,application/json" }, redirect: "follow" });
  } catch (e) {
    const cause = (e as { cause?: { message?: string } }).cause?.message ?? (e as Error).message;
    throw new AccessBlockedError(url, `network error: ${cause}`);
  }
  if ([401, 403, 407, 429].includes(res.status)) throw new AccessBlockedError(url, `HTTP ${res.status}`);

  const result: FetchResult = {
    url,
    finalUrl: res.url,
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    body: await res.text(),
    fromCache: false,
  };
  if (res.status < 500) writeText(path, JSON.stringify(result));
  return result;
}

// --- robots.txt -------------------------------------------------------------

let robotsRules: { disallow: string[]; allow: string[]; sitemaps: string[] } | null = null;

export async function getRobots() {
  if (robotsRules) return robotsRules;
  robotsRules = { disallow: [], allow: [], sitemaps: [] };
  await throttle();
  const res = await fetch(`${ORIGIN}/robots.txt`, { headers: { "User-Agent": USER_AGENT } }).catch((e) => {
    throw new AccessBlockedError(`${ORIGIN}/robots.txt`, `network error: ${(e as Error).message}`);
  });
  if ([401, 403, 407, 429].includes(res.status)) throw new AccessBlockedError(`${ORIGIN}/robots.txt`, `HTTP ${res.status}`);
  if (!res.ok) return robotsRules;
  robotsRules = parseRobots(await res.text());
  return robotsRules;
}

export function parseRobots(text: string) {
  const rules = { disallow: [] as string[], allow: [] as string[], sitemaps: [] as string[] };
  let applies = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const k = key?.toLowerCase();
    if (k === "user-agent") applies = value === "*" || USER_AGENT.toLowerCase().includes(value.toLowerCase());
    else if (k === "sitemap" && value) rules.sitemaps.push(value);
    else if (applies && k === "disallow" && value) rules.disallow.push(value);
    else if (applies && k === "allow" && value) rules.allow.push(value);
  }
  return rules;
}

async function isAllowed(url: string) {
  const { pathname } = new URL(url);
  if (pathname === "/robots.txt") return true;
  const rules = await getRobots();
  const longest = (list: string[]) =>
    Math.max(-1, ...list.filter((p) => pathname.startsWith(p.replace(/\*.*$/, ""))).map((p) => p.length));
  return longest(rules.allow) >= longest(rules.disallow);
}
