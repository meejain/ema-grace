#!/usr/bin/env node
/**
 * Stage-2 visual pairing: for each target slug, screenshot the SOURCE (grace.com) and the
 * MIGRATED (localhost) article region side-by-side into /tmp/visual-pairs/, so they can be
 * compared (by eye or by an LLM visual-critique pass). This is the only net that catches
 * "decorates fine, content present + clean, but LOOKS wrong" — layout/variant/spacing.
 *
 * Deterministic prep (cheap-ish: 2 screenshots per slug); the actual judgement is a separate
 * visual-critique step on the produced image pairs. Scopes to the <article>/<main> content
 * region and hides cookie/nav overlays to reduce noise.
 *
 * Usage: node tools/importer/stage2-visual-pairs.mjs slug1 slug2 ...
 *   (slugs are insights article slugs; source URL is derived, migrated is localhost)
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const slugs = process.argv.slice(2);
if (!slugs.length) { console.error('usage: node stage2-visual-pairs.mjs <slug> [slug...]'); process.exit(1); }
const OUT = '/tmp/visual-pairs';
mkdirSync(OUT, { recursive: true });

// source slug may differ (dashes collapsed / trailing dash); map from a known list if needed.
const srcUrl = (slug) => `https://grace.com/insights/${slug}/`;
const migUrl = (slug) => `http://localhost:3000/content/insights/${slug}`;

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 2000 } });

async function shoot(url, file, isSource) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); await page.waitForTimeout(3000); } catch (e2) { /* shoot anyway */ }
  }
  // dismiss cookie / hide fixed chrome to reduce diff noise
  await page.evaluate(() => {
    document.querySelectorAll('[id*="onetrust"],[class*="cookie"],[class*="consent"],iframe').forEach((e) => e.remove());
  }).catch(() => {});
  // clip to the article/main content region
  const clip = await page.evaluate(() => {
    const el = document.querySelector('article, main');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: Math.max(0, window.scrollY + r.y), width: Math.min(1440, r.width), height: Math.min(6000, r.height) };
  }).catch(() => null);
  try {
    await page.screenshot({ path: file, fullPage: !clip, ...(clip ? { clip } : {}) });
    console.log(`  saved ${file}`);
  } catch (e) { console.log(`  FAILED ${file}: ${e.message}`); }
  await page.close();
}

for (const slug of slugs) {
  console.log(`\n[pair] ${slug}`);
  await shoot(migUrl(slug), `${OUT}/${slug}__migrated.png`, false);
  await shoot(srcUrl(slug), `${OUT}/${slug}__source.png`, true);
}
await browser.close();
console.log(`\nPairs in ${OUT}/ — compare *__source.png vs *__migrated.png`);
process.exit(0);
