/**
 * Step 2 — fetch every discovered URL into the on-disk cache (data/raw/html).
 * Respects robots.txt and rate limits via politeFetch. Stops on access blocks.
 *
 * Usage: npm run migrate:fetch
 */
import { AccessBlockedError, politeFetch } from "../lib/http";
import { readJson, writeJson } from "../lib/io";
import { files } from "../lib/paths";

type Discovered = { status: string; urls: { url: string }[] };
type LogEntry = { url: string; status: number | "blocked" | "error"; finalUrl?: string; fromCache?: boolean; reason?: string };

async function main() {
  const discovered = readJson<Discovered>(files.discovered, { status: "missing", urls: [] });
  if (!discovered.urls.length) throw new Error("No discovered URLs. Run `npm run discover` first.");
  const log: LogEntry[] = [];
  for (const { url } of discovered.urls) {
    try {
      const res = await politeFetch(url);
      log.push({ url, status: res.status, finalUrl: res.finalUrl, fromCache: res.fromCache });
    } catch (e) {
      if (e instanceof AccessBlockedError) {
        log.push({ url, status: "blocked", reason: e.reason });
        if (e.reason.startsWith("network") || e.reason.includes("403") || e.reason.includes("407")) {
          console.warn(`⚠ ${e.message}. Stopping: the site is not reachable from this environment.`);
          break;
        }
      } else {
        log.push({ url, status: "error", reason: (e as Error).message });
      }
    }
  }
  writeJson(files.fetchLog, { generatedAt: new Date().toISOString(), entries: log });
  const ok = log.filter((l) => l.status === 200).length;
  console.log(`Fetched ${ok}/${discovered.urls.length} URLs (${log.length - ok} not OK). Log: ${files.fetchLog}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
