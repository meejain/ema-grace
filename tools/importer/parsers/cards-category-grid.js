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
    // Category label: prefer the real title (`.h4.title`, e.g. "Beer" / "Food Processing"), NOT the
    // `.cta` ("Learn more") or the aria-label. Fall back to `.cta.btn-track` (homepage small cards),
    // then the CTA text. The `.h5` eyebrow ("PROMOTION") is intentionally ignored.
    const titleEl = card.querySelector('.h4.title, .title, .h4');
    const labelEl = titleEl || card.querySelector('.cta.btn-track, .cta, .content');
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

  // Preserve the section heading + intro that grace authors INSIDE the card-list as
  // `.cmp-card-list > .heading` (e.g. industries "Food and beverage solutions" H2 + a lead
  // paragraph, or "Versatile Solutions for Your Needs"). Because we replaceWith() the whole
  // .cmp-card-list, that heading would be destroyed — so lift it out and emit it as sibling
  // default content immediately BEFORE the block, in the same section. Promote the title to an
  // <h2> (source renders it as the section heading) and keep the intro paragraph.
  const headingWrap = host.querySelector(':scope > .heading, :scope > .card-list-header');
  const preNodes = [];
  if (headingWrap) {
    const titleEl = headingWrap.querySelector('h1, h2, h3, .h2, .h3, .title');
    const title = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (title) { const h = document.createElement('h2'); h.textContent = title; preNodes.push(h); }
    // intro paragraph(s) other than the title
    Array.from(headingWrap.querySelectorAll('p')).forEach((p) => {
      const t = (p.textContent || '').replace(/\s+/g, ' ').trim();
      if (t && t !== title) { const np = document.createElement('p'); np.textContent = t; preNodes.push(np); }
    });
  }

  host.replaceWith(block);
  // Insert the heading nodes just before the block IN ORDER (title then intro) so they travel
  // together and read h2 → intro → grid (sectionizeFlatBody then merges this trailing heading-led
  // run into the block's section). Insert each before `block` in forward order.
  preNodes.forEach((n) => block.parentNode && block.parentNode.insertBefore(n, block));
}
