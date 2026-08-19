// about-grace richness ranking — renders each LIVE grace.com about-grace page,
// waits for hydration, and extracts a rendered-DOM block-signature inventory.
// Per MIGRATION-PLAYBOOK §3: rank richness by RENDERED DOM, never raw-HTML grep.
// Output: tools/importer/reports/about-grace/richness.json (+ console table).
import { chromium } from '/home/node/.excat-marketplaces/excat-marketplace/excat/hooks/import-validator/node_modules/playwright-core/index.mjs';
import fs from 'fs';

const urls = fs.readFileSync('/backups/meejain/ema-grace/repo/tools/importer/about-grace-urls.txt', 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);

// Runs in the page. Counts SOURCE (grace.com) component signatures inside the content region.
const INV = () => {
  const main = document.querySelector('article') || document.querySelector('main') || document.body;
  const txt = (el) => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const q = (sel) => main.querySelectorAll(sel).length;
  const has = (sel) => !!main.querySelector(sel);
  // grace.com source component fingerprints (from selector-harvest vocabulary)
  const sig = {
    hero: q('.hero__section, [class*="hero__"], .hero-reduce-height'),
    heroImg: has('.hero__section img, .hero__section picture') || (() => {
      const h = document.querySelector('.hero__section, [class*="hero__"]');
      if (!h) return false; const bg = getComputedStyle(h).backgroundImage; return /url\(/.test(bg);
    })(),
    heroCta: q('.hero__section .button__section, .hero__button, .hero__section a.button'),
    navRail: q('.section-navigation, [aria-label="Section navigation"], article .row > .col-lg-2'),
    contactWidget: q('.contact-us-sticky, .contact-us__cmp, .contactus__text'),
    contactSplit: q('.contact-us-cmp'),
    richText: q('.rich-text, .text.parbase, .cmp-text'),
    cmpCards: q('.cmp-card'),
    cardList: q('.cmp-card-list'),
    profileGrid: q('.cmp-card.bio, .profile-card'),
    mediaCallout: q('.media-callout, .cmp-media-callout'),
    mediaVideo: q('.media-video, .media-modal video, .media-modal iframe'),
    accordion: q('.accordion, .accordion-comp'),
    tables: q('table'),
    quote: q('.quote, blockquote'),
    map: q('.map, iframe[src*="google.com/maps"], [class*="map"]'),
    social: q('.social-share, .social-follow, [class*="social"]'),
    featured: q('.feature-set-section, .featured-blog-cmp, .featured-product'),
    gatedDownload: q('.gated-asset-simplified, .lightbox-container, button[href]'),
    grayBand: q('.light-gray-bkgd, .geoAndHex'),
    columns5050: q('.section-75-25, .row .col-lg-6, .row .col-lg-7'),
    // block types the first pass undercounted:
    historyItem: q('.history-item, .timeline-item, [class*="history"], [class*="timeline"]'),
    gridCards: q('.cmp-card, a.cmp-card, .card-grid .card, [class*="card"] a[href]'),
    teaser: q('.feature-set-section, .horizontal-teaser, .cmp-teaser'),
    imageText: q('.section-75-25, .cmp-image + .cmp-text, .row.section-50-50'),
    imgTotal: q('img, picture'),
    h1: txt(main.querySelector('h1')),
    h2Count: q('h2'), h3Count: q('h3'), h4Count: q('h4'),
    liCount: q('li'),
    textLen: txt(main).length,
  };
  // richness score = distinct DISTINCT styled component types present (not raw counts)
  const typeKeys = ['heroImg', 'navRail', 'contactWidget', 'contactSplit', 'cmpCards', 'cardList',
    'profileGrid', 'mediaCallout', 'mediaVideo', 'accordion', 'tables', 'quote', 'map', 'social',
    'featured', 'gatedDownload', 'grayBand', 'historyItem', 'teaser', 'imageText'];
  let distinct = 0;
  for (const k of typeKeys) { if (sig[k]) distinct += 1; }
  sig.distinctBlockTypes = distinct;
  return sig;
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const rows = [];
for (const url of urls) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000); // hydration
    try { await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Accept All Cookies/i.test(x.textContent)); if (b) b.click(); }); } catch (e) { /* noop */ }
    await page.waitForTimeout(400);
    const inv = await page.evaluate(INV);
    rows.push({ url, path: new URL(url).pathname, ...inv });
    process.stderr.write(`ok  ${inv.distinctBlockTypes}  ${new URL(url).pathname}\n`);
  } catch (e) {
    rows.push({ url, path: new URL(url).pathname, error: String(e).slice(0, 120) });
    process.stderr.write(`ERR ${new URL(url).pathname}: ${String(e).slice(0, 80)}\n`);
  }
}
await browser.close();

fs.writeFileSync('/backups/meejain/ema-grace/repo/tools/importer/reports/about-grace/richness.json', JSON.stringify(rows, null, 2));

// cluster label from path
const cluster = (p) => {
  if (/\/leadership-team\/[^/]+\/$/.test(p)) return 'bio';
  if (/\/locations\/[^/]+\/$/.test(p)) return 'location';
  if (p === '/about-grace/') return 'root';
  if (/\/(leadership-team|locations)\/$/.test(p)) return 'landing';
  if (/our-history/.test(p)) return 'history';
  return 'section';
};
console.log('\n=== about-grace richness (by rendered distinct block types) ===');
const sorted = rows.filter((r) => !r.error).sort((a, b) => b.distinctBlockTypes - a.distinctBlockTypes);
console.log('score\tclust\t\timg\th2\ttbl\tcards\tacc\tpath');
for (const r of sorted) {
  console.log(`${r.distinctBlockTypes}\t${cluster(r.path).padEnd(8)}\t${r.imgTotal}\t${r.h2Count}\t${r.tables}\t${r.cmpCards}\t${r.accordion}\t${r.path}`);
}
const errs = rows.filter((r) => r.error);
if (errs.length) { console.log('\n=== ERRORS ==='); for (const e of errs) console.log(`${e.path}: ${e.error}`); }
