/* eslint-disable */
/* global WebImporter */
/**
 * quote-highlight -> EDS `Quote (highlight)`
 * Source: .card-item .cmp-card.statistic — big number .h4.title + caption .h6.spt-copy.
 * Receives the .cmp-card.statistic. Emits row1 = number, row2 = caption. Drops the template
 * "PROMOTION" eyebrow.
 */
export default function parse(element, { document }) {
  const numberEl = element.querySelector('.h4.title, .h4, .title, .statistic-number');
  const captionEl = element.querySelector('.h6.spt-copy, .spt-copy, .h6, .caption');
  const number = numberEl ? numberEl.textContent.trim() : '';
  const caption = captionEl && !/^promotion$/i.test(captionEl.textContent.trim()) ? captionEl.textContent.trim() : '';
  if (!number && !caption) return;
  const cells = [];
  if (number) cells.push([number]);
  if (caption) cells.push([caption]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'Quote (highlight)', cells });
  const host = element.closest('.card-item') || element;
  host.replaceWith(block);
}
