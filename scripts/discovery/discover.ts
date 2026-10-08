/**
 * Step 1 — discover public URLs of the original site.
 *
 * Sources, in order of reliability:
 *   1. seed inventory (src/data/url-inventory.json)
 *   2. sitemaps listed in robots.txt + common WordPress sitemap locations
 *   3. WordPress REST API (/wp-json/wp/v2/pages|posts) if publicly exposed
 *   4. a bounded crawl of internal links (MAX_CRAWL, default 300 pages)
 *
 * Output: data/raw/discovered.json (one record per normalized URL).
 * If the site cannot be reached the run ends cleanly with status "blocked",
 * so the report clearly shows that coverage is incomplete.
 *
 * Usage: npm run discover [-- --max=1000]
 */
import * as cheerio from "cheerio";
import { AccessBlockedError, getRobots, politeFetch } from "../lib/http";
import { readJson, writeJson } from "../lib/io";
import { files, ORIGIN } from "../lib/paths";
import { normalizeUrl } from "../lib/url";
import type { UrlRecord } from "../../src/types/content";

type Discovered = {
  generatedAt: string;
  status: "complete" | "partial" | "blocked";
  blockedReason?: string;
  sources: Record<string, number>;
  urls: (Pick<UrlRecord, "url" | "discoveredVia"> & { pageType?: UrlRecord["pageType"] })[];
};

const maxArg = process.argv.find((a) => a.startsWith("--max="));
const MAX_CRAWL = Number(maxArg?.split("=")[1] ?? process.env.MAX_CRAWL ?? 300);

async function main() {
  const found = new Map<string, Discovered["urls"][number]>();
  const sources: Record<string, number> = {};
  const add = (url: string | null, via: UrlRecord["discoveredVia"]) => {
    if (!url || found.has(url)) return false;
    found.set(url, { url, discoveredVia: via });
    sources[via] = (sources[via] ?? 0) + 1;
    return true;
  };

  for (const r of readJson<UrlRecord[]>(files.inventorySeed, [])) add(normalizeUrl(r.url), r.discoveredVia);

  const result: Discovered = { generatedAt: new Date().toISOString(), status: "complete", sources, urls: [] };

  try {
    const robots = await getRobots();
    const sitemapQueue = [
      ...robots.sitemaps,
      `${ORIGIN}/sitemap_index.xml`,
      `${ORIGIN}/wp-sitemap.xml`,
      `${ORIGIN}/sitemap.xml`,
    ];
    const seenSitemaps = new Set<string>();
    while (sitemapQueue.length) {
      const sm = sitemapQueue.shift()!;
      if (seenSitemaps.has(sm)) continue;
      seenSitemaps.add(sm);
      const res = await politeFetch(sm);
      if (res.status !== 200) continue;
      const $ = cheerio.load(res.body, { xml: true });
      $("sitemap > loc").each((_, el) => void sitemapQueue.push($(el).text().trim()));
      $("url > loc").each((_, el) => void add(normalizeUrl($(el).text().trim()), "sitemap"));
    }

    for (const type of ["pages", "posts"]) {
      for (let page = 1; page < 50; page++) {
        const res = await politeFetch(`${ORIGIN}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=link`);
        if (res.status !== 200 || !res.contentType.includes("json")) break;
        const items = JSON.parse(res.body) as { link: string }[];
        items.forEach((i) => add(normalizeUrl(i.link), "wp-rest"));
        if (items.length < 100) break;
      }
    }

    const queue = [...found.keys()];
    let crawled = 0;
    while (queue.length && crawled < MAX_CRAWL) {
      const url = queue.shift()!;
      const res = await politeFetch(url);
      crawled++;
      if (res.status !== 200 || !res.contentType.includes("html")) continue;
      const $ = cheerio.load(res.body);
      $("a[href]").each((_, el) => {
        const next = normalizeUrl($(el).attr("href") ?? "", res.finalUrl);
        if (add(next, "crawl")) queue.push(next!);
      });
    }
    if (queue.length) result.status = "partial";
    console.log(`Crawled ${crawled} pages; ${queue.length} left in queue (limit ${MAX_CRAWL}).`);
  } catch (e) {
    if (!(e instanceof AccessBlockedError)) throw e;
    result.status = "blocked";
    result.blockedReason = e.message;
    console.warn(`⚠ ${e.message}\n  Discovery stopped. Only seed URLs are included; see docs/data-gaps.md.`);
  }

  result.urls = [...found.values()].sort((a, b) => a.url.localeCompare(b.url));
  writeJson(files.discovered, result);
  console.log(`Discovery ${result.status}: ${result.urls.length} URLs →`, sources);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
