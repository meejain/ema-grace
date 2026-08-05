/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-category-grid  ->  EDS `Cards (category-grid)`
 * Source: https://grace.com/ (Industries section)  Matcher: bare .cmp-card-list .card-group
 *   whose cards are a.cmp-card.small (no grid modifier); preceded by <h2>Industries</h2>.
 * Card inner: img .image img; label from .cta.btn-track text; link = the card's own href.
 *
 * Receives the .card-group container. Convention: 2-column Cards — cell 1 = image,
 * cell 2 = <h3>label</h3> + <p><a href>Learn more</a></p>.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('a.cmp-card.small, a.cmp-card'));
  if (!cards.length) return;

  const cells = cards.map((card) => {
    const img = card.querySelector('.image picture, .image img, picture, img');
    const imageCell = img ? [img.cloneNode(true)] : [];
    const labelEl = card.querySelector('.cta.btn-track, .cta, .content');
    const label = labelEl ? labelEl.textContent.trim() : (card.getAttribute('aria-label') || '').trim();
    const href = card.getAttribute('href') || '';
    const content = [];
    if (label) {
      const h = document.createElement('h3');
      h.textContent = label;
      content.push(h);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'Learn more';
      p.append(a);
      content.push(p);
    }
    return [imageCell, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (category-grid)', cells });
  const host = element.closest('.cmp-card-list') || element;
  host.replaceWith(block);
}
