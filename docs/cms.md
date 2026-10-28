# CMS — Keystatic

Answer to HV Media's question (2026-10-13): the shop and its SEO agency can edit texts, titles
and pages themselves, without a developer. Built on branch `claude/keystatic-cms`.

## What it is

[Keystatic](https://keystatic.com) (open source, free) is an admin at **/keystatic** that edits
the content files in this repository. There is no database: every save is a Git commit, after
which Vercel rebuilds the site (a few minutes). Every change is in the Git history and can be
reverted.

| In the CMS | Where it lives | Notes |
| --- | --- | --- |
| **Pagina's**: area (place) pages, info pages, FAQ topics — title, intro, text blocks, SEO title and description; new pages can be added | `src/content/pages/<id>.json` | New area pages appear on /werkgebied and in the sitemap automatically. |
| **SEO per URL**: title and meta description for *any* page (models, brands, repairs, homepage, …) | `src/content/seo/<path>.json` | Applied in `pageMetadata` (Dutch only). Used exactly as written. |
| **Mededeling bovenaan**: a green bar above the site (holidays, changed hours), switched on/off with a checkbox | `src/content/announcement.json` | Optional link (site path or full URL). Nothing shows when it is off. |
| **Tarieven** in page blocks: rate lists (label + amount as written, e.g. €15,-) | in the page file | Used on /telefoon-en-tablet-hulp and /pre-owned-toestellen so the shop can change amounts itself (client request, 2026-10-16). |
| **Toestellen en prijzen**: every device (name, brand, kind, series, order, year, example image, "popular", search names, SEO) with its price list (description, price text, repair, "Meest gekozen", links); new devices can be added | `src/content/toestellen/<url-naam>.json` | Client request 2026-10-21. Prices are typed as €130,- (whole euros), "op aanvraag" or "verwacht"; an unreadable price stops the build with a clear message. Rows set to "Automatisch" get their repair from the description, like the import. Provenance (old URLs, sources) is kept in the file but not shown. |
| **Blog**: posts with headings, lists, links and images; new posts can be added | `src/content/blog/<url-naam>.mdoc` (Markdoc), images in `public/images/blog/` | Client request 2026-10-21. A YouTube link on its own line becomes a video. Without a summary the start of the text is used. Posts without an English version show Dutch on /en (warning only). |
| **Veelgestelde vragen**: vraag, antwoord, volgorde en de reparaties waar de vraag bij hoort | `src/content/faq/<id>.json` | Client request 2026-10-27. The first six (lowest order) are on the homepage; a question linked to a repair also shows on that repair's page and on device pages, general questions everywhere. Questions without an English version show Dutch on /en (warning only). |
| **Openingstijden**: hours per day (or closed) and the note below them | `src/content/openingstijden.json` | Client request 2026-10-21. Read by `site.openingHours` (top bar, contact, structured data). |

Deleting a device or blog post in the CMS is safe: its old URLs then 301 to the brand overview or the blog (`src/lib/legacy-targets.ts`; the data check only warns).

Since 2026-10-21 the CMS is the source of devices, prices and blog posts: the shop maintains them there
instead of on the old site. Not in the CMS: redirects (`src/data/url-inventory.json`), brands and repair
categories, FAQs. The admin itself is in English (Keystatic has no Dutch UI); field labels and help texts
are Dutch.

## How it fits in the code

- `keystatic.config.ts` — collections and fields.
- `npm run content` (`scripts/content/build-content.ts`) merges `src/content/` into
  `src/data/generated/` (landing pages, SEO overrides, devices, price lists, blog posts rendered
  to HTML; git-ignored). It runs before
  `dev`, `build` and `check`. It fills defaults for pages made in the CMS: a source
  ("owner-confirmed", the page's own URL), the SEO title/description from title/intro, focus
  "telefoon" for area pages.
- `npm run validate:data` stops the build on mistakes (unknown SEO path, area page without
  place, path colliding with a route, title > 70 characters…), so a broken edit never goes live:
  Vercel keeps the previous version. A page without English is only a warning (/en shows Dutch).
- `src/app/keystatic` (admin, own root layout) and `src/app/api/keystatic` (API). Outside
  development the admin only runs when GitHub storage is configured (`src/lib/cms.ts`); until
  then /keystatic shows "Beheer nog niet gekoppeld" and the API answers 404.
- The WordPress importer writes the page and device files in `src/content/pages/` and
  `src/content/toestellen/` (blog posts are no longer imported). **Now that the shop edits devices and
  prices in the CMS, do not run `npm run import:wordpress -- --write` again**: it would overwrite
  those edits. Make changes in the CMS files instead.

## Working locally

`npm run dev` → http://localhost:3000/keystatic edits the files on disk (no login). Commit them as usual.

## Going online (one-time, by the repository owner)

The CMS code is on the demo branch (`claude/vigilant-archimedes-gadg6d`, deployed at
https://phone-repairs-den-bosch.vercel.app). Two ways to create the GitHub App:

**A. Prefilled link (no local setup).** Logged in to GitHub as the repository owner, open
[this link](https://github.com/settings/apps/new?name=Phone+Repairs+Keystatic&description=CMS+%28Keystatic%29+voor+phone-repairs-den-bosch&url=https%3A%2F%2Fphone-repairs-den-bosch.vercel.app%2Fkeystatic&callback_urls%5B%5D=https%3A%2F%2Fphone-repairs-den-bosch.vercel.app%2Fapi%2Fkeystatic%2Fgithub%2Foauth%2Fcallback&callback_urls%5B%5D=http%3A%2F%2F127.0.0.1%2Fapi%2Fkeystatic%2Fgithub%2Foauth%2Fcallback&request_oauth_on_install=true&public=true&webhook_active=false&contents=write&metadata=read&pull_requests=read)
(name, callback URLs and permissions are filled in: Contents read/write, Metadata read, Pull
requests read; no webhook) and click "Create GitHub App". Then, on the app page:
- copy the **Client ID** → `KEYSTATIC_GITHUB_CLIENT_ID`;
- "Generate a new client secret" → `KEYSTATIC_GITHUB_CLIENT_SECRET` (shown once);
- the last part of the app's URL (`github.com/apps/<slug>`) → `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`;
- "Install App" → only the repository `phone-repairs-den-bosch`.

`KEYSTATIC_SECRET` is any random string of at least 32 characters (e.g. `openssl rand -hex 32`
or a password manager). Continue with step 2.

**B. Through Keystatic (needs a local checkout).**

1. Run `npm run dev`, open http://localhost:3000/keystatic and switch the storage to GitHub:
   set `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` in `.env.local` first, then follow the screens
   ("Create GitHub App"). Keystatic creates a GitHub App under your account, asks which
   repository it may use (only `phone-repairs-den-bosch`) and writes
   `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` to `.env`. These are secrets: never commit them.
2. In Vercel → Project → Settings → Environment Variables, add those four plus
   `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` (and `NEXT_PUBLIC_KEYSTATIC_REPO=owner/name` if the
   repository moves), then redeploy.
3. In the GitHub App settings, add the production callback URL:
   `https://<domain>/api/keystatic/github/oauth/callback` (and the Vercel preview URL if you
   want to use the CMS there).
4. Editors: each person needs a (free) GitHub account with **write access** to the repository
   (GitHub → repository → Settings → Collaborators). They log in at `/keystatic` with GitHub.
   Keystatic Cloud can replace GitHub logins; check its current pricing first.

Edits are committed to the branch selected in the admin. Pick the branch Vercel deploys as
production (or work on a separate branch and merge after review, if you want a check first).

## Phase 2 (not built yet)

- FAQs in the CMS.
- Redirects in the CMS, for link-building results.
- English fields for pages created in the CMS.
