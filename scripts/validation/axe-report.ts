/** Prints axe violations per route. Usage: npx tsx scripts/validation/axe-report.ts / /contact */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  for (const r of process.argv.slice(2)) {
    await p.goto((process.env.BASE_URL ?? "http://localhost:3000") + r, { waitUntil: "networkidle" });
    const { violations } = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).analyze();
    for (const v of violations) for (const n of v.nodes.slice(0, 3)) console.log(r, v.id, v.impact, n.html.slice(0, 200), "\n  ", n.failureSummary?.split("\n").slice(0, 3).join(" "));
  }
  await b.close();
})();
