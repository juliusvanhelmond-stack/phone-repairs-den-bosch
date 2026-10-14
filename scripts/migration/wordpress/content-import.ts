/**
 * Writes the text content of the WordPress export into the site data:
 * info pages (landing-pages.json, original URLs kept), FAQs (faqs.json) and
 * blog posts with their full text (blog.json). English versions live in
 * translations/en.json and are written by hand; validate:data lists any missing one.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { boilerplateHeadings, paragraphs, sanitizeArticle, sectionize, type Section } from "./content";
import { repairForLabel, slugify } from "./devices";
import type { WxrItem } from "./wxr";

const ORIGIN = "https://www.phonerepairs.nl";
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

type InfoPageDef = {
  path: string;
  eyebrow: string;
  /** Sections dropped from this page (e.g. a water damage block repeated from another page). */
  drop?: RegExp;
  /** The page's own topic also appears as a block elsewhere; keep it here. */
  keepBoilerplate?: boolean;
  /** Text supplied by the owner (not on the current site yet), placed after the section with this heading. */
  ownerSections?: { after: string; sections: Section[] }[];
  /** Source of the owner text. */
  ownerSource?: { url: string; note: string; capturedAt: string };
};

const ownerSection = (heading: string, parts: Partial<Section>): Section => ({ heading, intro: [], body: [], bullets: [], steps: [], ...parts });

/** Info pages taken over 1:1 on their original URL. */
export const INFO_PAGES: InfoPageDef[] = [
  {
    path: "/garantie",
    eyebrow: "Garantie",
    // Martijn Derks (Phone Repairs), e-mail "Laatste mail van vandaag", 13 October 2026 21:07.
    // Left out until he confirms: the swap/motherboard line ("3 maanden" vs 60 days on this page),
    // the unfinished battery conditions and the empty list items.
    ownerSections: [
      {
        after: "Overige reparaties – 12 maanden garantie",
        sections: [
          ownerSection("Batterijgarantie", {
            body: ["Een batterij slijt na verloop van tijd — dat is normaal.", "Daarom krijg je op batterijen 12 maanden garantie."],
          }),
          ownerSection("Garantie op screenprotectors", {
            body: [
              "Je krijgt 2 weken plakgarantie.",
              "Laat je screenprotector door ons plaatsen? Blijkt binnen twee weken dat hij niet goed zit? Kom terug met de originele screenprotector — wij plaatsen kosteloos een nieuwe.",
            ],
          }),
        ],
      },
      {
        // E-mail "Re: Samenvatting…", 13 October 2026 21:21 ("ergens bij garantie"); typos corrected.
        after: "Probleem na een reparatie?",
        sections: [
          ownerSection("Problemen met jouw reparatie?", {
            steps: [
              "Ervaar je een probleem? Maak een afspraak en kom langs: onze specialist onderzoekt kosteloos de oorzaak.",
              "Blijkt dat het probleem toe te wijzen is aan het eerder vervangen onderdeel? Dan vervangen we dat gratis voor je.",
            ],
          }),
        ],
      },
      {
        after: "Wanneer vervalt de garantie?",
        sections: [
          ownerSection("Wanneer geldt de garantie niet?", {
            intro: ["We geven géén garantie bij:"],
            bullets: ["✕ Vochtschade, val- of stootschade", "✕ Schade door anderen", "✕ Normale slijtage zoals krassen of OLED burn-in"],
          }),
          ownerSection("Ook gelden deze uitzonderingen", {
            bullets: [
              "✕ Waterschade-reparaties (ook latere moederbordreparaties)",
              "✕ Gedeeltelijke reparaties (indien specifiek vermeld op de kassabon)",
              "✕ Kabelproblemen bij vouwbare apparaten (zoals Samsung Z-serie of laptops/MacBooks) — door slijtage bij veelvuldig open- en dichtvouwen",
            ],
            body: [
              "Wanneer je jouw device laat repareren bij Phone Repairs kan mogelijk je fabrieksgarantie vervallen. Dit is onder andere afhankelijk van het merk en kwaliteit van onderdeel.",
            ],
          }),
        ],
      },
    ],
    ownerSource: {
      url: `${ORIGIN}/garantie/`,
      capturedAt: "2026-10-13",
      note: "Warranty text supplied by Martijn Derks in his e-mails of 13 October 2026 ('Laatste mail van vandaag', 21:07; 'Problemen met jouw reparatie?', 21:21); not yet on the current site.",
    },
  },
  { path: "/waterschade-reparatie-phone-repairs", eyebrow: "Waterschade" },
  { path: "/moederbord-reparatie-den-bosch", eyebrow: "Moederbord reparatie" },
  { path: "/data-recovery", eyebrow: "Data recovery", drop: /waterschade|waterdicht/i },
  { path: "/originele-onderdelen-phone-repairs", eyebrow: "Onderdelen", drop: /waterschade|hoe langer u wacht|voorraad/i },
  // Only the first section is about the OLED screens; the rest is a general SEO block.
  { path: "/iphone-premium-oled-scherm", eyebrow: "iPhone schermen", drop: /^(kiezen|esd|phone repairs iphone|voorraad|klantgericht|gratis batterijcheck|maak snel)/i },
  { path: "/iphone-onderdelen-kalibreren", eyebrow: "iPhone onderdelen" },
  { path: "/verzekering", eyebrow: "Verzekering" },
  { path: "/duurzaamheid-en-telefoonreparatie", eyebrow: "Duurzaamheid", keepBoilerplate: true },
  { path: "/klantenservice-phone-repairs", eyebrow: "Klantenservice" },
];

