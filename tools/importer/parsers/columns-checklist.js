/* eslint-disable */
/* global WebImporter */
/**
 * columns-checklist -> EDS `Columns (checklist)`
 * Source: grace.com/ausbildung/ — .row.section-66-33 with left col (.image + .quote) and
 * right col (.rich-text h3 + repeating h4 + ul steps). Receives the .row; emits quote | steps.
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (checklist)');
  if (block) element.replaceWith(block);
}
