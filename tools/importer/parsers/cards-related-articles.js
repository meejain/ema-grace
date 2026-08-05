/* eslint-disable */
/* global WebImporter */
/**
 * cards-related-articles -> EDS `Cards (related-articles)`
 * Source: https://grace.com/insights/...  Selector: .cmp-card-list.grid.three-columns .card
 * Cards are a.cmp-card.bio: img .image img; eyebrow .h5 (category); title .h4.title (linked);
 * parent anchor href + "Read more" cta. Scope to the card-list whose heading == "Related
 * Articles" so it doesn't claim sibling insight/blog carousels.
 *
 * Receives the .cmp-card-list container (or a card). Emits image | (eyebrow + title + Read more).
 */
export default function parse(element, { document }) {
  const container = element.classList && element.classList.contains('cmp-card-list')
    ? element : (element.closest('.cmp-card-list') || element);
  const cards = Array.from(container.querySelectorAll('a.cmp-card.bio, .card a.cmp-card, a.cmp-card'));
  if (!cards.length) return;

  const cells = cards.map((card) => {
    const img = card.querySelector('.image picture, .image img, picture, img');
    const imageCell = img ? [img.cloneNode(true)] : [];
    const content = [];
    const eyebrow = card.querySelector('.h5');
    if (eyebrow && eyebrow.textContent.trim()) { const p = document.createElement('p'); p.textContent = eyebrow.textContent.trim(); content.push(p); }
    const titleEl = card.querySelector('.h4.title, .h4, .title');
    const href = card.getAttribute('href') || (card.closest('a') || {}).href || '';
    if (titleEl && titleEl.textContent.trim()) {
      const h = document.createElement('h3');
      if (href) { const a = document.createElement('a'); a.href = href; a.textContent = titleEl.textContent.trim(); h.append(a); }
      else h.textContent = titleEl.textContent.trim();
      content.push(h);
    }
    if (href) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = href; a.textContent = 'Read more'; p.append(a); content.push(p); }
    return [imageCell, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (related-articles)', cells });
  const host = container.closest('.card-list') || container;
  host.replaceWith(block);
}
