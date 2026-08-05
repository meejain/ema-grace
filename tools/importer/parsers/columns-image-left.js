/* eslint-disable */
/* global WebImporter */
/**
 * columns-image-left -> EDS `Columns (image-left)`
 * Source: grace.com/about-grace/this-is-grace/ — a .row with the IMAGE .col-lg-6 first,
 * text second. Receives the .row. Emits image | text.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (image-left)');
  if (block) element.replaceWith(block);
}
