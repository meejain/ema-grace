// Systematic card-grid parity audit: for every industries page, count the
// `.cmp-card-list` promotion/solution grids on the SOURCE and compare to the number
// of decorated card blocks on the EDS-live page. Flags dropped or undecorated grids.
import { chromium } from '/home/node/.excat-marketplaces/excat-marketplace/excat/hooks/import-validator/node_modules/playwright-core/index.mjs';
import fs from 'fs';

const EDS = 'https://main--ema-grace--meejain.aem.live';
const srcUrls = fs.readFileSync('/backups/meejain/ema-grace/repo/tools/importer/backups/industries/urls.txt', 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);
const collapse = (p) => p.replace(/-{2,}/g, '-').replace(/\/$/, '');
const pairs = srcUrls.map((su) => ({ edsUrl: EDS + collapse(new URL(su).pathname), srcUrl: su, path: collapse(new URL(su).pathname) }));

// SOURCE: count meaningful card grids (a .cmp-card-list that has cards linking to pages),
// excluding the Latest-Insights blog list and the follow-us social list.
const SRC_FP = () => {
  const lists = [...document.querySelectorAll('.cmp-card-list')];
  let solutionGrids = 0; const details = [];
  for (const l of lists) {
    const cards = [...l.querySelectorAll('a.cmp-card, .cmp-card')].filter((c) => c.querySelector('.h4, .h4.title, .title'));
    const isBlog = /featured-blog|blog/i.test(l.className) || l.querySelector('a[href*="/insights/"]');
    const isSocial = l.querySelector('a.cmp-card.style-icon');
    if (cards.length >= 1 && !isBlog && !isSocial) { solutionGrids += 1; details.push({ heading: (l.querySelector('.heading') || {}).textContent?.replace(/\s+/g, ' ').trim().slice(0, 50), cards: cards.length }); }
  }
  return { solutionGrids, details };
};
// EDS: count decorated category-grid / product card blocks (exclude featured-content = Latest Insights),
// and detect the flat-PROMOTION leak.
const EDS_FP = () => {
  const main = document.querySelector('main');
  const gridBlocks = [...main.querySelectorAll('.cards.category-grid, .cards.product, .cards:not(.featured-content)')].length;
  const promoLeak = [...main.querySelectorAll('a')].filter((a) => /^PROMOTION$/i.test((a.textContent || '').trim())).length;
  return { gridBlocks, promoLeak };
};

async function grab(page, url, fn, isSrc) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(isSrc ? 2600 : 1600);
    return await page.evaluate(fn);
  } catch (e) { return { err: String(e).slice(0, 80) }; }
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' });
const page = await ctx.newPage();
page.on('dialog', (d) => d.dismiss().catch(() => {}));
const flagged = [];
const START = Number(process.env.START || 0); const END = Number(process.env.END || pairs.length);
for (let i = START; i < END; i += 1) {
  const src = await grab(page, pairs[i].srcUrl, SRC_FP, true);
  const eds = await grab(page, pairs[i].edsUrl, EDS_FP, false);
  const srcGrids = src.solutionGrids || 0;
  const edsGrids = eds.gridBlocks || 0;
  const leak = eds.promoLeak || 0;
  const bad = leak > 0 || (srcGrids > 0 && edsGrids < srcGrids);
  const tag = bad ? 'FLAG' : 'ok';
  if (bad) flagged.push({ path: pairs[i].path, srcGrids, edsGrids, leak, srcDetails: src.details });
  console.log(`[${i + 1}/${pairs.length}] ${tag.padEnd(4)} src=${srcGrids} eds=${edsGrids} leak=${leak}  ${pairs[i].path}`);
}
fs.writeFileSync('/backups/meejain/ema-grace/repo/tools/importer/compare-logs/cardgrid-audit.json', JSON.stringify(flagged, null, 2));
await browser.close();
console.log(`\n=== ${flagged.length} FLAGGED ===`);
flagged.forEach((f) => console.log(`  ${f.path}  src=${f.srcGrids} eds=${f.edsGrids} leak=${f.leak}`));
