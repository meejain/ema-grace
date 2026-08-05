/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-three-column  ->  EDS `Table (three-column)`
 * Source: https://grace.com/compliance/compliance-seveso-directive-iii-worms-de/
 * Selector: div.rich-text.vertical-border > table (3 col: Anschrift/Produkte/Zertifikate;
 *   cells mix <p>, <ul>, mailto links). The section <h2> above the table is separate
 *   default content and is left untouched.
 *
 * Emits the standard convention: row 1 = block name (`Table (three-column)`), then the
 * source header row, then one row per data row — via WebImporter.Blocks.createBlock.
 */
import { parseRealTables } from './_table-utils.js';

export default function parse(element, { document }) {
  parseRealTables(element, document, 'Table (three-column)');
}
