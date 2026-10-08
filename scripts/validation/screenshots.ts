/**
 * Captures full-page screenshots of key routes at the QA breakpoints.
 * Usage: BASE_URL=http://localhost:3000 npx tsx scripts/validation/screenshots.ts [route ...]
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SCREENSHOT_DIR ?? "docs/screenshots";
const widths = (process.env.WIDTHS ?? "375,768,1024,1440").split(",").map(Number);
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const width of widths) {
    // Reduced motion renders scroll-driven reveals in their final state for static captures.
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    for (const route of routes) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      // Scroll through the page so in-view animations run before capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 300) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1600);
      const name = `${route === "/" ? "home" : route.replace(/^\//, "").replace(/[/?=&#]/g, "_")}-${width}.png`;
      await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
      console.log(`saved ${OUT}/${name}`);
    }
    await page.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
