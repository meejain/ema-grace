/* eslint-disable */
/* global WebImporter */
/**
 * carousel -> EDS `Carousel`
 * Source: .carousel .cmp-carousel — AEM Core carousel; each .cmp-carousel__item is a
 * .generic-hero with inline bg-image + eyebrow + title + body + link. Receives the .carousel.
 * Emits one row per slide: image | (eyebrow + title + body + link).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-carousel__item, .carousel-item, .item'));
  if (!items.length) return;
  const cells = items.map((item) => {
    const img = item.querySelector('picture, img');
    const c1 = img ? [img.cloneNode(true)] : [];
    const c2 = [];
    const eyebrow = item.querySelector('.eyebrow, .h6, .category');
    if (eyebrow && eyebrow.textContent.trim()) { const p = document.createElement('p'); p.textContent = eyebrow.textContent.trim(); c2.push(p); }
    const title = item.querySelector('h1, h2, h3, .h2, .title');
    if (title && title.textContent.trim()) { const h = document.createElement('h3'); h.textContent = title.textContent.trim(); c2.push(h); }
    item.querySelectorAll('p').forEach((p) => { if (p.textContent.trim() && p !== eyebrow) c2.push(p.cloneNode(true)); });
    const link = item.querySelector('a[href]');
    if (link) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = link.getAttribute('href') || '#'; a.textContent = (link.textContent || 'Read more').trim(); p.append(a); c2.push(p); }
    return [c1, c2];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel', cells });
  element.replaceWith(block);
}
