/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-icon-grid  ->  EDS `Cards (icon-grid)`
 * Source: https://grace.com/industries/plastics-and-polymers/polypropylene-catalysts/
 * Receives the grid CONTAINER (LCA of the generic icon cards). Each generic cmp-card has an
 * icon .image img, an optional eyebrow (.h5 — often a hidden "PROMOTION" marker we drop), a
 * title (.h4.title / first <p>), and a body (.spt-copy / second <p>). Emits icon | (title +
 * body) rows, matching the draft (a heading + a paragraph, no link).
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('a.cmp-card.generic, .cmp-card.generic'));
  if (!cards.length) return;

  const cells = cards.map((card) => {
    const img = card.querySelector('.image picture, .image img, picture, img');
    const imageCell = img ? [img.cloneNode(true)] : [];
    const content = [];

    // Title: prefer explicit .h4/.title; else the first non-empty <p> that isn't the eyebrow.
    let titleText = '';
    const titleEl = card.querySelector('.h4.title, .h4, .title');
    if (titleEl) titleText = titleEl.textContent.trim();
    const paras = Array.from(card.querySelectorAll('p')).filter((p) => p.textContent.trim()
      && !/^promotion$/i.test(p.textContent.trim()));
    if (!titleText && paras.length) titleText = paras.shift().textContent.trim();
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      content.push(h);
    }

    // Body: prefer .spt-copy; else the remaining paragraph(s).
    const body = card.querySelector('.spt-copy, .copy');
    if (body && body.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = body.textContent.trim();
      content.push(p);
    } else {
      paras.forEach((p) => {
        if (p.textContent.trim() !== titleText) {
          const np = document.createElement('p');
          np.textContent = p.textContent.trim();
          content.push(np);
        }
      });
    }
    return [imageCell, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (icon-grid)', cells });
  element.replaceWith(block);
}
