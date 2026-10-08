/**
 * End-to-end smoke test against a running server (dev or `next start`).
 * Checks routes, redirects, device finder flow, keyboard use, mobile navigation,
 * form validation, horizontal overflow, broken images and axe accessibility basics.
 *
 * Usage: BASE_URL=http://localhost:3000 npx tsx scripts/validation/smoke.ts
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium, type Page } from "playwright";

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
  "/reparaties/apple/macbook-air-13-inch-m2-2022",
  "/reparatie/scherm-vervangen",
  "/reparatie/waterschade",
  "/werkwijze",
  "/over-ons",
  "/veelgestelde-vragen",
  "/contact",
  "/afspraak",
  "/sitemap.xml",
  "/robots.txt",
];

const REDIRECTS: [string, string][] = [
  ["/over-phone-repairs/", "/over-ons"],
  ["/afspraak-maken/", "/afspraak"],
  ["/samsung-reparatie-den-bosch/samsung-s23/", "/reparaties/samsung/galaxy-s23"],
];

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `horizontal overflow of ${overflow}px`);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

  await check("unknown device → 404", async () => {
    const res = await page.request.get(`${BASE}/reparaties/apple/bestaat-niet`);
    assert(res.status() === 404, `status ${res.status()}`);
  });

  for (const [from, to] of REDIRECTS) {
    await check(`redirect ${from} → ${to}`, async () => {
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

  await check("device finder: full flow by clicking", async () => {
    await page.goto(BASE + "/#toestel-zoeken");
    const finder = page.locator("#toestel-zoeken");
    await finder.getByRole("button", { name: /Smartphones/ }).click();
    await finder.getByRole("button", { name: /^Apple/ }).click();
    await finder.getByPlaceholder("Zoek een Apple model").fill("15 pro max");
    const option = finder.getByRole("option", { name: /iPhone 15 Pro Max/ });
    await option.waitFor();
    assert((await finder.getByRole("option").count()) === 1, "search did not narrow to one model");
    await option.click();
    await finder.getByRole("button", { name: /Batterij vervangen/ }).click();
    await finder.getByText("Op aanvraag").waitFor();
    assert(page.url().includes("model=apple-iphone-15-pro-max"), `url not synced: ${page.url()}`);
    const href = await finder.getByRole("link", { name: /Maak een afspraak/ }).getAttribute("href");
    assert(href?.includes("toestel=apple-iphone-15-pro-max") && href.includes("reparatie=batterij-vervangen"), `cta ${href}`);
  });

  await check("device finder: back navigation and breadcrumbs", async () => {
    const finder = page.locator("#toestel-zoeken");
    await finder.getByRole("button", { name: "Terug" }).click();
    await finder.getByRole("heading", { name: /Wat is er mis met je iPhone 15 Pro Max/ }).waitFor();
    await finder.getByRole("navigation", { name: "Jouw keuze" }).getByRole("button", { name: "Smartphones" }).click();
    await finder.getByRole("heading", { name: /Welk merk smartphone/ }).waitFor();
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
    const p = await ctx.newPage();
    for (const route of ["/", "/reparaties/apple/iphone-15-pro", "/reparaties/samsung", "/afspraak", "/contact"]) {
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

  for (const route of ["/", "/reparaties/apple/iphone-15-pro", "/afspraak", "/veelgestelde-vragen"]) {
    await check(`axe: no serious/critical violations on ${route}`, async () => {
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
