/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-image-text-grid  ->  EDS `Cards (image-text-grid)`
 * Source: https://grace.com/about-grace/community/
 * Receives the grid CONTAINER. Cards are .col-lg-6 with image + a paragraph (bold lead + copy),
 * NO heading, NO link, no media-callout. Convention: 2-column Cards (image | paragraph).
 */
import { buildCardsFromColumns, emitCards } from './_cards-utils.js';

const isImageText = (c) => !c.querySelector('h3, h4, a, .media-callout');

export default function parse(element, { document }) {
  const block = buildCardsFromColumns(element, document, 'Cards (image-text-grid)', '.col-lg-6', isImageText);
  emitCards(element, block);
}
