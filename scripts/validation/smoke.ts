/**
 * End-to-end smoke test against a running server (dev or `next start`).
 * Checks routes, redirects, device finder flow, keyboard use, mobile navigation,
 * form validation, horizontal overflow, broken images and axe accessibility basics.
 *
 * Usage: BASE_URL=http://localhost:3000 npx tsx scripts/validation/smoke.ts
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium, type BrowserContext, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results: { name: string; ok: boolean; detail?: string }[] = [];

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, detail: e instanceof Error ? e.message.split("\n")[0] : String(e) });
  }
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

const ROUTES = [
  "/",
  "/reparaties",
  "/reparaties/apple",
  "/reparaties/apple/iphone-15-pro",
  "/reparaties/samsung/galaxy-s23",
  "/reparaties/apple/macbook-pro-m1-2021-14-a2442",
  "/reparaties/google/pixel-9",
  "/garantie",
  "/waterschade-reparatie-phone-repairs",
  "/verzekering",
  "/reparatie/scherm-vervangen",
  "/reparatie/waterschade",
  "/werkwijze",
  "/over-ons",
  "/veelgestelde-vragen",
  "/contact",
  "/afspraak",
  "/werkgebied",
  "/telefoon-reparatie-rosmalen",
  "/ipad-reparatie-waalwijk",
  "/nintendo-switch-reparatie",
  "/pre-owned-toestellen",
  "/veelgestelde-vragen/reparatie-opsturen",
  "/telefoon-en-tablet-hulp",
  "/gsm-reparatie-cromvoirt",
  "/iphone-reparatie-meierijstad",
  "/telefoon-reparatie-maaspoort",
  "/iphone-reparatie-waalwijk",
  "/telefoon-reparatie-eindhoven",
  "/telefoon-reparatie-lokerenpassage",
  "/blog-post",
  "/blog-post/ios-27-batterijproblemen",
  "/sitemap.xml",
  "/robots.txt",
  // English
  "/en",
  "/en/repairs",
  "/en/repairs/apple/iphone-15-pro",
  "/en/repair/screen-replacement",
  "/en/how-it-works",
  "/en/about",
  "/en/faq",
  "/en/faq/mail-in-repair",
  "/en/contact",
  "/en/appointment",
  "/en/service-area",
  "/en/telefoon-reparatie-rosmalen",
  "/en/blog",
  "/en/blog/ios-27-batterijproblemen",
  "/en/garantie",
];

const REDIRECTS: [string, string][] = [
  ["/over-phone-repairs/", "/over-ons"],
  ["/afspraak-maken/", "/afspraak"],
  ["/iphone-reparaties-oirschot/", "/telefoon-reparatie-oirschot"],
  // SEO audit HV Media (2026-10-13): old series and utility pages
  ["/pixel-9-serie/", "/reparaties/google"],
  ["/iphone-16-serie/", "/reparaties/apple"],
  ["/telefoon-reparatie-eindhoven-2/", "/telefoon-reparatie-eindhoven"],
  ["/moederbord-reparatie/", "/moederbord-reparatie-den-bosch"],
  // Old place URL not in the export (renamed page): matched by place
  ["/iphone-reparaties-vught/", "/telefoon-reparatie-vught"],
  // Kept URLs: the WordPress trailing slash goes in one step
  ["/garantie/", "/garantie"],
  ["/samsung-reparatie-den-bosch/samsung-s23/", "/reparaties/samsung/galaxy-s23"],
  // Original device, series and area URLs from the WordPress export
  ["/iphone-reparatie/iphone-15-pro/", "/reparaties/apple/iphone-15-pro"],
  ["/google-pixel-reparatie/google-pixel-9/", "/reparaties/google/pixel-9"],
  ["/huawei-reparatie-den-bosch/", "/reparaties/huawei"],
  ["/iphone-reparaties-rosmalen/", "/telefoon-reparatie-rosmalen"],
  ["/blog-post/wat-te-doen-bij-waterschade/", "/blog-post"],
  ["/iphone-reparatie/iphone-14-pro-max-3/", "/reparaties/apple/iphone-14-pro-max"],
  ["/nintendo-switch-reparatie-den-bosch/", "/nintendo-switch-reparatie"],
  ["/veelgestelde-vragen/phone-repairs-blog/", "/blog-post"],
  // Language routing: no public /nl prefix, Dutch segments in English URLs are translated.
  ["/nl/contact", "/contact"],
  ["/en/reparaties/apple", "/en/repairs/apple"],
  ["/en/reparatie/scherm-vervangen", "/en/repair/screen-replacement"],
];

/** Keeps the WhatsApp prompt from opening by itself, so it cannot cover what a test clicks. */
async function quietPrompt(context: BrowserContext) {
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("pr-whatsapp-prompt", "1");
    } catch {}
  });
}

