/**
 * Offline test for the migration parser and matchers, using a synthetic fixture.
 * Usage: npm run test:parser
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseRobots } from "../lib/http";
import { matchDevice, matchRepair } from "../lib/match";
import { parsePage } from "../lib/parse-page";
import { normalizeUrl } from "../lib/url";

let failures = 0;
function expect(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : `\n    expected ${JSON.stringify(expected)}\n    got      ${JSON.stringify(actual)}`}`);
}

const url = "https://www.phonerepairs.nl/samsung-reparatie-den-bosch/samsung-s23/";
const html = readFileSync(join(__dirname, "../fixtures/synthetic-device-page.html"), "utf8");
const page = parsePage(url, html);

expect("title", page.title, "Samsung S23 reparatie: Testpagina");
expect("h1", page.h1, "Samsung S23 reparatie");
expect("cms detected", page.cms, "wordpress");
expect("page type", page.pageTypeGuess, "device");
expect("table prices", page.prices.filter((p) => p.source === "table").map((p) => p.amount), [111, 22, 33]);
expect("warranty durations (conflict visible)", page.warrantyStatements.flatMap((w) => w.durations), ["12 maanden", "90 dagen"]);
expect("faq sources", page.faqs.map((f) => f.question).sort(), ["Hoe lang duurt het?", "Testvraag in details?", "Testvraag via JSON-LD?"]);
expect("contact", page.contact.phones.concat(page.contact.emails), ["0738220013", "info@phonerepairs.nl"]);
expect("whatsapp link captured", page.contact.whatsapp.length, 1);
expect("header/footer excluded from text", page.paragraphs.some((p) => p.includes("Footer")), false);
expect("internal link normalized", page.internalLinks.includes("https://www.phonerepairs.nl/samsung-reparatie-den-bosch/samsung-s24/"), true);
expect("extra keeps body class", page.extra.bodyClass, "page-template-default page page-id-123");
expect("matchDevice via legacy URL", matchDevice(url), "samsung-galaxy-s23");
expect("matchDevice via slug", matchDevice("https://www.phonerepairs.nl/iphone-reparatie-den-bosch/iphone-15-pro/"), "apple-iphone-15-pro");
expect("matchRepair", ["Scherm vervangen", "Batterij", "Laadconnector", "Iets anders"].map(matchRepair), [
  "scherm-vervangen",
  "batterij-vervangen",
  "oplaadpoort-repareren",
  "overige-reparaties",
]);
expect("normalizeUrl strips tracking + adds slash", normalizeUrl("/over-phone-repairs?utm_source=x#a"), "https://www.phonerepairs.nl/over-phone-repairs/");
expect("normalizeUrl rejects external", normalizeUrl("https://example.com/"), null);
expect("robots parsing", parseRobots("User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\nSitemap: https://x/sitemap.xml"), {
  disallow: ["/wp-admin/"],
  allow: ["/wp-admin/admin-ajax.php"],
  sitemaps: ["https://x/sitemap.xml"],
});

console.log(failures ? `\n${failures} failed` : "\nAll parser checks passed");
process.exit(failures ? 1 : 0);
