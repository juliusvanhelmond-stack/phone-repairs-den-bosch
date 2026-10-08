/**
 * Pure HTML → structured record parser for original phonerepairs.nl pages.
 * Nothing is discarded: unrecognised signals (body classes, JSON-LD, Open Graph,
 * generator) are kept under `extra` for later review.
 */
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { normalizeUrl } from "./url";

export type ParsedPrice = { amount: number; label: string; context: string; source: "table" | "text" };
export type ParsedPage = {
  url: string;
  status: number;
  title: string;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  h1: string | null;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  images: { src: string; alt: string }[];
  internalLinks: string[];
  prices: ParsedPrice[];
  warrantyStatements: { text: string; durations: string[] }[];
  faqs: { question: string; answer: string }[];
  contact: { phones: string[]; emails: string[]; whatsapp: string[] };
  pageTypeGuess: string;
  cms: string | null;
  contentHash: string;
  extra: Record<string, unknown>;
};

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const PRICE_RE = /€\s?(\d{1,4}(?:[.,]\d{2})?)(?:,-)?|(\d{1,4})(?:,-|,\d{2})\s?(?:euro|€)?/gi;
const HAS_PRICE_RE = /€\s?\d|\d,-|\d,\d{2}\s?(?:euro|€)/i;
const WARRANTY_RE = /garantie/i;
const DURATION_RE = /(\d+)\s*(maanden|maand|dagen|dag|jaar|jaren)/gi;

export function parseAmount(raw: string): number | null {
  const n = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 5000 ? n : null;
}

export function guessPageType(url: string): string {
  const path = new URL(url).pathname;
  if (path === "/") return "home";
  if (/afspraak/.test(path)) return "booking";
  if (/veelgestelde-vragen|faq/.test(path)) return "faq";
  if (/^\/[a-z0-9-]+-reparatie-den-bosch\/[a-z0-9-]+\/?$/.test(path)) return "device";
  if (/^\/[a-z0-9-]+-reparatie-den-bosch\/?$/.test(path)) return "brand";
  if (/telefoon-reparatie-(?!den-bosch)[a-z-]+\/?$/.test(path)) return "area";
  if (/over-|contact/.test(path)) return "info";
  return "unknown";
}

export function parsePage(url: string, html: string, status = 200): ParsedPage {
  const $ = cheerio.load(html);
  const jsonLd = $('script[type="application/ld+json"]')
    .map((_, el) => {
      try {
        return JSON.parse($(el).text());
      } catch {
        return { unparsable: $(el).text().slice(0, 500) };
      }
    })
    .get();
  const generator = $('meta[name="generator"]').attr("content") ?? null;
  const cms =
    generator?.toLowerCase().includes("wordpress") || html.includes("/wp-content/")
      ? "wordpress"
      : generator;

  const main = $("main, article, .entry-content, #content").first();
  const scope = main.length ? main : $("body");
  const content = scope.clone();
  content.find("header, footer, nav, script, style, noscript, form").remove();

  const headings = content
    .find("h1, h2, h3, h4")
    .map((_, el) => ({ level: Number(el.tagName.slice(1)), text: clean($(el).text()) }))
    .get()
    .filter((h) => h.text);
  const paragraphs = content
    .find("p, li")
    .map((_, el) => clean($(el).text()))
    .get()
    .filter((t) => t.length > 1);

  const prices: ParsedPrice[] = [];
  $("table tr").each((_, row) => {
    const cells = $(row).find("th, td").map((__, c) => clean($(c).text())).get();
    const priceCell = cells.findIndex((c) => HAS_PRICE_RE.test(c));
    if (priceCell === -1) return;
    const match = [...cells[priceCell].matchAll(PRICE_RE)][0];
    const amount = parseAmount(match?.[1] ?? match?.[2] ?? "");
    if (amount) {
      prices.push({ amount, label: cells.filter((_, i) => i !== priceCell).join(" | "), context: cells.join(" | "), source: "table" });
    }
  });
  for (const text of paragraphs) {
    for (const m of text.matchAll(PRICE_RE)) {
      const amount = parseAmount(m[1] ?? m[2] ?? "");
      if (amount && !prices.some((p) => p.context.includes(text))) {
        prices.push({ amount, label: text.slice(0, 120), context: text, source: "text" });
      }
    }
  }

  const warrantyStatements = paragraphs
    .filter((t) => WARRANTY_RE.test(t))
    .map((text) => ({ text, durations: [...text.matchAll(DURATION_RE)].map((m) => `${m[1]} ${m[2]}`) }));

  const faqs: ParsedPage["faqs"] = [];
  $("details").each((_, el) => {
    const q = clean($(el).find("summary").text());
    const a = clean($(el).clone().find("summary").remove().end().text());
    if (q) faqs.push({ question: q, answer: a });
  });
  content.find("h2, h3, h4").each((_, el) => {
    const q = clean($(el).text());
    if (!q.endsWith("?")) return;
    const answer = clean($(el).nextUntil("h2, h3, h4").text());
    if (answer) faqs.push({ question: q, answer });
  });
  for (const block of jsonLd) {
    const graph = Array.isArray(block?.["@graph"]) ? block["@graph"] : [block];
    for (const node of graph) {
      if (node?.["@type"] === "FAQPage") {
        for (const q of node.mainEntity ?? []) faqs.push({ question: q.name, answer: clean(String(q.acceptedAnswer?.text ?? "")) });
      }
    }
  }

  const hrefs = $("a[href]").map((_, el) => $(el).attr("href") ?? "").get();
  const contact = {
    phones: [...new Set(hrefs.filter((h) => h.startsWith("tel:")).map((h) => h.slice(4)))],
    emails: [...new Set(hrefs.filter((h) => h.startsWith("mailto:")).map((h) => h.slice(7).split("?")[0]))],
    whatsapp: [...new Set(hrefs.filter((h) => /wa\.me|api\.whatsapp\.com/.test(h)))],
  };

  const mainText = [...headings.map((h) => h.text), ...paragraphs].join("\n");
  return {
    url,
    status,
    title: clean($("title").first().text()),
    metaDescription: $('meta[name="description"]').attr("content") ?? null,
    canonical: $('link[rel="canonical"]').attr("href") ?? null,
    robots: $('meta[name="robots"]').attr("content") ?? null,
    h1: headings.find((h) => h.level === 1)?.text ?? null,
    headings,
    paragraphs,
    images: $("img")
      .map((_, el) => ({ src: $(el).attr("data-src") ?? $(el).attr("src") ?? "", alt: clean($(el).attr("alt") ?? "") }))
      .get()
      .filter((i) => i.src && !i.src.startsWith("data:")),
    internalLinks: [...new Set(hrefs.map((h) => normalizeUrl(h, url)).filter((h): h is string => !!h))],
    prices,
    warrantyStatements,
    faqs,
    contact,
    pageTypeGuess: guessPageType(url),
    cms,
    contentHash: createHash("sha1").update(mainText.toLowerCase()).digest("hex"),
    extra: {
      generator,
      bodyClass: $("body").attr("class") ?? null,
      openGraph: Object.fromEntries(
        $('meta[property^="og:"]').map((_, el) => [[$(el).attr("property"), $(el).attr("content")]]).get(),
      ),
      jsonLd,
    },
  };
}
