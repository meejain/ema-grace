/* eslint-disable */
/* global WebImporter */
/**
 * columns-image-right -> EDS `Columns (image-right)`
 * Source: grace.com/about-grace/this-is-grace/ — a .row with the TEXT .col-lg-6 first,
 * image second (same component as image-left, order flipped). Receives the .row.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (image-right)');
  if (block) element.replaceWith(block);
}
