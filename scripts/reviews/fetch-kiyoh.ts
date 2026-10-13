/**
 * Fetches the Kiyoh score (last 12 months) and total review count from the client's
 * review feed and writes them to src/data/generated/kiyoh.json. Runs before every build,
 * so the score on the site is as fresh as the latest deploy.
 *
 * The feed hash is a credential: KIYOH_FEED_HASH (env or .env.local), never committed.
 * Without it, or when the feed fails, the last good file is kept; with no file at all
 * the site shows a plain link to the reviews instead of a score.
 *
 * Usage: npm run reviews:fetch
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src/data/generated/kiyoh.json");

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

function readNumber(xml: string, tag: string): number | null {
  const match = xml.match(new RegExp(`<${tag}>\\s*([0-9]+(?:[.,][0-9]+)?)\\s*</${tag}>`));
  return match ? Number(match[1].replace(",", ".")) : null;
}

async function main() {
  const hash = process.env.KIYOH_FEED_HASH;
  if (!hash) {
    console.log("Kiyoh: KIYOH_FEED_HASH not set, keeping the current data (if any).");
    return;
  }
  const res = await fetch(`https://www.kiyoh.com/v1/review/feed.xml?hash=${encodeURIComponent(hash)}`, {
    headers: { Accept: "application/xml, text/xml" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`feed returned ${res.status}`);
  // Only the summary at the top of the feed is needed; review texts are not stored.
  const head = (await res.text()).split("<reviews>")[0];
  const score = readNumber(head, "last12MonthAverageRating") ?? readNumber(head, "averageRating");
  const count = readNumber(head, "numberReviews");
  if (score === null || count === null || score < 0 || score > 10) throw new Error("unexpected feed format");
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ score, count, fetchedAt: new Date().toISOString() }, null, 2) + "\n");
  console.log(`Kiyoh: ${score} from ${count} reviews.`);
}

main().catch((e) => {
  // Never fail the build over reviews; the site falls back to a plain link.
  console.warn(`Kiyoh: could not refresh (${e instanceof Error ? e.message : e}), keeping the current data.`);
});
