/**
 * Fetches the Google score and review count from the client's own Trustindex badge (the widget in
 * the top bar, `site.reviews.trustindexId`) and writes them to src/data/generated/google-reviews.json.
 * Runs before every build (client request 2026-10-27: show the Google score like the Kiyoh score).
 * No credential needed: it is the public content of the widget the site already embeds.
 *
 * When the widget cannot be read, the last good file is kept; with no file at all the site shows
 * a plain link to the reviews instead of a score. Never typed in.
 *
 * Usage: npm run reviews:fetch
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { site } from "../../src/lib/site";

const OUT = path.join(process.cwd(), "src/data/generated/google-reviews.json");

async function main() {
  const id = site.reviews?.trustindexId;
  if (!id) {
    console.log("Google: no Trustindex widget configured, skipping.");
    return;
  }
  const res = await fetch(`https://cdn.trustindex.io/widgets/${id.slice(0, 2)}/${id}/content.html`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`widget returned ${res.status}`);
  const html = await res.text();
  // The badge text reads e.g. "4.9 … 1171 recensies".
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const match = text.match(/(\d(?:[.,]\d)?)\s+(\d[\d.,]*)\s+(?:recensies|reviews|beoordelingen)/i);
  if (!match || !/source-Google/.test(html)) throw new Error("unexpected widget format");
  const score = Number(match[1].replace(",", "."));
  const count = Number(match[2].replace(/[.,]/g, ""));
  if (!(score >= 1 && score <= 5) || !Number.isInteger(count) || count < 1) throw new Error("unexpected values");
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ score, count, fetchedAt: new Date().toISOString() }, null, 2) + "\n");
  console.log(`Google: ${score} from ${count} reviews.`);
}

main().catch((e) => {
  // Never fail the build over reviews; the site falls back to a plain link.
  console.warn(`Google: could not refresh (${e instanceof Error ? e.message : e}), keeping the current data.`);
});
