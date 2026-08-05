/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-contact-matrix  ->  EDS `Table (contact-matrix)`
 * Source: https://grace.com/forms/contact-us-customer-service/
 * Selector: .section-75-25 .col-lg-9  (content column holding the matrix)
 *
 * Reality (verified live): NOT a <table>. A stack of `.row` elements, each with two
 * `.col-lg-6` columns (Industries | Customer Service Number). The FIRST such row is the
 * header (two <h3>/<p> labels); the rest are data rows (industry-name paragraphs |
 * phone-number paragraphs). The outer `.row.section-75-25` (75/25 page split) is NOT a data
 * row and is skipped. Phone/email linkify happens in the block's own JS.
 *
 * Standard convention: row 1 = block name (createBlock), then the header row, then one row
 * per industry group — each cell keeping its <p> markup.
 */
export default function parse(element, { document }) {
  const rows = Array.from(element.querySelectorAll('.row')).filter((row) => {
    if (row.classList.contains('section-75-25')) return false;
    const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
    return cols.length === 2;
  });
  if (!rows.length) return; // nothing matrix-shaped — leave content in place

  // Strip zero-width chars the source prefixes onto some cells.
  const clean = (node) => {
    node.querySelectorAll('*').forEach((el) => {
      el.childNodes.forEach((n) => {
        if (n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/[​‌‍﻿]/g, '');
      });
    });
    return node;
  };

  const cellFrom = (col) => {
    const parts = Array.from(col.children).filter((el) => (el.textContent || '').trim());
    return (parts.length ? parts : [col]).map((el) => {
      if (el.tagName === 'H3') { // normalize header <h3> labels to plain paragraphs
        const p = document.createElement('p');
        p.textContent = (el.textContent || '').trim();
        return p;
      }
      return clean(el.cloneNode(true));
    });
  };

  const cells = rows.map((row) => {
    const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
    return cols.map(cellFrom);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Table (contact-matrix)', cells });
  // Replace the element itself (the col-lg-9 content column). Replacing an ANCESTOR would
  // detach the block from the position the sidebar path captures it from; the leftover empty
  // sibling column is harmless.
  element.replaceWith(block);
}
