/* eslint-disable */
/* global WebImporter */
/**
 * columns-horizontal-teaser -> EDS `Columns (horizontal-teaser)`
 * Source: grace.com/products/ludox/ — plain a.item (no image, not slate, not tab-img):
 * p.h4 title + .spt-copy body + 'Learn More'. Receives the carousel container.
 * Emits title | body+link per item.
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
  host.replaceWith(block);
}
