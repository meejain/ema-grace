/* eslint-disable */
/* global WebImporter */
/**
 * quote-cta -> EDS `Quote (cta)`
 * Source: div.quote WITHOUT a .quote-section (that variant is quote-testimonial) — a short
 * statement + a "Learn more" CTA. Extracts real content. Receives the div.quote.
 * Emits statement row + CTA row.
 */
export default function parse(element, { document }) {
  if (element.querySelector('.quote-section')) return; // that's quote-testimonial
  const paras = Array.from(element.querySelectorAll('p')).filter((p) => p.textContent.trim());
  if (!paras.length) return;
  const cta = element.querySelector('a[href]');
  const statementCell = [];
  paras.forEach((p) => { if (!cta || !p.contains(cta)) statementCell.push(p.cloneNode(true)); });
  const cells = [[statementCell]];
  if (cta) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = cta.getAttribute('href') || '#'; a.textContent = (cta.textContent || 'Learn more').trim(); p.append(a); cells.push([[p]]); }
  const block = WebImporter.Blocks.createBlock(document, { name: 'Quote (cta)', cells });
  element.replaceWith(block);
}
