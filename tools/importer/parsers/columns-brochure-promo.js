/* eslint-disable */
/* global WebImporter */
/**
 * columns-brochure-promo -> EDS `Columns (brochure-promo)`
 * Source: grace.com/products/shieldex/ — .row with left .col-lg-6 (.cmp-media-callout cover +
 * gated download button) and right .col-lg-6 (.text h4 + p + ul). Gated <button> is form-
 * adjacent; we keep any real link. Receives the .row; emits image+cta | text.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (brochure-promo)');
  if (block) element.replaceWith(block);
}
