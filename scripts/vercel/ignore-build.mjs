/**
 * Vercel "Ignored Build Step" (vercel.json `ignoreCommand`): exit 0 skips the build, exit 1 builds.
 *
 * Every save in the CMS (Keystatic) is a commit, and each production build costs build minutes and
 * storage. Since 2026-11-07 the shop's CMS edits go live once a day: production commits that only
 * change CMS content are skipped, and the daily cron (/api/cron/publish, 13:00 Amsterdam time) calls
 * the deploy hook, whose build runs inside the publish window below and so picks them all up.
 * Code changes still build right away; "[publiceer]" in the commit message forces a build.
 */
import { execFileSync } from "node:child_process";

const CONTENT = [/^src\/content\//, /^public\/images\/toestellen\//, /^public\/images\/blog\//];
const PUBLISH_HOUR = 13;
const WINDOW_MINUTES = 20;

const build = (why) => {
  console.log(`Build: ${why}`);
  process.exit(1);
};
const skip = (why) => {
  console.log(`Skip: ${why}`);
  process.exit(0);
};
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const { VERCEL_ENV, VERCEL_GIT_COMMIT_SHA: head, VERCEL_GIT_PREVIOUS_SHA: prev, VERCEL_GIT_COMMIT_MESSAGE: message = "" } = process.env;

if (VERCEL_ENV !== "production") build("not production");
if (/\[publiceer\]/i.test(message)) build("[publiceer] in the commit message");
if (head && prev && head === prev) skip("nothing new since the last production build");

let changed;
try {
  // Every parent: for a merge, the side with our code shows the code files.
  const parents = git("rev-list", "--parents", "-n", "1", "HEAD").split(/\s+/).slice(1);
  if (parents.length === 0) build("no parent commit");
  changed = parents.flatMap((p) => git("diff", "--name-only", p, "HEAD").split("\n").filter(Boolean));
} catch (error) {
  build(`git history not available (${error.message.split("\n")[0]})`);
}
const code = changed.filter((f) => !CONTENT.some((re) => re.test(f)));
if (code.length > 0) build(`code changed: ${code.slice(0, 5).join(", ")}`);

const parts = Object.fromEntries(
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(process.env.IGNORE_BUILD_NOW ? new Date(process.env.IGNORE_BUILD_NOW) : new Date())
    .map((p) => [p.type, Number(p.value)]),
);
if (parts.hour === PUBLISH_HOUR && parts.minute < WINDOW_MINUTES) build("daily publish window");
skip(`only CMS content changed (${changed.length} file(s)); it goes live at ${PUBLISH_HOUR}:00`);
