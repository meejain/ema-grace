/* eslint-disable */
/* global WebImporter */
/**
 * featured-product-selector -> EDS `Featured (product-selector)`
 * Source: .cmp-feature-set[data-size] owl-carousel with p.subhead-large 'Featured Products'
 * + a.item cards (.image p.h4 title + .spt-copy p + Learn More). Receives the feature-set.
 * Emits heading row + one row per product: [title, body, link].
 */
export default function parse(element, { document }) {
  const headingEl = element.querySelector('.subhead-large, .heading');
  const heading = headingEl ? headingEl.textContent.trim() : 'Featured Products';
  // De-dupe owl-carousel runtime clone slides by href.
  const seen = new Set();
  const items = Array.from(element.querySelectorAll('.content a.item, a.item')).filter((it) => {
    const href = it.getAttribute('href') || it.textContent.trim();
    if (seen.has(href)) return false; seen.add(href); return true;
  });
  if (!items.length) return;
  const cells = [[heading]];
  items.forEach((item) => {
    const title = (item.querySelector('.image p.h4, p.h4, .h4, .title') || {}).textContent || '';
    const bodyEl = item.querySelector('.spt-copy');
    const href = item.getAttribute('href') || '';
    const bodyNodes = [];
    if (bodyEl) bodyEl.querySelectorAll('p').forEach((p) => { if (p.textContent.trim()) bodyNodes.push(p.cloneNode(true)); });
    const linkNodes = [];
    if (href) { const a = document.createElement('a'); a.href = href; a.textContent = 'Learn More'; linkNodes.push(a); }
    cells.push([title.trim(), bodyNodes, linkNodes]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Featured (product-selector)', cells });
  const host = element.closest('.feature-set') || element;
  host.replaceWith(block);
}
