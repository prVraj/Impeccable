/**
 * Makes the still pictures on /components: public/previews/<slug>-light.webp and -dark.webp.
 *
 * Each still is a frame of the item's own iMac channel (items/<slug>/tv.tsx), taken from the
 * /components page itself: the script hovers the card, waits for the live preview, and saves
 * the picture box. So a still always matches what the card shows on hover.
 *
 * Run it after adding an item (or changing its tv.tsx), with the site running:
 *   pnpm build && pnpm start          (or pnpm dev)
 *   node scripts/previews.mjs                    every item without stills
 *   node scripts/previews.mjs sleeve-card        just these items (makes them again)
 *   node scripts/previews.mjs --all              every item again
 * Needs Playwright (with its Chromium) and sharp. BASE=http://localhost:3001 picks another address.
 * Then build again, so the page sees the new stills.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next")] }));

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = "public/previews";
// How long a channel plays before its picture is taken (ms). Most look right after ~2s;
// a few tell their story later.
const WAIT = {
  default: 2200,
  "black-hole-refresh": 1500, // the hole has just started pulling the page in
  "puzzle-refresh": 1750, // the page has cracked and its pieces are falling
  "burning-toast": 1700, // the toast is up
  "window-stats": 5000, // a photo card has slid over the blurred statement
  "reel-stats": 3200, // a picture has rolled in and its number has counted up
};

const args = process.argv.slice(2);
const all = args.includes("--all");
const only = args.filter((a) => !a.startsWith("--"));
mkdirSync(OUT, { recursive: true });
const missing = (slug) => !["light", "dark"].every((t) => existsSync(join(OUT, `${slug}-${t}.webp`)));

const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
  // 1440 wide: three cards a row, so the picture box is about 332 x 221 CSS px. Taken at 3x (about 996 x 664)
  // so it stays sharp on phones, where one card fills the screen; still only 3 to 30 KB each.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3, reducedMotion: "no-preference" });
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto(`${BASE}/components`, { waitUntil: "networkidle" });
  const slugs = await page.$$eval(".lib-card", (cards) => cards.map((c) => c.getAttribute("href").replace("/docs/", "")));
  for (const slug of slugs) {
    if (only.length ? !only.includes(slug) : !all && !missing(slug)) continue;
    const card = page.locator(`.lib-card[href="/docs/${slug}"]`);
    if (await card.locator(".lib-sheet").count()) continue; // a skill: its picture is drawn in CSS
    await page.mouse.move(0, 0);
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    try {
      await card.locator(".lib-live[data-shown]").waitFor({ timeout: 8000 });
    } catch {
      console.log(`${slug}: no live preview (no tv.tsx?), skipped`);
      continue;
    }
    await page.waitForTimeout(WAIT[slug] ?? WAIT.default);
    const png = await card.locator(".lib-shot").screenshot({ animations: "allow" });
    const webp = await sharp(png).webp({ quality: 78, effort: 6 }).toBuffer();
    writeFileSync(join(OUT, `${slug}-${theme}.webp`), webp);
    console.log(`${slug}-${theme}.webp  ${(webp.length / 1024).toFixed(1)} KB`);
  }
  await page.close();
}
await browser.close();
