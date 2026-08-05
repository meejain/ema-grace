/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-profile-grid  ->  EDS `Cards (profile-grid)`
 * Source: https://grace.com/about-grace/leadership-team/
 * Receives the grid CONTAINER. Profile cards are .col-lg-6 with a .media-callout headshot +
 * h3 name + h4 role + "Read more" link. Emits headshot|content per profile.
 */
import { buildCardsFromColumns, emitCards } from './_cards-utils.js';

const isProfile = (c) => c.querySelector('.media-callout') && c.querySelector('h3');

export default function parse(element, { document }) {
  const block = buildCardsFromColumns(element, document, 'Cards (profile-grid)', '.col-lg-6', isProfile);
  emitCards(element, block);
}
