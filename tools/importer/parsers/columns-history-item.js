/* eslint-disable */
/* global WebImporter */
/**
 * columns-history-item -> EDS `Columns (history-item)` (one block per timeline item)
 * Source: grace.com/about-grace/our-history/ — .row.section-66-33 with .col-lg-8 (h2 year +
 * p) and .col-lg-4 (image). Receives ONE .row.section-66-33; emits text | image.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (history-item)');
  if (block) element.replaceWith(block);
}
