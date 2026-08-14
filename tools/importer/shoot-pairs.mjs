// Capture full-page screenshots of every EDS-live industries page + its grace.com
// source counterpart, at desktop width. Saves to tools/importer/shots/{eds,src}/NNN.png.
// Zero inline cost — images go to disk; a separate diff step ranks them.
import { chromium } from '/home/node/.excat-marketplaces/excat-marketplace/excat/hooks/import-validator/node_modules/playwright-core/index.mjs';
import fs from 'fs';

const EDS = 'https://main--ema-grace--meejain.aem.live';
const OUT = '/backups/meejain/ema-grace/repo/tools/importer/shots';
fs.mkdirSync(`${OUT}/eds`, { recursive: true });
fs.mkdirSync(`${OUT}/src`, { recursive: true });

const srcUrls = fs.readFileSync('/backups/meejain/ema-grace/repo/tools/importer/backups/industries/urls.txt', 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);
const collapse = (p) => p.replace(/-{2,}/g, '-').replace(/\/$/, '');
const pairs = srcUrls.map((su) => ({ edsUrl: EDS + collapse(new URL(su).pathname), srcUrl: su, path: collapse(new URL(su).pathname) }));

async function shoot(page, url, file, isSrc) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(isSrc ? 3500 : 2200);
    // dismiss source cookie dialog so it doesn't overlay the shot
    if (isSrc) {
      try { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Accept All Cookies/i.test(x.textContent)); if (b) b.click(); }); } catch (e) { /* noop */ }
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: file, fullPage: true });
    return true;
  } catch (e) { fs.writeFileSync(`${file}.err`, String(e).slice(0, 200)); return false; }
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 1440, height: 1000 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
});
const page = await ctx.newPage();
page.on('dialog', (d) => d.dismiss().catch(() => {}));

const START = Number(process.env.START || 0);
const END = Number(process.env.END || pairs.length);
for (let i = START; i < END; i += 1) {
  const n = String(i).padStart(3, '0');
  const e = await shoot(page, pairs[i].edsUrl, `${OUT}/eds/${n}.png`, false);
  const s = await shoot(page, pairs[i].srcUrl, `${OUT}/src/${n}.png`, true);
  console.log(`[${i + 1}/${pairs.length}] ${n} ${pairs[i].path}  eds=${e ? 'ok' : 'FAIL'} src=${s ? 'ok' : 'FAIL'}`);
}
fs.writeFileSync(`${OUT}/index.json`, JSON.stringify(pairs.map((p, i) => ({ n: String(i).padStart(3, '0'), ...p })), null, 2));
await browser.close();
console.log('done');
