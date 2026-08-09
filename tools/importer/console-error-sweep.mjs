#!/usr/bin/env node
/**
 * Stage-0 validation: render every migrated page headless on the local dev server,
 * collect browser console errors, and flag any page whose blocks failed to decorate.
 *
 * This is the highest signal-to-cost net: it deterministically catches the whole class
 * of "content preserved but block broken" bugs (wrong block name → 404, JS decoration
 * throw) that text-completeness and structural-presence audits miss — with NO screenshot
 * token cost. Example caught: a block emitted as `cards-product` (should be `cards product`)
 * → `failed to load block cards-product … 404`.
 *
 * Usage: node tools/importer/console-error-sweep.mjs [dir]
 *   dir = content subdir to sweep (default: insights). Reads content/<dir>/*.plain.html.
 */
import { readdirSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';

const SUBDIR = process.argv[2] || 'insights';
const BASE = 'http://localhost:3000/content';
const WORKSPACE = process.env.WORKSPACE_PATH || process.cwd();
const CONTENT_DIR = join(WORKSPACE, 'content', SUBDIR);
const CONCURRENCY = 6;

// Console errors that are NOT block defects — ignore these.
const BENIGN = [
  /\/templates\/[^/]+\/[^/]+\.js.*404/i, // template .js probe (many templates are CSS-only)
  /favicon/i,
  /the server responded with a status of 404.*\.js:0/i, // generic template/js probe tail
];
// The signals we care about — a block that failed to load/decorate.
const BLOCK_FAIL = [
  /failed to load block (\S+)/i,
  /failed to load module for (\S+)/i,
  /error (?:loading|decorating) block/i,
];

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.plain.html'));
const slugs = files.map((f) => f.replace(/\.plain\.html$/, ''));
console.log(`[sweep] ${slugs.length} pages in content/${SUBDIR}, concurrency ${CONCURRENCY}`);

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function checkPage(slug) {
  const page = await browser.newPage();
  const blockErrors = new Set();
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (BENIGN.some((re) => re.test(text))) return;
    for (const re of BLOCK_FAIL) {
      const m = text.match(re);
      if (m) { blockErrors.add(m[1] || text.slice(0, 80)); return; }
    }
  });
  page.on('pageerror', (err) => blockErrors.add(`pageerror: ${(err.message || '').slice(0, 80)}`));
  try {
    await page.goto(`${BASE}/${SUBDIR}/${slug}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200); // let lazy block decoration finish
  } catch (e) { /* still report whatever errors fired */ }
  await page.close();
  return { slug, blockErrors: [...blockErrors] };
}

const results = [];
for (let i = 0; i < slugs.length; i += CONCURRENCY) {
  const batch = slugs.slice(i, i + CONCURRENCY);
  // eslint-disable-next-line no-await-in-loop
  const r = await Promise.all(batch.map(checkPage));
  results.push(...r);
  process.stdout.write(`\r[sweep] ${Math.min(i + CONCURRENCY, slugs.length)}/${slugs.length}`);
}
process.stdout.write('\n');

const flagged = results.filter((r) => r.blockErrors.length);
console.log(`\n=== ${flagged.length} / ${slugs.length} pages with block-decoration errors ===`);
for (const f of flagged) console.log(`  ${f.slug}: ${f.blockErrors.join(', ')}`);
if (!flagged.length) console.log('  (none — all blocks decorated cleanly)');

await browser.close();
process.exit(0);
