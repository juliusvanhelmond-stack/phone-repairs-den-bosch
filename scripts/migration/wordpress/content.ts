/**
 * Text content from the WordPress export: info pages as sections, FAQ answers and blog bodies.
 * Text is kept word for word; only page furniture is dropped (call-to-action buttons,
 * address blocks, shortcodes, forms) plus blocks that recur on many pages ("boilerplate").
 */
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import type { WxrItem } from "./wxr";

/** `intro` holds paragraphs that come before the list; `body` the rest (template order: intro, list, body). */
export type Section = { heading: string; intro: string[]; body: string[]; bullets: string[]; steps: string[] };

const hasList = (s: Section) => s.bullets.length > 0 || s.steps.length > 0;
const pushText = (s: Section, text: string) => {
  if (!isCaption(text)) (hasList(s) ? s.body : s.intro).push(text);
};

const clean = (s: string) =>
  s
    .replace(/[‪-‮​﻿]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?)])/g, "$1")
    .trim();

/** Furniture: CTA buttons, address blocks, shortcodes, forms and promo codes. */
const FURNITURE =
  /^(whatsapp ons|☎|bel direct|bezoekadres|wij repareren o\.a\. voor|gemiddelde reactietijd|whatsapp met phone repairs|bel: ?073|gebruik van onze website en\/of onze)|\[[a-z_]+[^\]]*\]|meld hieronder|code: [A-Z]{4,}|^[<>/p\s]+$/i;

const BLOCK = "h[1-6]|ul|ol|li|div|table|thead|tbody|tr|td|th|p|blockquote|figure|form|section|main";

/**
 * WordPress "autop": the editor stores text with newlines instead of <p> tags.
 * Every text line between block tags becomes its own paragraph.
 */
export function autop(html: string): string {
  const isolated = html
    .replace(/\r/g, "")
    .replace(new RegExp(`(<\\/?(?:${BLOCK})\\b[^>]*>)`, "gi"), "\n$1\n")
    .replace(/<br\s*\/?>/gi, "\n");
  let depthInline = 0;
  return isolated
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (new RegExp(`^<\\/?(?:${BLOCK})\\b`, "i").test(line)) {
        if (/^<(p|h[1-6]|li|td|th)\b/i.test(line)) depthInline++;
        if (/^<\/(p|h[1-6]|li|td|th)\b/i.test(line)) depthInline = Math.max(0, depthInline - 1);
        return line;
      }
      // Inside a paragraph, heading or list item the line already has a container.
      return depthInline > 0 ? `${line}<br>` : `<p>${line}</p>`;
    })
    .join("\n")
    .replace(/<br>\s*(<\/(?:p|h[1-6]|li|td|th)>)/gi, "$1");
}

/** Image captions and pseudo-headings: short lines without sentence punctuation. */
const isCaption = (text: string) => text.length < 80 && !/[.!?:;]/.test(text);

const isFurniture = (text: string) =>
  !text || FURNITURE.test(text) || /^[\s\u00a0]*$/.test(text) || /data-mce|^</.test(text) || /^hieronder vind je handige links/i.test(text);

function walk($: cheerio.CheerioAPI, nodes: AnyNode[], out: Section[], current: { s: Section }) {
  for (const node of nodes) {
    if (node.type !== "tag") {
      if (node.type === "text") {
        const t = clean($(node).text());
        if (!isFurniture(t)) pushText(current.s, t);
      }
      continue;
    }
    const el = $(node);
    const tag = node.tagName.toLowerCase();
    if (["script", "style", "form", "table", "img", "figure", "iframe", "noscript"].includes(tag)) continue;
    if (el.find('a[href^="https://wa.me"], a[href^="tel:"]').length && clean(el.text()).length < 80) continue;
    if (/^h[1-6]$/.test(tag)) {
      const heading = clean(el.text());
      if (!heading || isFurniture(heading)) continue;
      current.s = { heading, intro: [], body: [], bullets: [], steps: [] };
      out.push(current.s);
    } else if (tag === "ul" || tag === "ol") {
      const items = el
        .children("li")
        .map((_, li) => clean($(li).text()))
        .get()
        .filter((t) => !isFurniture(t));
      (tag === "ol" ? current.s.steps : current.s.bullets).push(...items);
    } else if (tag === "p") {
      const t = clean(el.text());
      if (!isFurniture(t)) pushText(current.s, t);
    } else {
      walk($, el.contents().toArray(), out, current);
    }
  }
}

/** Splits a page into sections at its headings; text before the first heading goes to `intro`. */
export function sectionize(html: string): { lead: Section; sections: Section[] } {
  const $ = cheerio.load(`<main>${autop(html)}</main>`);
  const lead: Section = { heading: "", intro: [], body: [], bullets: [], steps: [] };
  const sections: Section[] = [];
  walk($, $("main").contents().toArray(), sections, { s: lead });
  // Without a list the split is meaningless: all paragraphs are body.
  for (const s of [lead, ...sections]) {
    if (!hasList(s)) {
      s.body = [...s.intro, ...s.body];
      s.intro = [];
    }
  }
  return {
    lead,
    sections: sections.filter((s) => s.intro.length || s.body.length || hasList(s)),
  };
}

/** Headings that appear on many pages are site-wide blocks, not page content. */
export function boilerplateHeadings(pages: WxrItem[], min = 5): Set<string> {
  const counts = new Map<string, number>();
  for (const p of pages) {
    for (const h of new Set(sectionize(p.content).sections.map((s) => s.heading.toLowerCase()))) {
      counts.set(h, (counts.get(h) ?? 0) + 1);
    }
  }
  return new Set([...counts].filter(([, n]) => n >= min).map(([h]) => h));
}

/** Plain paragraphs of a short answer (FAQ). */
export function paragraphs(html: string): string[] {
  const { lead, sections } = sectionize(html);
  return [lead, ...sections]
    .flatMap((s) => [s.heading, ...s.intro, ...s.bullets.map((b) => `– ${b}`), ...s.steps.map((b, i) => `${i + 1}. ${b}`), ...s.body])
    .filter(Boolean);
}

const ORIGIN_LINK = /^https?:\/\/(www\.)?phonerepairs\.nl/i;

/**
 * Blog body reduced to safe, unstyled HTML: headings, paragraphs, lists, emphasis and links.
 * Links to the old site become relative (the 301s take them to the new pages); images are dropped.
 */
export function sanitizeArticle(html: string): string {
  const $ = cheerio.load(`<main>${autop(html)}</main>`);
  const allowed = new Set(["h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "b", "em", "i", "a", "br", "blockquote"]);
  $("script, style, form, iframe, img, figure, table, noscript").remove();
  $("main *").each((_, node) => {
    if (node.type !== "tag") return;
    const el = $(node);
    const tag = node.tagName.toLowerCase();
    if (tag === "h1") node.tagName = "h2";
    if (!allowed.has(node.tagName)) {
      el.replaceWith(el.contents());
      return;
    }
    const href = tag === "a" ? el.attr("href") : undefined;
    for (const attr of Object.keys(node.attribs)) el.removeAttr(attr);
    if (href) {
      const local = href.replace(ORIGIN_LINK, "");
      if (/^(\/|https:\/\/)/.test(local)) el.attr("href", local || "/");
      if (local.startsWith("https://")) el.attr("rel", "noopener noreferrer");
    }
  });
  $("p").each((_, p) => {
    const el = $(p);
    const text = clean(el.text());
    if (!text || isFurniture(text)) el.remove();
  });
  return clean($("main").html() ?? "").replace(/>\s+</g, "><");
}
