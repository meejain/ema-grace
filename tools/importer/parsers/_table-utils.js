/* eslint-disable */
/* global WebImporter */

/**
 * Shared helpers for the `table` block family.
 *
 * grace.com renders real tabular content as authored <table border=1> markup inside
 * `div.rich-text` (with variants distinguished by column count / `.vertical-border`).
 * EDS block tables are div-grids that CANNOT express rowspan/colspan, so we FLATTEN
 * spanned cells (repeat the spanning cell's content into each covered row/column) —
 * matching the draft targets (e.g. table-product-comparison repeats "Hydrogel" per row).
 */

/** True for empty/whitespace-only wrapper nodes we should drop (source spacer <p></p>). */
function isEmptyNode(node) {
  if (node.nodeType === 3) return !node.textContent.trim(); // text node
  if (node.nodeType !== 1) return true; // comment/other
  const el = node;
  if (el.querySelector('img, a, ul, ol, br')) return false;
  return !(el.textContent || '').trim();
}

/** Strip zero-width / BOM chars the source sprinkles into cell text (ZWSP, ZWNJ, ZWJ, BOM). */
function stripZeroWidth(node) {
  if (node.nodeType === 3) {
    node.nodeValue = node.nodeValue.replace(/[​‌‍﻿]/g, '');
    return;
  }
  if (node.nodeType !== 1) return;
  node.childNodes.forEach(stripZeroWidth);
}

/**
 * Build a cell's content as an array of cloned nodes, dropping empty spacer wrappers.
 * Preserves meaningful inline/%block markup (strong, em, br, a, ul/ol, p) and strips the
 * zero-width chars the source injects. Falls back to the trimmed text when a cell has no
 * element children.
 */
function cellContent(td, document) {
  const out = [];
  Array.from(td.childNodes).forEach((n) => {
    if (isEmptyNode(n)) return;
    const clone = n.cloneNode(true);
    stripZeroWidth(clone);
    out.push(clone);
  });
  if (!out.length) {
    const text = (td.textContent || '').replace(/[​‌‍﻿]/g, '').trim();
    if (text) out.push(document.createTextNode(text));
  }
  return out;
}

/**
 * Extract a <table> into a flattened rows-of-cells array (rowspan/colspan resolved).
 * Each cell is an array of cloned nodes suitable for WebImporter.Blocks.createBlock.
 * @returns {Array<Array<Array<Node>>>} rows[] -> cells[] -> nodes[]
 */
export function extractTableCells(tableEl, document) {
  const trs = Array.from(tableEl.querySelectorAll('tr'));
  const grid = [];
  // pending[col] = { nodes, rowsLeft } for an active rowspan carried into later rows.
  const pending = [];

  trs.forEach((tr, rowIdx) => {
    const rowCells = [];
    let col = 0;

    const placeCarried = () => {
      while (pending[col] && pending[col].rowsLeft > 0) {
        rowCells[col] = pending[col].nodes.map((n) => n.cloneNode(true));
        pending[col].rowsLeft -= 1;
        if (pending[col].rowsLeft === 0) pending[col] = null;
        col += 1;
      }
    };

    placeCarried();
    Array.from(tr.children).forEach((td) => {
      if (!/^(TD|TH)$/.test(td.tagName)) return;
      placeCarried();
      const nodes = cellContent(td, document);
      const colspan = parseInt(td.getAttribute('colspan') || '1', 10) || 1;
      const rowspan = parseInt(td.getAttribute('rowspan') || '1', 10) || 1;
      for (let c = 0; c < colspan; c += 1) {
        rowCells[col] = nodes.map((n) => n.cloneNode(true));
        if (rowspan > 1) pending[col] = { nodes, rowsLeft: rowspan - 1 };
        col += 1;
        if (c < colspan - 1) placeCarried();
      }
    });
    placeCarried();

    // Normalize row width and drop fully-empty trailing gaps.
    for (let i = 0; i < rowCells.length; i += 1) if (!rowCells[i]) rowCells[i] = [];
    if (rowCells.some((cell) => cell.length)) grid.push(rowCells);
    // eslint-disable-next-line no-unused-vars
    void rowIdx;
  });

  return grid;
}

/**
 * Standard real-<table> parser: find the table(s) under `element`, flatten each, and emit
 * the named EDS table block IN PLACE of each source <table>. Used by product-comparison /
 * link-list / three-column / data-grid via thin wrappers. `blockName` e.g.
 * 'Table (product-comparison)'.
 *
 * Each <table> is replaced individually so:
 *  - SIBLING tables (data-grid: 4 cookie tables) each become their own block in order;
 *  - trailing caption/footnote <p>s (product-comparison) are preserved as siblings.
 */
export function parseRealTables(element, document, blockName) {
  const tables = element.matches && element.matches('table')
    ? [element]
    : Array.from(element.querySelectorAll('table'));
  if (!tables.length) return;

  tables.forEach((table) => {
    const cells = extractTableCells(table, document);
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
    table.replaceWith(block);
  });
}
