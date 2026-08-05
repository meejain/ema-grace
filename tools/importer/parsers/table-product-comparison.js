/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-product-comparison  ->  EDS `Table (product-comparison)`
 * Source: https://grace.com/industries/food-beverage/beer/
 * Selector: div.rich-text.vertical-border table (5 col; header cells <strong>;
 *   col1 uses rowspan to group product families).
 *
 * The block's own JS (blocks/table/table.js decorateProductComparison) RE-DERIVES the
 * rowspan grouping from repeated first-column text, so the authored input must have col1
 * FLATTENED (repeated per row) — which is exactly what extractTableCells produces and what
 * the draft target shows. Header + footnote <p>s after the table are preserved as siblings.
 */
import { parseRealTables } from './_table-utils.js';

export default function parse(element, { document }) {
  parseRealTables(element, document, 'Table (product-comparison)');
}
