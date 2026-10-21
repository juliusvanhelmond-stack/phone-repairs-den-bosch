/**
 * Fetches the Kiyoh score (last 12 months), the total review count and the latest reviews from
 * the client's review feed and writes them to src/data/generated/kiyoh.json. Runs before every build,
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

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

/**
 * The most recent reviews (for the Kiyoh carousel on the homepage, client request 2026-10-16):
 * first name and place as published on Kiyoh, the rating, the one-liner and the review text.
 */
function latestReviews(xml: string, max = 12) {
  const items = xml.split("<reviews><reviewId>").slice(1);
  const field = (item: string, tag: string) => decode(item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "");
  const answer = (item: string, group: string) =>
    decode(item.match(new RegExp(`<questionGroup>${group}</questionGroup>[\\s\\S]*?<rating>([\\s\\S]*?)</rating>`))?.[1] ?? "");
  return items
    .map((item) => ({
      author: field(item, "reviewAuthor"),
      city: field(item, "city"),
      rating: Number(field(item, "rating")),
      title: answer(item, "DEFAULT_ONELINER"),
      text: answer(item, "DEFAULT_OPINION"),
      date: field(item, "dateSince").slice(0, 10),
    }))
    .filter((r) => r.author && r.rating >= 0 && r.rating <= 10 && (r.title || r.text))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, max);
}

async function main() {
  // Tolerate a pasted value with surrounding whitespace or quotes (Vercel dashboard).
  const hash = process.env.KIYOH_FEED_HASH?.trim().replace(/^["']|["']$/g, "");
  if (!hash) {
    console.log("Kiyoh: KIYOH_FEED_HASH not set, keeping the current data (if any).");
    return;
  }
  const res = await fetch(`https://www.kiyoh.com/v1/review/feed.xml?hash=${encodeURIComponent(hash)}`, {
    headers: { Accept: "application/xml, text/xml" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`feed returned ${res.status}`);
  const xml = await res.text();
  const head = xml.split("<reviews>")[0];
  const score = readNumber(head, "last12MonthAverageRating") ?? readNumber(head, "averageRating");
  const count = readNumber(head, "numberReviews");
  if (score === null || count === null || score < 0 || score > 10) throw new Error("unexpected feed format");
  mkdirSync(path.dirname(OUT), { recursive: true });
  const reviews = latestReviews(xml);
  writeFileSync(OUT, JSON.stringify({ score, count, reviews, fetchedAt: new Date().toISOString() }, null, 2) + "\n");
  console.log(`Kiyoh: ${score} from ${count} reviews, ${reviews.length} recent reviews stored.`);
}

main().catch((e) => {
  // Never fail the build over reviews; the site falls back to a plain link.
  console.warn(`Kiyoh: could not refresh (${e instanceof Error ? e.message : e}), keeping the current data.`);
});
