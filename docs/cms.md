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

Not in the CMS (on purpose): prices (only from the shop's price lists), devices and price lists
(WordPress import), redirects (`src/data/url-inventory.json`), blog posts and FAQs (phase 2, see
below). The admin itself is in English (Keystatic has no Dutch UI); field labels and help texts
are Dutch.

## How it fits in the code

- `keystatic.config.ts` — collections and fields.
- `npm run content` (`scripts/content/build-content.ts`) merges `src/content/` into
  `src/data/generated/landing-pages.json` and `seo-overrides.json` (git-ignored). It runs before
  `dev`, `build` and `check`. It fills defaults for pages made in the CMS: a source
  ("owner-confirmed", the page's own URL), the SEO title/description from title/intro, focus
  "telefoon" for area pages.
- `npm run validate:data` stops the build on mistakes (unknown SEO path, area page without
  place, path colliding with a route, title > 70 characters…), so a broken edit never goes live:
  Vercel keeps the previous version. A page without English is only a warning (/en shows Dutch).
- `src/app/keystatic` (admin, own root layout) and `src/app/api/keystatic` (API). Outside
  development the admin only runs when GitHub storage is configured (`src/lib/cms.ts`); until
  then /keystatic shows "Beheer nog niet gekoppeld" and the API answers 404.
- The WordPress importer now writes the page files in `src/content/pages/`. **After launch, do
  not run `npm run import:wordpress -- --write` again**: it would overwrite pages edited in the CMS.

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

- FAQs and blog posts in the CMS (blog bodies are HTML now; new posts would use the CMS editor).
- Redirects in the CMS, for link-building results.
- English fields for pages created in the CMS.
