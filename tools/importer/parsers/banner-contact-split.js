/* eslint-disable */
/* global WebImporter */
/**
 * banner-contact-split -> EDS `Banner (contact-split)`
 * Source: .contact-us-cmp "Want to talk to an expert?" — title row + two inquiry-column halves
 * (each: h3 + CTA link + intro copy + bullet list). On SIDEBAR pages this is built by PATH A's
 * buildContactSplitBanner; this parser covers the DEFAULT path (non-sidebar pages that carry
 * the same experience fragment). Receives the .contact-us-cmp.
 */
export default function parse(element, { document }) {
  const titleEl = element.querySelector('.contact-us-title, h2');
  const title = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : 'Want to talk to an expert?';
  const cols = Array.from(element.querySelectorAll('.row.has-title > [class*="col-lg-6"], .row.has-title > [class*="col-"]'));
  const halfCells = cols.map((col) => {
    const cell = [];
    const h3 = col.querySelector('h3');
    if (h3) { const h = document.createElement('h3'); h.textContent = (h3.textContent || '').trim(); cell.push(h); }
    const cta = col.querySelector('.button__section a, a.btn-primary, a[href]');
    if (cta) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = cta.getAttribute('href') || '#'; a.textContent = (cta.textContent || '').replace(/\s+/g, ' ').trim(); p.append(a); cell.push(p); }
    const introP = Array.from(col.querySelectorAll('.rich-text p')).find((p) => (p.textContent || '').trim());
    if (introP) { const p = document.createElement('p'); p.innerHTML = introP.innerHTML; cell.push(p); }
    const list = col.querySelector('ul, ol');
    if (list) cell.push(list.cloneNode(true));
    return cell;
  }).filter((c) => c.length);
  if (!halfCells.length) return;
  const block = WebImporter.Blocks.createBlock(document, { name: 'Banner (contact-split)', cells: [[title], halfCells] });
  element.replaceWith(block);
}
