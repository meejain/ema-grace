/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-data-grid  ->  EDS `Table (data-grid)`
 * Source: https://grace.com/cookie-policy/
 * Selector: div.rich-text > table[width='100%'] (5 col: Name/Provider/Purpose/Expiry/Type;
 *   FOUR sibling tables for cookie categories; NO .vertical-border). Each source table
 *   becomes its own data-grid block, emitted in order.
 *
 * Standard convention: row 1 = block name (`Table (data-grid)`), then header row, then data
 * rows — via WebImporter.Blocks.createBlock, once per source table.
 */
import { parseRealTables } from './_table-utils.js';

export default function parse(element, { document }) {
  parseRealTables(element, document, 'Table (data-grid)');
}
