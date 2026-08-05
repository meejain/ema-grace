/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-benefits-grid  ->  EDS `Cards (benefits-grid)`
 * Source: https://grace.com/campaign/ludox-colloidal-silica-pic/
 * Receives the grid CONTAINER. Benefit cards are .col-lg-6 with image + h3 title + p, no link,
 * no media-callout. Convention: 2-column Cards (image | title + description).
 */
import { buildCardsFromColumns, emitCards } from './_cards-utils.js';

const isBenefit = (c) => !!c.querySelector('h3') && !c.querySelector('.media-callout, a');

export default function parse(element, { document }) {
  const block = buildCardsFromColumns(element, document, 'Cards (benefits-grid)', '.col-lg-6', isBenefit);
  emitCards(element, block);
}
