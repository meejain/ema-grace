// about-grace parity audit — renders LOCAL (migrated) vs LIVE (source) for each page,
// waits for hydration, extracts an ordered content inventory, and diffs to flag content/image loss.
// LOCAL served at http://localhost:3000/content/about-grace/... (--html-folder content mount = /content).
// Output: tools/importer/reports/about-grace/parity.json + console table.
import { chromium } from '/home/node/.excat-marketplaces/excat-marketplace/excat/hooks/import-validator/node_modules/playwright-core/index.mjs';
import fs from 'fs';

const LOCAL = 'http://localhost:3000/content';
const SRC = 'https://grace.com';

// paths (source path form). Local = LOCAL + path (no trailing slash); source = SRC + path + '/'.
const urlFile = process.argv[2] || '/backups/meejain/ema-grace/repo/tools/importer/about-grace-urls.txt';
const outFile = process.argv[3] || '/backups/meejain/ema-grace/repo/tools/importer/reports/about-grace/parity.json';
const paths = fs.readFileSync(urlFile, 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean)
  .map((u) => new URL(u).pathname.replace(/\/$/, ''));

// Runs in page. Extracts CONTENT inventory from the main content region (excludes header/footer/cookie).
const INV = () => {
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  // scope: on source, content is in <article>; exclude nav/breadcrumb/footer/cookie/modal
  const root = document.querySelector('main article, main, article') || main;
  const clone = root.cloneNode(true);
  clone.querySelectorAll('header,footer,nav,.cookie,#onetrust-banner-sdk,[id*="onetrust"],[class*="cookie"],[class*="breadcrumb"],script,style,noscript,iframe,.media-modal,.contact-us-sticky,.contactus').forEach((e) => e.remove());
  const txt = norm(clone.textContent);
  // headings
  const headings = [...clone.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => `${h.tagName}:${norm(h.textContent).slice(0, 60)}`).filter((h) => h.length > 4);
  // paragraphs (substantial)
  const paras = [...clone.querySelectorAll('p')].map((p) => norm(p.textContent)).filter((t) => t.length > 30);
  // list items
  const lis = [...clone.querySelectorAll('li')].map((l) => norm(l.textContent)).filter((t) => t.length > 3);
  // images: count + how many actually loaded (naturalWidth>0)
  const imgs = [...clone.querySelectorAll('img')];
  // NOTE naturalWidth must be read on the LIVE node, not the clone — re-query live
  return {
    textLen: txt.length,
    headings,
    headingCount: headings.length,
    paraCount: paras.length,
    paras: paras.map((p) => p.slice(0, 80)),
    liCount: lis.length,
    // links (internal content links, not nav)
    linkCount: [...clone.querySelectorAll('a[href]')].filter((a) => norm(a.textContent)).length,
  };
};

// Separate image probe on the LIVE dom (naturalWidth needs the real rendered node).
const IMGPROBE = () => {
  const root = document.querySelector('main article, main, article') || document.body;
  const scope = root.cloneNode(false); // placeholder — we actually query root directly below
  const imgs = [...root.querySelectorAll('img')].filter((im) => {
    // exclude header/footer/nav images
    if (im.closest('header,footer,nav,[class*="cookie"],[id*="onetrust"]')) return false;
    return true;
  });
  return {
    imgTotal: imgs.length,
    imgLoaded: imgs.filter((im) => im.naturalWidth > 0).length,
    imgSrcs: imgs.map((im) => (im.currentSrc || im.src || '').split('/').pop().slice(0, 40)),
  };
};

async function grab(page, url, isLocal) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(isLocal ? 2500 : 3500);
    try { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Accept All Cookies/i.test(x.textContent)); if (b) b.click(); }); } catch (e) { /* noop */ }
    // scroll to bottom to trigger lazy images, then back up
    await page.evaluate(async () => { window.scrollTo(0, document.body.scrollHeight); await new Promise((r) => setTimeout(r, 800)); window.scrollTo(0, 0); });
    await page.waitForTimeout(600);
    const inv = await page.evaluate(INV);
    const imgp = await page.evaluate(IMGPROBE);
    const status = page.url().includes('/404') ? 404 : 200;
    return { ok: true, status, ...inv, ...imgp };
  } catch (e) { return { ok: false, error: String(e).slice(0, 120) }; }
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const results = [];
for (const p of paths) {
  const localUrl = `${LOCAL}${p}`;
  const srcUrl = `${SRC}${p}/`;
  const loc = await grab(page, localUrl, true);
  const src = await grab(page, srcUrl, false);
  // diff: content loss = local has notably less than source
  const issues = [];
  if (!loc.ok) issues.push(`MAJOR: local failed (${loc.error})`);
  if (!src.ok) issues.push(`skip: source failed (${src.error})`);
  if (loc.ok && src.ok) {
    // text completeness
    if (src.textLen > 400 && loc.textLen < src.textLen * 0.75) issues.push(`MAJOR: text short local=${loc.textLen} src=${src.textLen}`);
    // headings
    const missH = (src.headings || []).filter((h) => !(loc.headings || []).some((lh) => lh.slice(0, 40) === h.slice(0, 40)));
    if (missH.length) issues.push(`headings missing (${missH.length}): ${missH.slice(0, 4).join(' | ')}`);
    // paragraphs count
    if (src.paraCount - loc.paraCount >= 2) issues.push(`paras: local ${loc.paraCount} vs src ${src.paraCount}`);
    // images
    if ((src.imgTotal || 0) - (loc.imgLoaded || 0) >= 1) issues.push(`IMG: local loaded ${loc.imgLoaded}/${loc.imgTotal} vs src ${src.imgTotal}`);
    if ((loc.imgTotal || 0) > 0 && (loc.imgLoaded || 0) < (loc.imgTotal || 0)) issues.push(`IMG broken local: ${loc.imgLoaded}/${loc.imgTotal} loaded`);
  }
  const major = issues.some((i) => i.startsWith('MAJOR') || i.startsWith('IMG'));
  const cat = !loc.ok ? 'MAJOR' : (major ? 'MAJOR' : (issues.filter((i) => !i.startsWith('skip')).length ? 'COSMETIC' : 'OK'));
  results.push({ path: p, cat, issues, loc, src });
  process.stderr.write(`${cat.padEnd(8)} ${p}  ${issues.filter((i) => !i.startsWith('skip')).slice(0, 2).join(' ; ')}\n`);
}
await browser.close();
fs.writeFileSync(outFile, JSON.stringify(results, null, 2));

console.log('\n=== ABOUT-GRACE PARITY SUMMARY ===');
const by = { OK: [], COSMETIC: [], MAJOR: [] };
results.forEach((r) => by[r.cat].push(r));
console.log(`OK: ${by.OK.length}  COSMETIC: ${by.COSMETIC.length}  MAJOR: ${by.MAJOR.length}\n`);
for (const c of ['MAJOR', 'COSMETIC']) {
  if (!by[c].length) continue;
  console.log(`--- ${c} ---`);
  by[c].forEach((r) => {
    console.log(`${r.path}`);
    r.issues.filter((i) => !i.startsWith('skip')).forEach((i) => console.log(`    ${i}`));
  });
  console.log('');
}