const WA = "https://wa.me/31738220013";
const waText = (href: string | null) => (href ? decodeURIComponent(new URL(href).searchParams.get("text") ?? "") : "");

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `horizontal overflow of ${overflow}px`);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await quietPrompt(context);
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  for (const route of ROUTES) {
    await check(`GET ${route} → 200`, async () => {
      const res = await page.request.get(BASE + route);
      assert(res.status() === 200, `status ${res.status()}`);
    });
  }

  for (const path of [
    "/reparaties/apple/bestaat-niet",
    "/bestaat-niet",
    "/blog-post/bestaat-niet",
    "/veelgestelde-vragen/bestaat-niet",
    "/en/does-not-exist",
    "/en/repairs/apple/does-not-exist",
  ]) {
    await check(`unknown ${path} → 404`, async () => {
      const res = await page.request.get(BASE + path);
      assert(res.status() === 404, `status ${res.status()}`);
    });
  }

  for (const [from, to] of REDIRECTS) {
    await check(`redirect ${from} → ${to}`, async () => {
      // One permanent redirect straight to the target (no extra hop for the trailing slash).
      const first = await page.request.get(BASE + from, { maxRedirects: 0 });
      assert([301, 308].includes(first.status()), `status ${first.status()}`);
      assert(new URL(first.headers().location ?? "", BASE).pathname === to, `location ${first.headers().location}`);
      const res = await page.goto(BASE + from);
      assert(res?.ok(), "final response not ok");
      assert(new URL(page.url()).pathname === to, `ended at ${page.url()}`);
    });
  }

  await check("noindex is set (meta + header)", async () => {
    const res = await page.goto(BASE + "/");
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");
    assert(robotsMeta?.includes("noindex"), `meta robots: ${robotsMeta}`);
    assert(res?.headers()["x-robots-tag"]?.includes("noindex"), "missing X-Robots-Tag");
  });

  await check("layout: opening hours, review badges, disclaimer, no model counts", async () => {
    await page.goto(BASE + "/");
    await page.getByText(/altijd op afspraak/).first().waitFor();
    const footer = page.locator("footer");
    for (const name of ["algemene voorwaarden", "privacy policy"]) {
      const href = await footer.getByRole("link", { name }).getAttribute("href");
      const res = await page.request.get(BASE + href);
      assert(res.ok() && res.headers()["content-type"]?.includes("pdf"), `${name}: ${res.status()}`);
    }
    assert((await footer.getByRole("link", { name: "Toetsenbord vervangen" }).count()) === 0, "keyboard repair still in footer");
    for (const label of ["iPhone", "iPad", "MacBook"]) await footer.getByRole("link", { name: label, exact: true }).waitFor();
    assert(!/\b\d+\s+modellen\b/.test((await page.locator("main").textContent()) ?? ""), "model counts shown");
    await page.goto(BASE + "/contact");
    await page.locator("#openingstijden").getByText("Zondag").waitFor();
  });

  await check("mobile: Menu label and pinned WhatsApp/call bar", async () => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    await quietPrompt(ctx);
    const m = await ctx.newPage();
    await m.goto(BASE + "/");
    await m.getByRole("button", { name: /Menu openen/ }).getByText("Menu").waitFor();
    const bar = m.getByRole("navigation", { name: "Snel contact" });
    await m.mouse.wheel(0, 2500);
    await m.waitForTimeout(300);
    assert(await bar.getByRole("link", { name: /WhatsApp/ }).isVisible(), "WhatsApp button not visible after scrolling");
    assert(await bar.getByRole("link", { name: /Bellen/ }).isVisible(), "call button not visible after scrolling");
    await ctx.close();
  });

  await check("device page: verbatim price list from the current site", async () => {
    await page.goto(BASE + "/reparaties/apple/iphone-15-pro");
    const row = page.getByRole("listitem").filter({ hasText: "Scherm vervangen premium OLED" });
    await row.waitFor();
    assert(/€\s?210\b/.test((await row.textContent()) ?? ""), `row: ${await row.textContent()}`);
    await page.getByRole("heading", { name: "Batterij vervangen" }).waitFor();
    await page.getByRole("heading", { name: "Accessoires" }).waitFor();
    // "Meest gekozen" and the quality links, as in the original table (iPhone 14 Pro screenshot)
    await page.goto(BASE + "/reparaties/apple/iphone-14-pro");
    const pulled = page.getByRole("listitem").filter({ hasText: /^Scherm vervangen origineel pulled/ });
    await pulled.getByText("Meest gekozen").waitFor();
    assert((await pulled.getByRole("link", { name: "origineel pulled" }).getAttribute("href")) === "/iphone-onderdelen-kalibreren", "quality link");
  });

  await check("canonical + JSON-LD on device page", async () => {
    await page.goto(BASE + "/reparaties/apple/iphone-15-pro");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    assert(canonical?.endsWith("/reparaties/apple/iphone-15-pro"), `canonical ${canonical}`);
    const types = await page.$$eval('script[type="application/ld+json"]', (els) =>
      els.map((e) => JSON.parse(e.textContent ?? "{}")["@type"]),
    );
    for (const t of ["BreadcrumbList", "FAQPage", "Service", "MobilePhoneStore"]) {
      assert(types.includes(t), `missing ${t} (found ${types.join(", ")})`);
    }
  });

  await check("english: lang, canonical, hreflang and language switch", async () => {
    await page.goto(BASE + "/en/repairs/apple/iphone-15-pro");
    assert((await page.getAttribute("html", "lang")) === "en", "html lang is not en");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    assert(canonical?.endsWith("/en/repairs/apple/iphone-15-pro"), `canonical ${canonical}`);
    const nl = await page.locator('link[rel="alternate"][hreflang="nl"]').getAttribute("href");
    assert(nl?.endsWith("/reparaties/apple/iphone-15-pro"), `hreflang nl ${nl}`);
    await page.getByRole("link", { name: /Nederlands|NL/ }).first().click();
    await page.waitForURL((u) => u.pathname === "/reparaties/apple/iphone-15-pro");
    assert((await page.getAttribute("html", "lang")) === "nl", "switch did not land on Dutch page");
  });

  await check("english: 404 page is translated", async () => {
    // Own page: the expected 404 would otherwise count as a console error.
    const p = await context.newPage();
    const res = await p.goto(BASE + "/en/does-not-exist");
    assert(res?.status() === 404, `status ${res?.status()}`);
    await p.getByRole("heading", { name: "This page does not exist (anymore)." }).waitFor();
    await p.close();
  });

  await check("english: device finder and WhatsApp prefill in English", async () => {
    await page.goto(BASE + "/en?model=apple-iphone-15-pro&reparatie=scherm-vervangen#toestel-zoeken");
    await page.getByRole("heading", { name: "Screen replacement for your iPhone 15 Pro" }).waitFor();
    const href = await page.getByRole("link", { name: "Book via WhatsApp" }).getAttribute("href");
    assert(waText(href).startsWith("Hi Phone Repairs"), `prefill: ${waText(href)}`);
  });

  await check("device finder: full flow by clicking", async () => {
    await page.goto(BASE + "/#toestel-zoeken");
    const finder = page.locator("#toestel-zoeken");
    await finder.getByRole("button", { name: /Smartphones/ }).click();
    await finder.getByRole("button", { name: /^iPhone/ }).click();
    await finder.getByPlaceholder("Zoek een iPhone model").fill("15 pro max");
    const option = finder.getByRole("option", { name: /iPhone 15 Pro Max/ });
    await option.waitFor();
    assert((await finder.getByRole("option").count()) === 1, "search did not narrow to one model");
    await option.click();
    await finder.getByRole("button", { name: /Batterij vervangen/ }).click();
    await finder.getByText(/inclusief montage en btw/).waitFor();
    assert(/€\s?\d+/.test((await finder.locator("p.text-5xl").textContent()) ?? ""), "no published price shown");
    assert(page.url().includes("model=apple-iphone-15-pro-max"), `url not synced: ${page.url()}`);
    const href = await finder.getByRole("link", { name: /Afspraak via WhatsApp/ }).getAttribute("href");
    assert(href?.startsWith(`${WA}?text=`) && waText(href).includes("iPhone 15 Pro Max: batterij vervangen"), `cta ${href}`);
  });

  await check("device finder: back navigation and breadcrumbs", async () => {
    const finder = page.locator("#toestel-zoeken");
    await finder.getByRole("button", { name: "Terug", exact: true }).click();
    await finder.getByRole("heading", { name: /Wat is er mis met je iPhone 15 Pro Max/ }).waitFor();
    await finder.getByRole("navigation", { name: "Jouw keuze" }).getByRole("button", { name: "Smartphones" }).click();
    await finder.getByRole("heading", { name: /Welk merk smartphone/ }).waitFor();
  });

  await check("device finder: completed steps are clickable", async () => {
    const finder = page.locator("#toestel-zoeken");
    await finder.getByRole("button", { name: /Terug naar stap 1/ }).click();
    await finder.getByRole("heading", { name: "Wat wil je laten repareren?" }).waitFor();
  });

  await check("device finder: deep link restores selection", async () => {
    await page.goto(BASE + "/?model=samsung-galaxy-s23&reparatie=scherm-vervangen#toestel-zoeken");
    await page.locator("#toestel-zoeken").getByRole("heading", { name: /Scherm vervangen voor je Galaxy S23/ }).waitFor();
  });

  await check("device finder: global search with keyboard + empty state", async () => {
    await page.goto(BASE + "/#toestel-zoeken");
    const input = page.getByPlaceholder("Bijvoorbeeld iPhone 15 Pro of Galaxy S23");
    await input.fill("s23 ultra");
    await page.keyboard.press("Enter");
    await page.locator("#toestel-zoeken").getByRole("heading", { name: /Wat is er mis met je Galaxy S23 Ultra/ }).waitFor();
    await page.goto(BASE + "/#toestel-zoeken");
    await page.getByPlaceholder("Bijvoorbeeld iPhone 15 Pro of Galaxy S23").fill("nokia 3310");
    await page.getByText(/Geen model gevonden/).waitFor();
  });

  await check("iphone section: part chooser opens repair card with booking link", async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const section = page.locator('section[aria-labelledby="iphone-explode-title"]');
    await section.scrollIntoViewIfNeeded();
    await section.getByRole("button", { name: "Batterij", exact: true }).click();
    const card = page.getByRole("dialog", { name: "Batterij vervangen" });
    await card.waitFor();
    const href = await card.getByRole("link", { name: /Plan via WhatsApp/ }).getAttribute("href");
    assert(href?.startsWith(`${WA}?text=`) && waText(href).includes("iPhone 17: batterij vervangen"), `cta ${href}`);
    // The lowest price of the iPhone 17 battery rows on the current site, shown as "vanaf".
    assert(/vanaf\s*€\s?\d+/.test((await card.textContent()) ?? ""), "no 'vanaf' price from the price list");
    await page.keyboard.press("Escape");
    await card.waitFor({ state: "detached" });
  });

  await check("iphone section: scroll progress reaches exploded state and reverses", async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const section = page.locator('section[aria-labelledby="iphone-explode-title"]');
    const read = () => section.evaluate((el) => Number((el.firstElementChild as HTMLElement).style.getPropertyValue("--p")));
    const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const h = await section.evaluate((el) => (el as HTMLElement).offsetHeight);
    const vh = await page.evaluate(() => window.innerHeight);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top + h - vh);
    await page.waitForTimeout(300);
    const end = await read();
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await page.waitForTimeout(300);
    const start = await read();
    assert(end > 0.99 && start < 0.01, `progress start ${start} end ${end}`);
  });

  await check("appointment form: validation errors", async () => {
    await page.goto(BASE + "/afspraak");
    await page.getByRole("button", { name: "Afspraak aanvragen" }).click();
    await page.locator("form").getByRole("alert").waitFor();
    assert((await page.getByText("Vul je naam in.").count()) === 1, "name error missing");
    assert((await page.locator('[aria-invalid="true"]').count()) >= 4, "fields not marked invalid");
  });

  await check("appointment form: prefill + honest demo confirmation", async () => {
    await page.goto(BASE + "/afspraak?toestel=apple-iphone-15-pro&reparatie=scherm-vervangen");
    await page.waitForFunction(() => (document.querySelector("#device") as HTMLSelectElement)?.value === "apple-iphone-15-pro");
    assert((await page.locator("#repair").inputValue()) === "scherm-vervangen", "repair not prefilled");
    await page.fill("#name", "Test Persoon");
    await page.fill("#phone", "0612345678");
    await page.fill("#email", "test@example.com");
    await page.getByRole("button", { name: "Afspraak aanvragen" }).click();
    await page.getByRole("heading", { name: "Je aanvraag is nog niet verstuurd" }).waitFor();
    const mailto = await page.getByRole("link", { name: /Verstuur via e-mail/ }).getAttribute("href");
    assert(mailto?.startsWith("mailto:info@phonerepairs.nl"), `mailto ${mailto}`);
    const wa = await page.getByRole("link", { name: /Verstuur via WhatsApp/ }).getAttribute("href");
    assert(wa?.startsWith(`${WA}?text=`) && waText(wa).includes("Toestel: iPhone 15 Pro"), `whatsapp ${wa}`);
  });

  await check("send-in form: validation, honest result without mail service, print and fallbacks", async () => {
    await page.goto(BASE + "/veelgestelde-vragen/reparatie-opsturen");
    const form = page.locator("#opstuurformulier");
    await form.getByRole("button", { name: "Formulier versturen" }).click();
    await form.getByRole("alert").waitFor();
    assert((await form.locator('[aria-invalid="true"]').count()) >= 8, "fields not marked invalid");
    await form.getByLabel("Voor- en achternaam *").fill("Test Persoon");
    await form.getByLabel("Straat en huisnummer *").fill("Teststraat 1");
    await form.getByLabel("Postcode *").fill("1234 AB");
    await form.getByLabel("Woonplaats en land *").fill("Utrecht, Nederland");
    await form.getByLabel("Telefoonnummer *").fill("06 12345678");
    await form.getByLabel("E-mailadres *").fill("test@example.com");
    await form.getByLabel("Merk *").fill("Apple");
    await form.getByLabel("Model / type *").fill("iPhone 13");
    await form.getByLabel("Nee", { exact: true }).check();
    await form.getByLabel(/Omschrijf de klacht/).fill("Scherm gebarsten.");
    await form.getByLabel(/Ik geef toestemming/).check();
    await form.getByRole("button", { name: "Formulier versturen" }).click();
    // No mail service in the test environment: the form must never claim it was sent.
    await form.getByRole("heading", { name: "Je formulier is nog niet verstuurd" }).waitFor();
    assert(await form.getByRole("button", { name: "Formulier printen" }).isVisible(), "print button missing");
    const mailto = await form.getByRole("link", { name: /Verstuur via e-mail/ }).getAttribute("href");
    assert(mailto?.startsWith("mailto:info@phonerepairs.nl") && decodeURIComponent(mailto).includes("Model / type: iPhone 13"), `mailto ${mailto}`);
  });

  await check("garantie: exclusions show a cross, not a checkmark", async () => {
    await page.goto(BASE + "/garantie");
    const list = page.getByRole("heading", { name: "Wanneer vervalt de garantie?" }).locator("xpath=..");
    assert((await list.locator("svg.lucide-x").count()) >= 5, "no crosses");
    assert((await list.getByText(/^✕/).count()) === 0, "raw ✕ still shown");
    // Owner-supplied warranty text (e-mail 13 October).
    for (const heading of ["Wanneer geldt de garantie niet?", "Batterijgarantie", "Garantie op screenprotectors"]) {
      assert(await page.getByRole("heading", { name: heading }).isVisible(), `missing: ${heading}`);
    }
  });

  await check("seo: server HTML has correct language links, one H1 and clean titles", async () => {
    // Raw HTML as a crawler sees it (no JavaScript).
    const device = await (await fetch(BASE + "/reparaties/apple/iphone-15-pro")).text();
    assert(device.includes('href="/en/repairs/apple/iphone-15-pro"'), "language switch href wrong in server HTML");
    assert(!device.includes('href="/en/nl/'), "internal /nl path leaked into a link");
    const title = device.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    assert(!/bel:/i.test(title) && (title.match(/Den Bosch/g) ?? []).length <= 1, `title ${title}`);
    const home = await (await fetch(BASE + "/")).text();
    const h1s = home.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? [];
    assert(h1s.length === 1 && /Telefoon reparatie Den Bosch/.test(h1s[0]), `homepage h1: ${h1s.join(" | ")}`);
    const area = await (await fetch(BASE + "/iphone-reparatie-waalwijk")).text();
    assert(area.includes("Snelle en betrouwbare iPhone reparatie in Waalwijk"), "area page lacks its original text");
  });

  await check("theme: follows the device, switch toggles and remembers the choice", async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
    const p = await ctx.newPage();
    await p.goto(BASE + "/");
    const theme = () => p.evaluate(() => document.documentElement.dataset.theme);
    assert((await theme()) === "dark", "does not follow the device setting");
    await p.getByRole("button", { name: "Lichte weergave" }).click();
    assert((await theme()) === "light", "switch did not change the theme");
    await p.reload();
    assert((await theme()) === "light", "choice not remembered");
    await ctx.close();
  });

  await check("mail 6: altijd op afspraak, brand order, no duplicate buttons on mobile", async () => {
    await page.goto(BASE + "/");
    const html = await page.content();
    assert(!/alleen op afspraak/i.test(html), "'alleen op afspraak' still on the homepage");
    assert(/altijd op afspraak/i.test(html), "'altijd op afspraak' missing");
    await page.getByRole("button", { name: /Reparaties/ }).first().click();
    const menu = page.locator("header").getByText("Smartphones", { exact: true }).locator("xpath=..");
    const names = (await menu.getByRole("link").allTextContents()).map((s) => s.trim());
    const expected = ["iPhone", "Samsung", "Google", "OPPO", "OnePlus", "Xiaomi", "Poco", "Redmi", "Motorola", "Huawei", "Honor", "Nokia", "Sony", "Realme", "Asus"];
    assert(JSON.stringify(names) === JSON.stringify(expected), `menu order ${names.join(", ")}`);
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const m = await ctx.newPage();
    await m.goto(BASE + "/reparaties/apple/iphone-15-pro");
    const inPage = await m.locator("main").getByRole("link", { name: /^(WhatsApp ons|Bel 073)/ }).filter({ visible: true }).count();
    assert(inPage === 0, `${inPage} WhatsApp/Bel buttons in the page on mobile`);
    await ctx.close();
  });

  await check("whatsapp: header CTA and contact order on contact page", async () => {
    await page.goto(BASE + "/contact");
    const header = await page.locator("header").getByRole("link", { name: "WhatsApp ons" }).getAttribute("href");
    assert(header === WA, `header ${header}`);
    const intro = page.locator("main section").first();
    const links = await intro.getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    const order = ["wa.me", "tel:", "mailto:"].map((k) => links.findIndex((h) => h.includes(k)));
    assert(order.every((i) => i >= 0) && order[0] < order[1] && order[1] < order[2], `order ${links.join(" | ")}`);
  });

  await check("google reviews: Trustindex badge in the top bar and link in the trust section", async () => {
    await page.goto(BASE + "/");
    const link = page.getByRole("link", { name: "Bekijk alle reviews op Google" });
    assert((await link.getAttribute("href")) === "https://share.google/VZaMvnmVl8WfyaCh9", "reviews link");
    // The badge itself is rendered by Trustindex (external) once it scrolls into view; here we
    // check that the embed is in place, not the third-party service.
    assert((await page.locator('[data-reviews-badge="2b08aab83f291770e106912ec94"]').count()) === 1, "trustindex embed missing");
  });

  await check("kiyoh: review links on home and contact, feed key never in the page", async () => {
    for (const route of ["/", "/contact"]) {
      const res = await page.request.get(BASE + route);
      const html = await res.text();
      assert(html.includes("https://www.kiyoh.com/reviews/1047512/phone_repairs"), `no Kiyoh link on ${route}`);
      assert(!/feed\.xml\?hash=/.test(html), `Kiyoh feed URL leaked on ${route}`);
    }
  });

  await check("whatsapp: prompt opens by itself once, with the original copy", async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/reparaties/apple/iphone-15-pro", { waitUntil: "networkidle" });
    await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    const dialog = p.getByRole("dialog", { name: "WhatsApp met Phone Repairs" });
    await dialog.waitFor();
    await dialog.getByText("Gemiddelde reactietijd: 10 minuten.").waitFor();
    assert((await dialog.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href")) === WA, "panel link");
    await p.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await p.goto(BASE + "/reparaties/apple/iphone-16", { waitUntil: "networkidle" });
    await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await p.waitForTimeout(500);
    assert(!(await dialog.isVisible()), "prompt opened again in the same session");
    await p.getByRole("button", { name: "WhatsApp met Phone Repairs" }).click();
    await dialog.waitFor();
    await ctx.close();
  });

  await check("desktop mega menu opens and links", async () => {
    await page.goto(BASE + "/");
    await page.getByRole("button", { name: "Reparaties" }).click();
    const link = page.getByRole("link", { name: "Batterij vervangen" }).first();
    await link.waitFor();
    await link.click();
    await page.waitForURL(/\/reparatie\/batterij-vervangen/);
  });

  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await quietPrompt(mobile);
  const m = await mobile.newPage();
  await check("mobile navigation opens, expands and navigates", async () => {
    await m.goto(BASE + "/");
    await m.getByRole("button", { name: "Menu openen" }).click();
    const dialog = m.getByRole("dialog");
    await dialog.getByRole("button", { name: "Reparaties" }).click();
    await dialog.getByRole("link", { name: "Samsung" }).first().click();
    await m.waitForURL(/\/reparaties\/samsung/);
    assert((await m.getByRole("dialog").count()) === 0, "dialog did not close");
  });

  for (const width of [375, 768, 1024, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await quietPrompt(ctx);
    const p = await ctx.newPage();
    for (const route of ["/", "/reparaties/apple/iphone-15-pro", "/reparaties/samsung", "/afspraak", "/contact", "/en"]) {
      await check(`no horizontal overflow @${width}px ${route}`, async () => {
        await p.goto(BASE + route, { waitUntil: "networkidle" });
        await noHorizontalOverflow(p);
      });
    }
    await ctx.close();
  }

  await check("no broken images", async () => {
    const broken: string[] = [];
    for (const route of ["/", "/reparaties/apple/iphone-15-pro", "/over-ons"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      broken.push(
        ...(await page.$$eval("img", (imgs) =>
          imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
        )),
      );
    }
    assert(broken.length === 0, `broken: ${broken.join(", ")}`);
  });

  for (const route of ["/", "/reparaties/apple/iphone-15-pro", "/afspraak", "/veelgestelde-vragen", "/veelgestelde-vragen/reparatie-opsturen", "/telefoon-en-tablet-hulp", "/en", "/en/appointment"]) {
    await check(`axe: no serious/critical violations on ${route}`, async () => {
      // Measure the final colours, not text halfway through its scroll-in fade.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      assert(
        serious.length === 0,
        serious.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`).join("; "),
      );
    });
  }

  await check("no console errors during run", async () => {
    const relevant = consoleErrors.filter((e) => !e.includes("Download the React DevTools"));
    assert(relevant.length === 0, relevant.slice(0, 3).join(" | "));
  });

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
