/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-link-list  ->  EDS `Table (link-list)`
 * Source: https://grace.com/about-grace/sustainability/
 * Selector: div.rich-text.vertical-border > table (1 col; header <tr> has <b>; body <td>
 *   holds multiple <p><a href=pdf>). Links stay as <p><a> so the block JS re-decorates them.
 *
 * Standard convention: row 1 = block name (`Table (link-list)`), then the source header
 * row, then the link-list body row — via WebImporter.Blocks.createBlock.
 */
import { parseRealTables } from './_table-utils.js';

export default function parse(element, { document }) {
  parseRealTables(element, document, 'Table (link-list)');
}
