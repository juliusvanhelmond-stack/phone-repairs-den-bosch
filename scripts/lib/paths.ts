import { join } from "node:path";

export const ROOT = process.cwd();
export const ORIGIN = process.env.SOURCE_ORIGIN ?? "https://www.phonerepairs.nl";
export const RAW_DIR = join(ROOT, "data/raw");
export const HTML_CACHE_DIR = join(RAW_DIR, "html");
export const NORMALIZED_DIR = join(ROOT, "data/normalized");
export const DOCS_DIR = join(ROOT, "docs");

export const files = {
  inventorySeed: join(ROOT, "src/data/url-inventory.json"),
  discovered: join(RAW_DIR, "discovered.json"),
  fetchLog: join(RAW_DIR, "fetch-log.json"),
  pages: join(NORMALIZED_DIR, "pages.json"),
  analysis: join(NORMALIZED_DIR, "analysis.json"),
  priceCandidates: join(NORMALIZED_DIR, "price-candidates.json"),
};
