/**
 * Daily publish of the shop's CMS edits (2026-11-07). Vercel Cron calls this at 11:00 and 12:00 UTC
 * (vercel.json); only the call at 13:00 Amsterdam time (winter or summer time) starts a production
 * build through the project's deploy hook. scripts/vercel/ignore-build.mjs lets that build run and
 * skips it when nothing changed since the last one.
 * Needs two secrets in the Vercel project: CRON_SECRET (Vercel sends it as a bearer token) and
 * DEPLOY_HOOK_URL (Settings → Git → Deploy Hooks).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ status: "unauthorized" }, { status: 401 });
  }
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  if (hour !== 13) return Response.json({ status: "skipped", reason: `not 13:00 in Amsterdam (hour ${hour})` });
  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) return Response.json({ status: "not-configured" }, { status: 500 });
  const res = await fetch(hook, { method: "POST", cache: "no-store" });
  return Response.json({ status: res.ok ? "triggered" : "failed", code: res.status }, { status: res.ok ? 200 : 502 });
}
