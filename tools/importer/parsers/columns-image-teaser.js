/* eslint-disable */
/* global WebImporter */
/**
 * columns-image-teaser -> EDS `Columns (image-teaser)`
 * Source: grace.com/products/synthetic-silicas/classification/
 * Receives a feature-set carousel container. Image-teaser items are a.item.tab-img (or any
 * a.item with an image): linked .image img + h4 + .spt-copy p + 'Learn More'. Emits
 * image | (title + body + link) per item.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('a.item'))
    .filter((it) => it.classList.contains('tab-img') || it.querySelector('.image img, picture img'));
  if (!items.length) return;
  const cells = items.map((item) => {
    const img = item.querySelector('.image picture, .image img, picture, img');
    const c1 = img ? [img.cloneNode(true)] : [];
    const titleEl = item.querySelector('p.h4, .h4, h4, .title');
    const bodyEl = item.querySelector('.spt-copy');
    const href = item.getAttribute('href') || '';
    const c2 = [];
    if (titleEl && titleEl.textContent.trim()) { const h = document.createElement('h3'); h.textContent = titleEl.textContent.trim(); c2.push(h); }
    if (bodyEl) bodyEl.querySelectorAll('p').forEach((p) => { if (p.textContent.trim()) c2.push(p.cloneNode(true)); });
    if (href) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = href; a.textContent = 'Learn More'; p.append(a); c2.push(p); }
    return [c1, c2];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (image-teaser)', cells });
  const host = element.closest('.feature-set') || element;
  host.replaceWith(block);
}
