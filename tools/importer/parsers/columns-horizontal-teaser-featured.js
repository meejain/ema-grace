/* eslint-disable */
/* global WebImporter */
/**
 * columns-horizontal-teaser-featured -> EDS `Columns (horizontal-teaser-featured)`
 * Source: grace.com/industries/agriculture/ — a.item.slate-bkgd (dark "Featured Products",
 * no image). Receives the carousel container; emits title | body+link per item.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('a.item.slate-bkgd'));
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
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (horizontal-teaser-featured)', cells });
  const host = element.closest('.feature-set') || element;
  host.replaceWith(block);
}
