/**
 * Table Two Column Content
 * Transforms EDS block rows into a semantic two-column <table> used for
 * label/value or two-column content. The block auto-detects whether the
 * first authored row is a header row: it is treated as a <thead> only when
 * every cell holds short, inline label text (no block-level content such as
 * <p>, <ul>, <ol>, <table> or images). Otherwise all rows become <tbody>
 * data rows so plain label/value tables render without a header.
 * @param {Element} block The block element
 */

const BLOCK_LEVEL = 'UL, OL, DL, TABLE, IMG, PICTURE, H1, H2, H3, H4, H5, H6, BLOCKQUOTE';

/**
 * A cell is "label-like" (header candidate) when it holds only short,
 * single-line inline text. A lone wrapping <p> (added by EDS to loose text)
 * is tolerated, but multiple paragraphs, lists, images or long/multi-line
 * content disqualify it.
 * @param {Element} cell
 * @returns {boolean}
 */
function isLabelCell(cell) {
  if (cell.querySelector(BLOCK_LEVEL)) return false;
  if (cell.querySelectorAll('p').length > 1) return false;
  const text = cell.textContent.trim();
  return text.length > 0 && text.length <= 60 && !text.includes('\n');
}

/**
 * Determines whether the first row should be rendered as a header row.
 * @param {Element} row The first authored row
 * @returns {boolean}
 */
function isHeaderRow(row) {
  const cells = [...row.children];
  if (cells.length < 2) return false;
  return cells.every(isLabelCell);
}

/**
 * Moves the authored cell content into a new <th>/<td> element.
 * @param {Element} cell The authored cell (div)
 * @param {string} tag 'th' or 'td'
 * @returns {HTMLTableCellElement}
 */
function buildCell(cell, tag) {
  const el = document.createElement(tag);
  if (tag === 'th') el.setAttribute('scope', 'col');
  while (cell.firstChild) el.append(cell.firstChild);
  // unwrap a single stray <p> so short labels/values sit directly in the cell
  const only = el.children.length === 1 ? el.firstElementChild : null;
  if (only && only.tagName === 'P') {
    while (only.firstChild) el.insertBefore(only.firstChild, only);
    only.remove();
  }
  return el;
}

/**
 * Builds a table row from an authored row.
 * @param {Element} row The authored row (div)
 * @param {string} tag 'th' or 'td'
 * @returns {HTMLTableRowElement}
 */
function buildRow(row, tag) {
  const tr = document.createElement('tr');
  [...row.children].slice(0, 2).forEach((cell) => tr.append(buildCell(cell, tag)));
  return tr;
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  let dataRows = rows;

  if (isHeaderRow(rows[0])) {
    const thead = document.createElement('thead');
    thead.append(buildRow(rows[0], 'th'));
    table.append(thead);
    dataRows = rows.slice(1);
    block.classList.add('has-header');
  }

  dataRows.forEach((row) => tbody.append(buildRow(row, 'td')));
  if (tbody.children.length) table.append(tbody);

  block.replaceChildren(table);
}
