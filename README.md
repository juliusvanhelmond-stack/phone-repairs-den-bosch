# Phone Repairs Den Bosch — website redesign (demo)

Design and architecture proposal by **JUNE Studio** for [Phone Repairs](https://www.phonerepairs.nl), a repair shop for smartphones, tablets and MacBooks in Den Bosch.

> **Status: Phase 1 demo.** It is not indexed by search engines and shows no prices yet. The original website has not been migrated yet, see [docs/data-gaps.md](docs/data-gaps.md).

## What's in the demo

- **Homepage**: hero, device finder, popular repairs, why Phone Repairs, how it works, brands, popular models, about, FAQ, location and contact.
- **Device finder**: four steps (device → brand → model → repair) to the result, with search, keyboard control and shareable URLs.
- **Dynamic pages**:
  - `/reparaties` (overview);
  - `/reparaties/[brand]` (one page per brand);
  - `/reparaties/[brand]/[model]` (139 models);
  - `/reparatie/[repair]` (one page per repair type);
  - plus Werkwijze, Over ons, FAQ, Contact and Afspraak.
- **Appointment form**: validates input and prefills device and repair from the device finder. It says honestly that nothing is sent yet, because no backend is connected.
- **SEO**:
  - canonical URLs, metadata per page and JSON-LD (MobilePhoneStore, BreadcrumbList, FAQPage, Service);
  - sitemap and robots;
  - 301 redirects from the old URLs;
  - noindex until launch.
- **Migration foundation**: typed content model with source tracking, plus a crawler and parser pipeline with reports.

## Running locally

Requirements: Node 20.9+.

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Quality checks

```bash
npm run check          # typecheck + lint + data validation + parser test
npm run build          # production build (runs data validation first)
npm start &            # then, in a second terminal:
npm run test:smoke     # Playwright E2E: routes, redirects, finder, form, mobile nav, overflow at 4 widths, axe
npm run screenshots    # docs/screenshots at 375/768/1024/1440 px
```

The Playwright scripts use the installed Chromium. If no browser is present, run `npx playwright install chromium` first.

## Content migration

```bash
npm run migrate        # discover → fetch → parse → analyze → report
```

See [docs/migration-plan.md](docs/migration-plan.md). An authorized WordPress export is preferable to crawling. Generated reports:

- [docs/content-inventory.md](docs/content-inventory.md)
- [docs/url-mapping.csv](docs/url-mapping.csv)
- [docs/data-gaps.md](docs/data-gaps.md)

## Deploy (preview)

The project is standard Next.js and runs on Vercel without extra configuration:

1. Import the repo in Vercel (framework: Next.js).
2. Environment variables for preview/demo:
   - `NEXT_PUBLIC_ALLOW_INDEXING=false`
   - `NEXT_PUBLIC_DEMO_MODE=true`
   - `NEXT_PUBLIC_SITE_URL=https://<preview-domain>`
3. Do **not** connect the production domain until the launch checklist in `docs/migration-plan.md` is complete.

Self-hosting is also possible with `npm run build && npm start` on Node 20.9+.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS v4, next/image;
- shadcn/ui-style components on Radix, Lucide icons, Motion, cmdk, react-hook-form, zod, Geist.

Photos come from the Adobe Stock Free Collection, see [docs/image-credits.md](docs/image-credits.md).

Project conventions and content rules are in [CLAUDE.md](CLAUDE.md).
