/**
 * Step 4 — dedupe, detect conflicts and export reviewable candidates.
 *
 * Output: data/normalized/analysis.json and data/normalized/price-candidates.json.
 * Price candidates are NEVER written to src/data/prices.json automatically:
 * each one stays `verified: false` until a person reviews it against the source.
 *
 * Usage: npm run migrate:analyze
 */
import { readJson, writeJson } from "../lib/io";
import { matchDevice, matchRepair } from "../lib/match";
import type { ParsedPage } from "../lib/parse-page";
import { files } from "../lib/paths";
import type { RepairPrice } from "../../src/types/content";

function main() {
  const pages = readJson<ParsedPage[]>(files.pages, []);
  const today = new Date().toISOString().slice(0, 10);

  const byHash = new Map<string, string[]>();
  for (const p of pages) byHash.set(p.contentHash, [...(byHash.get(p.contentHash) ?? []), p.url]);
  const duplicates = [...byHash.values()].filter((urls) => urls.length > 1);

  const candidates: (RepairPrice & { label: string })[] = [];
  const unmatchedPrices: { url: string; amount: number; label: string }[] = [];
  for (const page of pages) {
    const deviceId = matchDevice(page.url);
    for (const price of page.prices) {
      if (!deviceId || price.source !== "table") {
        unmatchedPrices.push({ url: page.url, amount: price.amount, label: price.label });
        continue;
      }
      candidates.push({
        deviceId,
        repairId: matchRepair(price.label),
        amount: price.amount,
        currency: "EUR",
        includesVat: /btw/i.test(page.paragraphs.join(" ")),
        includesLabour: /montage/i.test(page.paragraphs.join(" ")),
        variant: price.label || undefined,
        verified: false,
        sources: [{ url: page.url, verification: "verified-source", capturedAt: today }],
        capturedAt: today,
        label: price.label,
      });
    }
  }

  const priceGroups = new Map<string, Set<number>>();
  for (const c of candidates) {
    const key = `${c.deviceId}:${c.repairId}:${c.variant ?? ""}`;
    priceGroups.set(key, (priceGroups.get(key) ?? new Set()).add(c.amount!));
  }
  const priceConflicts = [...priceGroups.entries()]
    .filter(([, amounts]) => amounts.size > 1)
    .map(([key, amounts]) => ({ key, amounts: [...amounts] }));

  const warrantyDurations = new Map<string, string[]>();
  for (const p of pages)
    for (const w of p.warrantyStatements)
      for (const d of w.durations) warrantyDurations.set(d, [...(warrantyDurations.get(d) ?? []), p.url]);

  const analysis = {
    generatedAt: new Date().toISOString(),
    pages: pages.length,
    cms: [...new Set(pages.map((p) => p.cms).filter(Boolean))],
    duplicates,
    priceCandidates: candidates.length,
    priceConflicts,
    unmatchedPrices,
    warrantyDurations: Object.fromEntries(warrantyDurations),
    warrantyConflict: warrantyDurations.size > 1,
    contactValues: {
      phones: [...new Set(pages.flatMap((p) => p.contact.phones))],
      emails: [...new Set(pages.flatMap((p) => p.contact.emails))],
      whatsapp: [...new Set(pages.flatMap((p) => p.contact.whatsapp))],
    },
    pagesWithoutDevice: pages.filter((p) => p.pageTypeGuess === "device" && !matchDevice(p.url)).map((p) => p.url),
  };
  writeJson(files.analysis, analysis);
  writeJson(files.priceCandidates, candidates);
  console.log(
    `Analyzed ${pages.length} pages: ${duplicates.length} duplicate groups, ${candidates.length} price candidates, ${priceConflicts.length} price conflicts, warranty conflict: ${analysis.warrantyConflict}`,
  );
}

main();
