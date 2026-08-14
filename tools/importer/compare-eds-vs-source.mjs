// Headless EDS-live vs grace.com-source parity sweep.
// For each EDS URL + its source counterpart, extract a structural+style fingerprint
// at desktop (1440) and mobile (390), diff, and categorize good/cosmetic/major.
import { chromium } from '/home/node/.excat-marketplaces/excat-marketplace/excat/hooks/import-validator/node_modules/playwright-core/index.mjs';
import fs from 'fs';

const EDS = 'https://main--ema-grace--meejain.aem.live';

const srcUrls = fs.readFileSync('/backups/meejain/ema-grace/repo/tools/importer/backups/industries/urls.txt', 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);
const collapse = (p) => p.replace(/-{2,}/g, '-').replace(/\/$/, '');
const pairs = srcUrls.map((su) => {
  const path = collapse(new URL(su).pathname);
  return { edsUrl: EDS + path, srcUrl: su, path };
});

const FP = () => {
  // EDS uses <main>; grace.com source uses <article> inside the content region.
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  if (!main) return { error: 'no main' };
  const txt = (el) => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
  const hero = main.querySelector('.hero, [class*="hero"], .generic-hero');
  const h1 = main.querySelector('h1');
  const heroImg = hero ? hero.querySelector('img, picture img') : null;
  const heroBgEl = [...main.querySelectorAll('*')].slice(0, 40).find((e) => { const bg = getComputedStyle(e).backgroundImage; return bg && bg !== 'none' && /url\(/.test(bg); });
  const h2s = [...main.querySelectorAll('h2')].map(txt).filter(Boolean);
  const h3s = [...main.querySelectorAll('h3')].map(txt).filter(Boolean);
  const grayBands = main.querySelectorAll('.section.gray-band, .light-gray-bkgd').length;
  const blueBorders = main.querySelectorAll('.section.blue-border, .divider-line').length;
  const geoHex = main.querySelectorAll('.section.geo-hex, .geoAndHex').length;
  const cards = main.querySelectorAll('.cards, .cmp-card-list, .card').length;
  const tables = main.querySelectorAll('table').length;
  const featured = main.querySelectorAll('.featured, .feature-set').length;
  const navSelect = !!main.querySelector('select.section-nav-select, select');
  const navRail = !!main.querySelector('.section.sidebar-nav, .section-navigation, [aria-label="Section navigation"]');
  const li = [...main.querySelectorAll('li')].find((l) => txt(l).length > 3 && !l.querySelector('a'));
  let bullet = null;
  if (li) { const b = getComputedStyle(li, '::before'); bullet = { content: b.content, bg: b.backgroundColor, listStyle: getComputedStyle(li).listStyleType }; }
  const textLen = txt(main).length;
  return {
    h1: txt(h1), h1Present: !!h1,
    heroPresent: !!hero, heroHasImage: !!(heroImg || heroBgEl),
    h2Count: h2s.length, h2s: h2s.slice(0, 12), h3Count: h3s.length,
    grayBands, blueBorders, geoHex, cards, tables, featured,
    navSelect, navRail, bullet, textLen, mainH: box(main) ? box(main).h : null,
  };
};

async function grab(page, url, vw) {
  await page.setViewportSize({ width: vw, height: 900 });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(vw === 390 ? 1800 : 1400);
    try { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Accept All Cookies/i.test(x.textContent)); if (b) b.click(); }); } catch (e) { /* noop */ }
    await page.waitForTimeout(300);
    const fp = await page.evaluate(FP);
    const status = page.url().includes('/404') ? 404 : 200;
    return { ok: true, status, fp };
  } catch (e) { return { ok: false, error: String(e).slice(0, 120) }; }
}

function categorize(s, e) {
  const issues = [];
  if (!e || e.error) return { cat: 'major', issues: ['eds page failed to load'] };
  if (!s || s.error) return { cat: 'skip', issues: ['source failed to load'] };
  if (!e.h1Present && s.h1Present) issues.push('MAJOR: missing H1');
  if (s.heroPresent && !e.heroPresent) issues.push('MAJOR: missing hero');
  if (s.heroHasImage && !e.heroHasImage) issues.push('MAJOR: hero image missing');
  if (e.h1 && s.h1 && e.h1.replace(/\s/g, '') !== s.h1.replace(/\s/g, '')) issues.push(`MAJOR: H1 mismatch eds="${e.h1}" src="${s.h1}"`);
  if (s.textLen > 500 && e.textLen < s.textLen * 0.55) issues.push(`MAJOR: content short (eds ${e.textLen} vs src ${s.textLen})`);
  if (Math.abs(e.h2Count - s.h2Count) >= 2) issues.push(`COSMETIC: h2 count eds ${e.h2Count} vs src ${s.h2Count}`);
  if (s.navRail && !e.navRail && !e.navSelect) issues.push('COSMETIC: nav rail missing');
  if (s.cards > 0 && e.cards === 0) issues.push(`COSMETIC: cards missing (src ${s.cards})`);
  if (s.tables > 0 && e.tables === 0) issues.push(`COSMETIC: tables missing (src ${s.tables})`);
  const hasMajor = issues.some((i) => i.startsWith('MAJOR'));
  const hasCosmetic = issues.some((i) => i.startsWith('COSMETIC'));
  return { cat: hasMajor ? 'major' : (hasCosmetic ? 'cosmetic' : 'good'), issues };
}

const results = [];
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
});
const page = await ctx.newPage();
page.on('dialog', (d) => d.dismiss().catch(() => {}));

const START = Number(process.env.START || 0);
const END = Number(process.env.END || pairs.length);
for (let i = START; i < END; i += 1) {
  const { edsUrl, srcUrl, path } = pairs[i];
  const eDesk = await grab(page, edsUrl, 1440);
  const sDesk = await grab(page, srcUrl, 1440);
  const eMob = await grab(page, edsUrl, 390);
  const sMob = await grab(page, srcUrl, 390);
  const desk = categorize(sDesk.fp, eDesk.fp);
  const mob = categorize(sMob.fp, eMob.fp);
  const worst = [desk.cat, mob.cat].includes('major') ? 'major' : ([desk.cat, mob.cat].includes('cosmetic') ? 'cosmetic' : (desk.cat === 'skip' ? 'skip' : 'good'));
  results.push({
    i, path, edsStatus: eDesk.status, srcStatus: sDesk.status, cat: worst,
    desktop: { cat: desk.cat, issues: desk.issues }, mobile: { cat: mob.cat, issues: mob.issues },
    edsFp: eDesk.fp, srcFp: sDesk.fp,
  });
  console.log(`[${i + 1}/${pairs.length}] ${worst.toUpperCase().padEnd(8)} ${path}`);
  if (desk.issues.length) console.log(`   D: ${desk.issues.join(' | ')}`);
  if (mob.issues.length) console.log(`   M: ${mob.issues.join(' | ')}`);
}
fs.writeFileSync(`/backups/meejain/ema-grace/repo/tools/importer/compare-results-${START}-${END}.json`, JSON.stringify(results, null, 2));
await browser.close();
const by = results.reduce((a, r) => { a[r.cat] = (a[r.cat] || 0) + 1; return a; }, {});
console.log(`\n=== SUMMARY (${START}-${END}) ===`);
console.log(JSON.stringify(by));
