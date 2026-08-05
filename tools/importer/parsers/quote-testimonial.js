/* eslint-disable */
/* global WebImporter */
/**
 * quote-testimonial -> EDS `Quote (testimonial)`
 * Source: div.quote .quote-section — .quote-text p + .citation .author + .position.
 * Receives the .quote (or .quote-section). Emits row1 quote, row2 author, row3 position.
 */
export default function parse(element, { document }) {
  const scope = element.querySelector('.quote-section') || element;
  const quoteEl = scope.querySelector('.quote-text, .quote-container p, blockquote, p');
  const authorEl = scope.querySelector('.citation .author, .author');
  const posEl = scope.querySelector('.citation .position, .position');
  const quote = quoteEl ? quoteEl.textContent.trim() : '';
  if (!quote) return;
  const cells = [[quote]];
  if (authorEl && authorEl.textContent.trim()) cells.push([authorEl.textContent.trim()]);
  if (posEl && posEl.textContent.trim()) cells.push([posEl.textContent.trim()]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'Quote (testimonial)', cells });
  element.replaceWith(block);
}
