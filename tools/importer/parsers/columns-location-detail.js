/* eslint-disable */
/* global WebImporter */
/**
 * columns-location-detail -> EDS `Columns (location-detail)`
 * Source: grace.com/about-grace/locations/aiken/ — .row with .col-lg-6 (.rich-text address +
 * h4 + jobs .button CTA) + .col-lg-6 (.image). Receives the .row; emits text | image.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (location-detail)');
  if (block) element.replaceWith(block);
}
