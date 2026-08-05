/* eslint-disable */
/* global WebImporter */
/**
 * columns-app-promo -> EDS `Columns (app-promo)`
 * Source: grace.com/campaign/g-force/ — a .cmp-media-callout > .row with a media image and a
 * .subhead-small heading + intro + link. Receives the .cmp-media-callout; emits image | text.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const row = element.querySelector(':scope > .row, .row') || element;
  const block = buildTwoColumn(row, document, 'Columns (app-promo)');
  if (block) element.replaceWith(block);
}
