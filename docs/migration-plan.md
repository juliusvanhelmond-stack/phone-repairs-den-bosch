# Migration plan — phonerepairs.nl → new site

Goal: move **all** relevant content of the current site (reportedly 1,000+ pages) to the new
Next.js site without losing rankings, content or correctness. The Phase 1 demo is **not** a migration:
it only shows the design and the architecture. Coverage is tracked in `docs/content-inventory.md`.

## 1. Get the source content (in order of preference)

1. **Authorized WordPress export** (most reliable). The site looks like WordPress (URL patterns with
   trailing slashes, `/veelgestelde-vragen/<slug>/`). Ask the owner/host for:
   - a WXR export (WP admin → Tools → Export → All content), and
   - the price source: if prices live in a plugin/table (e.g. a repair-price plugin, ACF fields or
     WooCommerce), an export of that table. Scraping rendered prices is the least reliable option.
2. **Public WordPress REST API** (`/wp-json/wp/v2/pages|posts`) if enabled — the discovery script
   already tries it.
3. **Polite crawl** (`npm run migrate`), respecting robots.txt, 1 request/second, cached on disk.
   Never bypass access controls, logins or anti-bot protection. In the Phase 1 environment the site
   was unreachable (egress policy), so this has not run yet.

## 2. Pipeline

| Step | Command | Output |
| --- | --- | --- |
| Discover URLs (seed, robots sitemaps, WP REST, bounded crawl) | `npm run discover` | `data/raw/discovered.json` |
| Fetch pages into cache | `npm run migrate:fetch` | `data/raw/html/*.json`, `data/raw/fetch-log.json` |
| Parse and normalize | `npm run migrate:parse` | `data/normalized/pages.json` |
| Dedupe, conflicts, price candidates | `npm run migrate:analyze` | `data/normalized/analysis.json`, `price-candidates.json` |
| Reports | `npm run report` | `docs/content-inventory.md`, `docs/url-mapping.csv`, `docs/data-gaps.md` |

Principles:
- Every record keeps its original URL (`sources[]`, `legacyUrls[]`).
- Unknown fields go to `extra`; nothing is silently dropped.
- Price candidates are **never** auto-published. A person reviews each one, then it is added to
  `src/data/prices.json` with `verified: true` and a `verified-source` or `owner-confirmed` source.
  `npm run validate:data` blocks the build otherwise.
- Conflicts (prices, warranty) are listed in `docs/data-gaps.md` and resolved with the owner.

## 3. URL strategy

- Device pages move from `/<brand>-reparatie-den-bosch/<model>/` to `/reparaties/<brand>/<model>`;
  brand pages to `/reparaties/<brand>`; info pages to short Dutch paths (`/over-ons`, `/afspraak`).
- Every changed path gets a **301** generated from `src/data/url-inventory.json` (`next.config.ts`).
- Area landing pages (`/telefoon-reparatie-rosmalen/` etc.) and strong local pages
  (`/telefoon-reparatie-den-bosch/`) should **keep their original URL** with an area template, because
  they carry local search intent. Decide per page before launch.
- Open decision: the new site strips trailing slashes, so an old URL first gets a 308 to the
  no-slash form and then the 301. Before launch either set `trailingSlash: true` (all URLs keep
  WordPress style) or add slash-variants to the redirect list to make it a single hop.

## 4. Launch checklist

- [ ] Full crawl or export imported; `docs/content-inventory.md` shows every URL as migrated, redirected or consciously excluded
- [ ] All prices reviewed (`verified: true`) or consciously shown as "op aanvraag"
- [ ] Warranty terms confirmed by owner
- [ ] WhatsApp number, postal code, opening hours confirmed
- [ ] Original about/area/FAQ/blog copy migrated
- [ ] Real photography added (shop, repairs) with licences
- [ ] Booking integration chosen (agenda tool, e-mail via server action, or both)
- [ ] `NEXT_PUBLIC_ALLOW_INDEXING=true`, `NEXT_PUBLIC_DEMO_MODE=false` on production only
- [ ] Redirects tested against the full `url-mapping.csv`; Search Console sitemap submitted
