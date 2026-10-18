/**
 * Content build step (runs before dev, build and the checks): merges the CMS files under
 * src/content/ into the generated JSON the site reads (src/data/generated/, git-ignored).
 *
 * - pages/*.json → landing-pages.json: Keystatic stores empty optional fields as "" / empty
 *   objects; they are dropped here. A page made in the CMS without a source gets its own
 *   future URL as source ("owner-confirmed": written by the shop or its agency).
 * - seo/*.json → seo-overrides.json: title/description per URL path.
 * - announcement.json → announcement.json: the announcement bar, or null when switched off.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GENERATED_DIR, PAGES_DIR, SEO_DIR, readEntries } from "./files";

const ROOT = process.cwd();
const ORIGIN = "https://www.phonerepairs.nl";
const today = new Date().toISOString().slice(0, 10);

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
const opt = (v: unknown) => str(v) || undefined;

function section(raw: Raw) {
  const image = (raw.image ?? {}) as Raw;
  return {
    heading: str(raw.heading),
    intro: list(raw.intro),
    body: list(raw.body),
    bullets: list(raw.bullets),
    steps: list(raw.steps),
    prices: (Array.isArray(raw.prices) ? (raw.prices as Raw[]) : [])
      .filter((r) => str(r.label) && str(r.price))
      .map((r) => ({ label: str(r.label), price: str(r.price), ...(opt(r.note) ? { note: str(r.note) } : {}) })),
    ...(str(image.src)
      ? { image: { src: str(image.src), alt: str(image.alt), width: Number(image.width), height: Number(image.height) } }
      : {}),
  };
}

const KIND_ORDER = ["service", "faq-topic", "area"];

const pages = readEntries<Raw>(ROOT, PAGES_DIR)
  .map((p) => {
    const path = str(p.path);
    const seo = (p.seo ?? {}) as Raw;
    const sources = (Array.isArray(p.sources) ? (p.sources as Raw[]) : [])
      .filter((s) => str(s.url))
      .map((s) => ({ url: str(s.url), verification: str(s.verification) || "owner-confirmed", ...(opt(s.capturedAt) ? { capturedAt: str(s.capturedAt) } : {}), ...(opt(s.note) ? { note: str(s.note) } : {}) }));
    if (!sources.some((s) => s.url.startsWith(ORIGIN) && s.verification !== "demo")) {
      sources.push({ url: `${ORIGIN}${path}/`, verification: "owner-confirmed", capturedAt: today, note: "Written in the CMS by Phone Repairs or its agency." });
    }
    return {
      id: p.id,
      path,
      kind: str(p.kind) || "service",
      originalTitle: str(p.originalTitle) || str(p.title),
      title: str(p.title),
      eyebrow: str(p.eyebrow),
      intro: str(p.intro),
      seo: { title: str(seo.title) || str(p.title), description: str(seo.description) || str(p.intro).slice(0, 170) },
      ...(opt(p.place) ? { place: str(p.place) } : {}),
      ...(opt(p.placeKind) ? { placeKind: str(p.placeKind) } : {}),
      // Area pages need a focus (which devices are listed); "telefoon" unless the editor chose one.
      ...(opt(p.focus) ? { focus: str(p.focus) } : str(p.kind) === "area" ? { focus: "telefoon" } : {}),
      sections: (Array.isArray(p.sections) ? (p.sections as Raw[]) : []).map(section).filter((s) => s.heading),
      unconfirmed: list(p.unconfirmed),
      legacyUrls: list(p.legacyUrls),
      sources,
    };
  })
  // Stable order: service pages, FAQ topics, then area pages by place.
  .sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      (a.place ?? a.title).localeCompare(b.place ?? b.title, "nl") ||
      a.id.localeCompare(b.id),
  );

const seo = readEntries<Raw>(ROOT, SEO_DIR)
  .map((s) => ({ id: s.id, path: str(s.path).replace(/(.)\/$/, "$1"), title: opt(s.title), description: opt(s.description) }))
  .filter((s) => s.path.startsWith("/") && (s.title || s.description));

// Announcement bar (CMS singleton src/content/announcement.json): only written when switched on.
let announcement: { text: string; linkLabel?: string; linkHref?: string } | null = null;
try {
  const a = JSON.parse(readFileSync(join(ROOT, "src/content/announcement.json"), "utf8")) as Raw;
  if (a.active === true && str(a.text)) {
    announcement = { text: str(a.text), ...(opt(a.linkLabel) && opt(a.linkHref) ? { linkLabel: str(a.linkLabel), linkHref: str(a.linkHref) } : {}) };
  }
} catch {
  // No announcement file: no bar.
}

mkdirSync(join(ROOT, GENERATED_DIR), { recursive: true });
writeFileSync(join(ROOT, GENERATED_DIR, "announcement.json"), JSON.stringify(announcement, null, 2) + "\n");
writeFileSync(join(ROOT, GENERATED_DIR, "landing-pages.json"), JSON.stringify(pages, null, 2) + "\n");
writeFileSync(join(ROOT, GENERATED_DIR, "seo-overrides.json"), JSON.stringify(seo, null, 2) + "\n");
console.log(`Content: ${pages.length} pages, ${seo.length} SEO overrides → ${GENERATED_DIR}/`);
