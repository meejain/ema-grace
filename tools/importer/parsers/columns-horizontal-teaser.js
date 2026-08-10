/* eslint-disable */
/* global WebImporter */
/**
 * columns-horizontal-teaser -> EDS `Columns (horizontal-teaser)`
 * Source: grace.com/products/ludox/ — plain a.item (no image, not slate, not tab-img):
 * p.h4 title + .spt-copy body + 'Learn More'. Receives the carousel container.
 * Emits title | body+link per item.
 *
 * Block table (unchanged): multiple rows, one per teaser card, each with two cells
 * [ title | body + Learn More link ]. The intro line ("… used in the following processes:")
 * is NOT part of the block — it's emitted as an <h2> sibling BEFORE the block (default content
 * in the same section), matching the source where it sits above the cards.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('a.item'))
    .filter((it) => !it.classList.contains('slate-bkgd') && !it.classList.contains('tab-img')
      && !it.querySelector('.image img, picture img'));
  if (!items.length) return;
  const cells = items.map((item) => {
    const titleEl = item.querySelector('.image p.h4, p.h4, .h4, .title');
    const bodyEl = item.querySelector('.spt-copy');
    const href = item.getAttribute('href') || '';
    const c1 = [];
    if (titleEl && titleEl.textContent.trim()) { const h = document.createElement('h3'); h.textContent = titleEl.textContent.trim(); c1.push(h); }
    const c2 = [];
    if (bodyEl) bodyEl.querySelectorAll('p').forEach((p) => { if (p.textContent.trim()) c2.push(p.cloneNode(true)); });
    if (href) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = href; a.textContent = 'Learn More'; p.append(a); c2.push(p); }
    return [c1, c2];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (horizontal-teaser)', cells });
  const host = element.closest('.feature-set') || element;

  // Preserve the intro line above the teaser cards (source `.subhead-large`, e.g. "SILSOL® silica
  // is used in the following processes:"). It's a sibling of the cards inside the feature-set, so
  // it would be lost when the host is replaced. Emit it as an <h2> immediately before the block
  // (same section) — columns.css styles `.columns-container:has(.columns.horizontal-teaser) h2`.
  const introEl = host.querySelector('.subhead-large')
    || Array.from(host.querySelectorAll('p')).find((p) => (p.textContent || '').trim()
      && !p.closest('a.item'));
  const introText = introEl ? (introEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

  host.replaceWith(block);
  if (introText) {
    const h2 = document.createElement('h2');
    h2.textContent = introText;
    block.parentNode.insertBefore(h2, block);
  }
}
