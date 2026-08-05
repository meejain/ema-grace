/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-contact-options  ->  EDS `Cards (contact-options)`
 * Source: https://grace.com/contact-us/
 * Receives the grid CONTAINER. Contact-option cards are .col-lg-4 with an icon + <h4> title
 * + <ul> of options + optional CTA (distinguishes from location-grid). Emits icon|content.
 */
import { buildCardsFromColumns, emitCards } from './_cards-utils.js';

const isContactOption = (c) => !!c.querySelector('h4') && !!c.querySelector('ul');

export default function parse(element, { document }) {
  const block = buildCardsFromColumns(element, document, 'Cards (contact-options)', '.col-lg-4', isContactOption);
  emitCards(element, block);
}
