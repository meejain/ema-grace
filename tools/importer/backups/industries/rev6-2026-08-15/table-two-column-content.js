/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-two-column-content  ->  EDS `Table (two-column-content)`
 * Source: https://grace.com/products/davisil/   Selector: div.rich-text.split-list
 *
 * Reality (verified live): NOT a <table> and NOT two authored columns — a SINGLE <ul> that
 * `.split-list` CSS renders across two columns via `column-count: 2` (fills the first column
 * top-to-bottom, then the second). The gated "Download …" CTAs are SEPARATE `.button__section`
 * blocks (data-trigger-type="gated-modal", base64 hrefs) — form/gated-asset adjacent, deferred,
 * left in place.
 *
 * Faithful migration: split the single list into two near-equal halves (first half → left
 * cell, second → right cell, matching column-count fill order) and emit a one-row
 * `Table (two-column-content)` block. Row 1 is the block name (added by createBlock); the one
 * data row holds the two column cells, which the block's decorateTwoColumnContent flows into a
 * 2-column grid.
 */
export default function parse(element, { document }) {
  const list = element.querySelector('ul, ol');
  if (!list) return; // nothing to split — leave content in place, don't emit an empty block

  const items = Array.from(list.children).filter((li) => li.tagName === 'LI');
  if (!items.length) return;

  const mid = Math.ceil(items.length / 2);
  const makeList = (slice) => {
    const el = document.createElement(list.tagName.toLowerCase());
    slice.forEach((li) => el.append(li.cloneNode(true)));
    return el;
  };

  const leftCell = [makeList(items.slice(0, mid))];
  const rightCell = mid < items.length ? [makeList(items.slice(mid))] : [];

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Table (two-column-content)', cells });
  element.replaceWith(block);
}
