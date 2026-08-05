/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-location-grid  ->  EDS `Cards (location-grid)`
 * Source: https://grace.com/about-grace/locations/
 * Receives the grid CONTAINER (LCA of all location cards). Location cards are .col-lg-4 with
 * an image + a "Tel:" address and no <h4>/<ul> (distinguishes from contact-options which
 * shares .col-lg-4). Emits one image|text row per location.
 */
import { buildCardsFromColumns, emitCards } from './_cards-utils.js';

const isLocation = (c) => /tel:/i.test(c.textContent || '') && !c.querySelector('h4, ul');

export default function parse(element, { document }) {
  const block = buildCardsFromColumns(element, document, 'Cards (location-grid)', '.col-lg-4', isLocation);
  emitCards(element, block);
}
