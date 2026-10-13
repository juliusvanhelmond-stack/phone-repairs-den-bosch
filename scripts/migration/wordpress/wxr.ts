/**
 * Minimal reader for a WordPress eXtended RSS (WXR) export.
 * Only public content is read: no authors, e-mail addresses, comments or passwords.
 */
import { readFileSync } from "node:fs";
import * as cheerio from "cheerio";

export type WxrItem = {
  id: string;
  type: string;
  status: string;
  title: string;
  link: string;
  /** Path without origin, with trailing slash removed ("/iphone-reparatie/iphone-15-pro"). */
  path: string;
  slug: string;
  parentId: string;
  menuOrder: number;
  date: string;
  modified: string;
  content: string;
  excerpt: string;
  meta: Record<string, string>;
  categories: { domain: string; name: string }[];
};

const ORIGIN_RE = /^https?:\/\/(?:www\.)?phonerepairs\.nl/i;

export function toPath(url: string): string {
  const path = url.replace(ORIGIN_RE, "").split(/[?#]/)[0] || "/";
  return path === "/" ? "/" : path.replace(/\/+$/, "");
}

export function readWxr(file: string): { items: WxrItem[]; exportedAt: string } {
  const $ = cheerio.load(readFileSync(file, "utf8"), { xml: true });
  const text = (el: cheerio.Cheerio<never>, tag: string) => el.children(tag.replace(":", "\\:")).first().text();
  const items: WxrItem[] = [];
  $("channel > item").each((_, node) => {
    const el = $(node) as unknown as cheerio.Cheerio<never>;
    const meta: Record<string, string> = {};
    $(node)
      .children("wp\\:postmeta")
      .each((__, m) => {
        meta[$(m).children("wp\\:meta_key").text()] = $(m).children("wp\\:meta_value").text();
      });
    const link = text(el, "link");
    items.push({
      id: text(el, "wp:post_id"),
      type: text(el, "wp:post_type"),
      status: text(el, "wp:status"),
      title: text(el, "title"),
      link,
      path: toPath(link),
      slug: text(el, "wp:post_name"),
      parentId: text(el, "wp:post_parent"),
      menuOrder: Number(text(el, "wp:menu_order") || 0),
      date: text(el, "wp:post_date"),
      modified: text(el, "wp:post_modified"),
      content: text(el, "content:encoded"),
      excerpt: text(el, "excerpt:encoded"),
      meta,
      categories: $(node)
        .children("category")
        .map((__, c) => ({ domain: $(c).attr("domain") ?? "", name: $(c).text() }))
        .get(),
    });
  });
  const pubDate = $("channel > pubDate").first().text();
  return { items, exportedAt: new Date(pubDate).toISOString().slice(0, 10) };
}

export type MenuNode = { id: string; label: string; path: string | null; pageId: string | null; children: MenuNode[] };

/** Rebuilds a navigation menu as a tree, labels falling back to the linked page title. */
export function readMenu(items: WxrItem[], menuName: string): MenuNode[] {
  const pages = new Map(items.filter((i) => i.type === "page").map((i) => [i.id, i]));
  const entries = items
    .filter(
      (i) =>
        i.type === "nav_menu_item" &&
        i.status === "publish" &&
        i.categories.some((c) => c.domain === "nav_menu" && c.name === menuName),
    )
    .sort((a, b) => a.menuOrder - b.menuOrder);
  const nodes = new Map<string, MenuNode & { parent: string }>();
  for (const e of entries) {
    const page = e.meta._menu_item_type === "post_type" ? pages.get(e.meta._menu_item_object_id) : undefined;
    const url = page?.link ?? e.meta._menu_item_url ?? "";
    nodes.set(e.id, {
      id: e.id,
      label: (e.title || page?.title || "").replace(/\s+/g, " ").trim(),
      path: url && url !== "#" ? toPath(url) : null,
      pageId: page?.id ?? null,
      parent: e.meta._menu_item_menu_item_parent ?? "0",
      children: [],
    });
  }
  const roots: MenuNode[] = [];
  for (const node of nodes.values()) {
    const parent = nodes.get(node.parent);
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}

/** Plain text of an HTML fragment (entities decoded, whitespace collapsed, bidi marks removed). */
export function htmlText(html: string): string {
  return cheerio
    .load(`<div>${html.replace(/<br\s*\/?>/gi, " ")}</div>`)("div")
    .text()
    .replace(/[‪-‮​]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** All tables of a page as rows of cell texts. */
export function readTables(html: string): string[][][] {
  const $ = cheerio.load(html);
  return $("table")
    .map((_, table) => [
      $(table)
        .find("tr")
        .map((__, tr) => [
          $(tr)
            .find("td, th")
            .map((___, td) => htmlText($(td).html() ?? ""))
            .get(),
        ])
        .get()
        .filter((cells: string[]) => cells.some(Boolean)),
    ])
    .get() as string[][][];
}
