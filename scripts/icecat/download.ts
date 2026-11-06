/**
 * Downloads the Open Icecat product photos listed in src/data/icecat-photos.json into
 * public/images/toestellen/<slug>/icecat.jpg. Open Icecat licence: the photo may only be
 * scaled, never cropped or otherwise edited, so this only resizes (longest side max 1200 px).
 * Run once per new entry (`npm run icecat:download`); existing files are kept unless --force.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

type Entry = { slug: string; imageUrl: string; file: string };
const root = process.cwd();
const entries = JSON.parse(
  readFileSync(join(root, "src/data/icecat-photos.json"), "utf8"),
) as Entry[];
const force = process.argv.includes("--force");

async function main() {
  let fetched = 0;
  for (const e of entries) {
    const target = join(root, "public", e.file);
    if (existsSync(target) && !force) continue;
    const res = await fetch(e.imageUrl);
    if (!res.ok) throw new Error(`${e.slug}: ${res.status} for ${e.imageUrl}`);
    const input = Buffer.from(await res.arrayBuffer());
    const out = await sharp(input)
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, out);
    fetched++;
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(
    `Icecat: ${fetched} downloaded, ${entries.length - fetched} already present`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
