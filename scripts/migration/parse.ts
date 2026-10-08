/**
 * Step 3 — parse cached HTML into normalized page records (data/normalized/pages.json).
 * Usage: npm run migrate:parse
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePage, type ParsedPage } from "../lib/parse-page";
import { writeJson } from "../lib/io";
import { files, HTML_CACHE_DIR } from "../lib/paths";

function main() {
  if (!existsSync(HTML_CACHE_DIR)) {
    writeJson(files.pages, []);
    console.warn("⚠ No cached HTML found. Run `npm run discover` and `npm run migrate:fetch` first.");
    return;
  }
  const pages: ParsedPage[] = [];
  for (const file of readdirSync(HTML_CACHE_DIR)) {
    const cached = JSON.parse(readFileSync(join(HTML_CACHE_DIR, file), "utf8"));
    if (!String(cached.contentType).includes("html")) continue;
    pages.push(parsePage(cached.finalUrl ?? cached.url, cached.body, cached.status));
  }
  pages.sort((a, b) => a.url.localeCompare(b.url));
  writeJson(files.pages, pages);
  console.log(`Parsed ${pages.length} HTML pages → ${files.pages}`);
}

main();
