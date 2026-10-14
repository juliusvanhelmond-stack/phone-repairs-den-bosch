/**
 * Content edited in the CMS (Keystatic) lives as one JSON file per entry under src/content/.
 * These helpers are shared by the WordPress importer and the content build step.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const PAGES_DIR = "src/content/pages";
export const SEO_DIR = "src/content/seo";
export const GENERATED_DIR = "src/data/generated";

/** All entries of a content folder; the file name (without .json) is the entry's id. */
export function readEntries<T = Record<string, unknown>>(root: string, dir: string): (T & { id: string })[] {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({ ...(JSON.parse(readFileSync(join(abs, f), "utf8")) as T), id: f.slice(0, -5) }));
}

/** Writes one entry; the id becomes the file name and is also kept in the file (Keystatic's slug field). */
export function writeEntry(root: string, dir: string, id: string, data: Record<string, unknown>, format = (s: string) => s) {
  const abs = join(root, dir);
  mkdirSync(abs, { recursive: true });
  writeFileSync(join(abs, `${id}.json`), format(JSON.stringify({ ...data, id }, null, 2)) + "\n");
}
