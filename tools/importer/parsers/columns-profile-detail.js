/* eslint-disable */
/* global WebImporter */
/**
 * columns-profile-detail -> EDS `Columns (profile-detail)`
 * Source: grace.com/about-grace/leadership-team/anthony-yoo/ — .row with .col-lg-4
 * (.media-callout headshot) + .col-lg-8 (.rich-text h1 name + h4 role + body). Receives the
 * .row; emits text | image (or image | text per column order).
 */
import { buildTwoColumn } from './_columns-utils.js';
export default function parse(element, { document }) {
  const block = buildTwoColumn(element, document, 'Columns (profile-detail)');
  if (block) element.replaceWith(block);
}
