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
  const CARD_SEL = 'a.cmp-card.generic, .cmp-card.generic, a.cmp-card.small, .cmp-card.small';
  // `element` is usually the grid CONTAINER, but for a single-card grid the matcher's LCA IS the
  // card itself — querySelectorAll wouldn't match it, so include element when it is a card.
  const cards = (element.matches && element.matches(CARD_SEL))
    ? [element]
    : Array.from(element.querySelectorAll(CARD_SEL));
  if (!cards.length) return;

  const cells = cards.map((card) => {
    const img = card.querySelector('.image picture, .image img, picture, img');
    const imageCell = img ? [img.cloneNode(true)] : [];
    const content = [];

    // Title: prefer explicit .h4/.title; else the CTA label (download cards put their label in
    // .cta); else the first non-empty <p> that isn't the eyebrow.
    let titleText = '';
    const titleEl = card.querySelector('.h4.title, .h4, .title');
    if (titleEl) titleText = titleEl.textContent.trim();
    const ctaEl = card.querySelector('.cta');
    if (!titleText && ctaEl) titleText = (ctaEl.textContent || '').replace(/\s+/g, ' ').trim();
    const paras = Array.from(card.querySelectorAll('p')).filter((p) => p.textContent.trim()
      && !/^promotion$/i.test(p.textContent.trim()));
    if (!titleText && paras.length) titleText = paras.shift().textContent.trim();

    // Download cards: the card itself is an <a href> (often a PDF). Emit the title as a Call-to-Action
    // LINK (per the Cards convention) so the CTA is preserved. Plain icon cards keep a bare <h3>.
    const cardHref = card.tagName === 'A' ? (card.getAttribute('href') || '') : '';
    if (titleText && cardHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', cardHref);
      a.textContent = titleText;
      p.appendChild(a);
      content.push(p);
    } else if (titleText) {
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

  // SURGICAL replace. `element` is the cards' lowest common ancestor, which — when grace splits the
  // grid across sibling <article> wrappers inside a larger content <article> — can be a BROAD
  // ancestor that ALSO holds unrelated sibling content (intro prose, a following "Featured" feature
  // set). A blanket element.replaceWith(block) would destroy those siblings (the polypropylene-
  // catalysts defect: intro body + "Experience and Innovation" cards vanished). Instead, replace
  // only the direct children of `element` that actually contain the cards, inserting the block at
  // the first such child's position — leaving other siblings (prose, feature sets) in place for
  // sectionizeFlatBody / other matchers to handle.
  const childrenWithCards = Array.from(element.children)
    .filter((child) => cards.some((card) => child === card || child.contains(card)));
  if (childrenWithCards.length && childrenWithCards.length < element.children.length) {
    element.insertBefore(block, childrenWithCards[0]);
    childrenWithCards.forEach((child) => child.remove());
  } else {
    // Cards span the whole container (no unrelated siblings) → safe to replace it wholesale.
    element.replaceWith(block);
  }
}
