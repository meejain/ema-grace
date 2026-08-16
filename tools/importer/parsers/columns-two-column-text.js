/* eslint-disable */
/* global WebImporter */
/**
 * columns-two-column-text -> EDS `Columns` (base, no variant — side-by-side text columns)
 * Source: grace.com/industries/plastics-and-polymers/polyethylene-catalysts/pe-solution/ —
 * a `.row` with two `.col-lg-6` TEXT columns (e.g. Activators | Metallocenes), each holding a
 * heading + paragraph + a "Learn more" button. Receives the `.row`; emits a base Columns block
 * (blocks/columns/columns.css lays two cells side-by-side at >=900px, stacked on mobile).
 */
import { buildTwoColumn } from './_columns-utils.js';

export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns');
  if (block) element.replaceWith(block);
}