/** Old FAQ summaries (search-engine snapshots) replaced by the verbatim FAQ answers. */
const SUPERSEDED_FAQS = ["hoe-lang-duurt-reparatie", "gegevens-behouden", "originele-onderdelen", "waterschade-wat-doen", "opgezwollen-batterij"];

const cleanTitle = (t: string) => t.replace(/\s+/g, " ").trim();
const fit = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, "")}…`);

function source(page: WxrItem, exportedAt: string) {
  return {
    url: `${ORIGIN}${page.path}/`,
    verification: "verified-source" as const,
    capturedAt: exportedAt,
    note: `WordPress export ${exportedAt}; page last changed ${page.modified.slice(0, 10)}.`,
  };
}

function seoFor(page: WxrItem, title: string, intro: string) {
  const usable = (s: string | undefined, max: number) =>
    s && !/%%|9[.,]8|beoordeling/i.test(s) && s.length <= max ? s.replace(/\s+/g, " ").trim() : undefined;
  return {
    title: usable(page.meta._yoast_wpseo_title, 70) ?? fit(title, 70),
    description: usable(page.meta._yoast_wpseo_metadesc, 170) ?? fit(intro, 170),
  };
}

/** Slug cut at a word boundary: "mijn-scherm-komt-omhoog-wat-is-er-aan-de-hand" → "mijn-scherm-komt-omhoog-wat-is-er-aan-de". */
const shortSlug = (slug: string, max: number) =>
  slugify(slug)
    .split("-")
    .reduce((acc, part) => (acc && `${acc}-${part}`.length > max ? acc : acc ? `${acc}-${part}` : part), "");

const short = (s: Section) => ({
  heading: s.heading,
  ...(s.intro.length ? { intro: s.intro } : {}),
  body: s.body,
  bullets: s.bullets,
  steps: s.steps,
});

export function importContent(items: WxrItem[], exportedAt: string, root: string) {
  const pages = items.filter((i) => i.type === "page" && i.status === "publish");
  const boilerplate = boilerplateHeadings(pages);
  const report: string[] = [];

  /* Info pages */
  const landingPath = join(root, "src/data/landing-pages.json");
  const landing: { id: string; path: string }[] = JSON.parse(readFileSync(landingPath, "utf8"));
  for (const def of INFO_PAGES) {
    const page = pages.find((p) => p.path === def.path);
    if (!page) {
      report.push(`info page ${def.path} not in the export`);
      continue;
    }
    const { lead, sections } = sectionize(page.content);
    const kept = sections.filter(
      (s) => (def.keepBoilerplate || !boilerplate.has(s.heading.toLowerCase())) && !(def.drop && def.drop.test(s.heading)),
    );
    const title = cleanTitle(page.title);
    // The intro is the page's first paragraph; a first section without own text becomes the intro.
    let intro = lead.intro[0] ?? lead.body[0];
    const rest = lead.intro.length ? lead.body : lead.body.slice(1);
    if (lead.intro.length) lead.intro = lead.intro.slice(1);
    if (!intro && kept[0]) {
      const from = kept[0].intro.length ? "intro" : "body";
      intro = kept[0][from][0] ?? "";
      kept[0] = { ...kept[0], [from]: kept[0][from].slice(1) };
    }
    const sectionsOut = [
      ...(rest.length || lead.bullets.length ? [{ heading: title, intro: lead.intro, body: rest, bullets: lead.bullets, steps: lead.steps }] : []),
      ...kept,
    ].filter((s) => s.intro.length || s.body.length || s.bullets.length || s.steps.length);
    for (const { after, sections } of def.ownerSections ?? []) {
      const at = sectionsOut.findIndex((s) => s.heading === after);
      if (at < 0) report.push(`${def.path}: owner text placed at the end, section "${after}" not found`);
      sectionsOut.splice(at < 0 ? sectionsOut.length : at + 1, 0, ...sections);
    }
    const record = {
      id: slugify(def.path.slice(1)),
      path: def.path,
      kind: "service",
      originalTitle: title,
      title,
      eyebrow: def.eyebrow,
      intro: intro ?? "",
      seo: seoFor(page, title, intro ?? ""),
      sections: sectionsOut.map(short),
      unconfirmed: [],
      legacyUrls: [`${def.path}/`],
      sources: [
        source(page, exportedAt),
        ...(def.ownerSource ? [{ ...def.ownerSource, verification: "owner-confirmed" as const }] : []),
      ],
    };
    const index = landing.findIndex((l) => l.path === def.path);
    if (index >= 0) landing[index] = record;
    else landing.push(record);
  }
  writeFileSync(landingPath, json(landing));

  /* FAQs */
  const faqPath = join(root, "src/data/faqs.json");
  const faqs: { id: string }[] = JSON.parse(readFileSync(faqPath, "utf8")).filter(
    (f: { id: string }) => !SUPERSEDED_FAQS.includes(f.id),
  );
  const topicFor = (q: string) => {
    const repair = repairForLabel(q);
    if (/garantie/i.test(q)) return { topics: ["garantie"], repairIds: [] };
    if (/kost|prijs/i.test(q)) return { topics: ["prijzen"], repairIds: [] };
    if (/data|gegevens/i.test(q)) return { topics: ["algemeen"], repairIds: [] };
    if (/onderdelen/i.test(q)) return { topics: ["onderdelen"], repairIds: ["scherm-vervangen", "batterij-vervangen"] };
    if (/laadt niet|opladen/i.test(q)) return { topics: ["reparaties"], repairIds: ["oplaadpoort-repareren"] };
    if (/komt omhoog/i.test(q)) return { topics: ["batterij"], repairIds: ["batterij-vervangen"] };
    if (repair && repair !== "overige-reparaties") return { topics: ["reparaties"], repairIds: [repair] };
    return { topics: ["algemeen"], repairIds: [] };
  };
  const wpFaqs = items
    .filter((i) => i.type === "helpie_faq" && i.status === "publish")
    .sort((a, b) => a.menuOrder - b.menuOrder || a.date.localeCompare(b.date))
    .map((i) => ({
      id: `faq-${shortSlug(i.slug, 40)}`,
      question: cleanTitle(i.title),
      answer: paragraphs(i.content),
      ...topicFor(i.title),
      sources: [{ ...source(i, exportedAt), url: `${ORIGIN}/veelgestelde-vragen/` , note: `Helpie FAQ "${cleanTitle(i.title)}", WordPress export ${exportedAt}.` }],
    }));
  const faqIds = new Set(wpFaqs.map((f) => f.id));
  writeFileSync(faqPath, json([...wpFaqs, ...faqs.filter((f) => !faqIds.has(f.id))]));

  /* Blog posts */
  const blogPath = join(root, "src/data/blog.json");
  type Blog = { id: string; slug: string; summary: string[]; excerpt?: string; legacyUrls: string[] };
  const blog: Blog[] = JSON.parse(readFileSync(blogPath, "utf8"));
  const posts = items
    .filter((i) => i.type === "blog_post" && i.status === "publish")
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const post of posts) {
    const bodyHtml = sanitizeArticle(post.content);
    const text = paragraphs(post.content).filter((p) => p.length > 60);
    const old = blog.find((b) => b.slug === post.slug);
    const record = {
      id: post.slug,
      slug: post.slug,
      title: cleanTitle(post.title),
      publishedAt: post.date.slice(0, 10),
      updatedAt: post.modified.slice(0, 10),
      excerpt: fit(cleanTitle(post.excerpt) || text[0] || "", 200),
      summary: old?.summary.length ? old.summary : text.slice(0, 2),
      bodyHtml,
      legacyUrls: [`/blog-post/${post.slug}/`],
      sources: [source(post, exportedAt)],
    };
    const index = blog.findIndex((b) => b.slug === post.slug);
    if (index >= 0) blog[index] = { ...blog[index], ...record };
    else blog.push(record);
  }
  // The export is leading: posts that are no longer published (e.g. in the trash) are removed.
  const published = new Set(posts.map((p) => p.slug));
  const removedBlogs = blog.filter((b) => !published.has(b.slug));
  writeFileSync(blogPath, json(blog.filter((b) => published.has(b.slug))));
  if (removedBlogs.length) {
    const enPath = join(root, "src/data/translations/en.json");
    const en = JSON.parse(readFileSync(enPath, "utf8"));
    for (const b of removedBlogs) delete en.blog[b.id];
    writeFileSync(enPath, json(en));
    report.push(`blog posts no longer published, removed: ${removedBlogs.map((b) => b.slug).join(", ")}`);
  }

  report.push(`content: ${INFO_PAGES.length} info pages, ${wpFaqs.length} FAQs, ${posts.length} blog posts`);
  return { report, removedBlogSlugs: removedBlogs.map((b) => b.slug) };
}
