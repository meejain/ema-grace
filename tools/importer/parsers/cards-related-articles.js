/* eslint-disable */
/* global WebImporter */
/**
 * cards-related-articles -> EDS `Cards (product, cta)`
 * Source: https://grace.com/insights/... — a .cmp-card-list.grid.three-columns whose heading is
 * "Related Articles", with a.cmp-card.bio cards (img .image img; eyebrow .h5 = "PROMOTION";
 * title .h4.title; parent anchor href).
 *
 * REUSES the existing `Cards` block with the `product` variant + the `cta` OPTION
 * (blocks/cards, `.cards.product.cta`) — the source Related-Articles card renders like the
 * homepage product card (image on top, green CENTERED title, 3-up grid) BUT shows a visible
 * "Read more ›" link. The `cta` option is what turns the card link from an invisible full-card
 * overlay (homepage default) into that visible CTA — it is authored, not inferred. Cell shape:
 *   [ image ] | [ <strong>Title</strong>  <a>Read more</a> ]
 * The "PROMOTION" .h5 eyebrow is CMS scaffolding and is dropped. One row per card.
 * Does NOT introduce a new block/variant — only adds the authored `cta` option.
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
    const titleEl = card.querySelector('.h4.title, .h4, .title');
    const title = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
    const href = card.getAttribute('href') || (card.closest('a') || {}).href || '';
    // Title as a <strong> (product variant renders it as the green centered heading).
    if (title) { const s = document.createElement('strong'); s.textContent = title; content.push(s); }
    // Visible "Read more ›" CTA (source Related-Articles cards show it). The authored `cta`
    // option (below) makes .cards.product.cta's trailing link visible for these cards (vs the
    // homepage product tiles, where it stays an invisible full-card overlay).
    if (href) { const a = document.createElement('a'); a.href = href; a.textContent = 'Read more'; content.push(a); }
    return [imageCell, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (product, cta)', cells });
  const host = container.closest('.card-list') || container;
  host.replaceWith(block);
}
