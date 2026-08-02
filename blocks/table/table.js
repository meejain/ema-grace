/*
 * Consolidated table block. Every variant turns authored EDS rows into a
 * semantic <table>; the shared core builds thead/tbody, and each variant adds
 * its own extras (scroll wrapper, phone/email linkify, rowspan grouping,
 * header auto-detect) via a decorate function keyed by the variant class.
 */

const VARIANTS = ['contact-matrix', 'data-grid', 'link-list', 'product-comparison', 'three-column', 'two-column-content'];

function getVariant(block) {
  return VARIANTS.find((v) => block.classList.contains(v)) || null;
}

/* Move authored cell content into a th/td, optionally unwrapping a lone <p>. */
function buildCell(cell, tag, { scope, unwrapP = false, keepHTML = false } = {}) {
  const el = document.createElement(tag);
  if (scope) el.setAttribute('scope', scope);
  if (keepHTML) {
    el.innerHTML = cell.innerHTML.trim();
  } else {
    while (cell.firstChild) el.append(cell.firstChild);
  }
  if (unwrapP) {
    const only = el.children.length === 1 ? el.firstElementChild : null;
    if (only && only.tagName === 'P') {
      while (only.firstChild) el.insertBefore(only.firstChild, only);
      only.remove();
    }
  }
  return el;
}

/* ---- data-grid: simple multi-column with header + scroll wrapper ---- */
function decorateDataGrid(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHeader = i === 0;
    [...row.children].forEach((cell) => tr.append(buildCell(cell, isHeader ? 'th' : 'td', { scope: isHeader ? 'col' : undefined })));
    (isHeader ? thead : tbody).append(tr);
  });
  table.append(thead);
  if (tbody.children.length) table.append(tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-data-grid-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);
}

/* ---- three-column: header row + data rows ---- */
function decorateThreeColumn(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const buildRow = (row, tag) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => tr.append(buildCell(cell, tag, { scope: tag === 'th' ? 'col' : undefined, unwrapP: tag === 'th' })));
    return tr;
  };
  const [headerRow, ...dataRows] = rows;
  thead.append(buildRow(headerRow, 'th'));
  dataRows.forEach((row) => tbody.append(buildRow(row, 'td')));
  table.append(thead);
  if (dataRows.length) table.append(tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-three-column-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);
}

/* ---- link-list: header + link cells, EDS button decoration reversed ---- */
function decorateLinkList(block) {
  const rows = [...block.children];
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    const isHeader = index === 0;
    [...row.children].forEach((cell) => {
      cell.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary', 'accent'));
      cell.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
      tr.append(buildCell(cell, isHeader ? 'th' : 'td', { scope: isHeader ? 'col' : undefined, keepHTML: true }));
    });
    (isHeader ? thead : tbody).append(tr);
  });
  if (thead.children.length) table.append(thead);
  if (tbody.children.length) table.append(tbody);
  block.replaceChildren(table);
}

/* ---- contact-matrix: header + rows, phone/email cells linkified ---- */
const PHONE_RE = /(\+?[\d][\d\s().-]{6,}\d)/g;
const EMAIL_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

function linkify(node) {
  const text = node.nodeValue;
  if (!text || !text.trim()) return;
  const emails = text.match(EMAIL_RE);
  if (emails) {
    const frag = document.createDocumentFragment();
    let rest = text;
    emails.forEach((email) => {
      const idx = rest.indexOf(email);
      if (idx > 0) frag.append(document.createTextNode(rest.slice(0, idx)));
      const a = document.createElement('a');
      a.href = `mailto:${email}`;
      a.textContent = email;
      frag.append(a);
      rest = rest.slice(idx + email.length);
    });
    if (rest) frag.append(document.createTextNode(rest));
    node.replaceWith(frag);
    return;
  }
  const phones = text.match(PHONE_RE);
  if (!phones) return;
  const frag = document.createDocumentFragment();
  let rest = text;
  phones.forEach((phone) => {
    const idx = rest.indexOf(phone);
    if (idx > 0) frag.append(document.createTextNode(rest.slice(0, idx)));
    const a = document.createElement('a');
    a.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
    a.textContent = phone.trim();
    const lead = phone.match(/^\s+/);
    const trail = phone.match(/\s+$/);
    if (lead) frag.append(document.createTextNode(lead[0]));
    frag.append(a);
    if (trail) frag.append(document.createTextNode(trail[0]));
    rest = rest.slice(idx + phone.length);
  });
  if (rest) frag.append(document.createTextNode(rest));
  node.replaceWith(frag);
}

function linkifyCell(cell) {
  const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    if (!n.parentElement.closest('a')) linkify(n);
  });
}

function decorateContactMatrix(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    const isHeader = rowIndex === 0;
    [...row.children].forEach((cell, cellIndex) => {
      const el = buildCell(cell, isHeader ? 'th' : 'td', { scope: isHeader ? 'col' : undefined });
      if (!isHeader && cellIndex > 0) linkifyCell(el);
      tr.append(el);
    });
    (isHeader ? thead : tbody).append(tr);
  });
  table.append(thead);
  if (tbody.children.length) table.append(tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-contact-matrix-scroll';
  scroller.append(table);
  block.replaceChildren(scroller);
}

/* ---- product-comparison: header + rows, first column rowspan grouping ---- */
function decorateProductComparison(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const [headerRow, ...dataRows] = rows;

  const htr = document.createElement('tr');
  [...headerRow.children].forEach((cell) => htr.append(buildCell(cell, 'th', { scope: 'col', unwrapP: true })));
  thead.append(htr);

  const bodyTrs = dataRows.map((row) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');
    tr.dataset.group = (cells[0]?.textContent || '').trim();
    tr.append(buildCell(cells[0], 'th', { scope: 'rowgroup', unwrapP: true }));
    cells.slice(1).forEach((cell) => tr.append(buildCell(cell, 'td', { unwrapP: true })));
    tbody.append(tr);
    return tr;
  });

  for (let i = 0; i < bodyTrs.length;) {
    const groupCell = bodyTrs[i].firstElementChild;
    let span = 1;
    const { group } = bodyTrs[i].dataset;
    while (i + span < bodyTrs.length && bodyTrs[i + span].dataset.group === group) {
      bodyTrs[i + span].firstElementChild.remove();
      span += 1;
    }
    if (span > 1) groupCell.setAttribute('rowspan', String(span));
    i += span;
  }

  table.append(thead, tbody);
  const wrapper = document.createElement('div');
  wrapper.className = 'table-product-comparison-scroll';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Product comparison');
  wrapper.setAttribute('tabindex', '0');
  wrapper.append(table);
  block.replaceChildren(wrapper);
}

/* ---- two-column-content: side-by-side content columns (list + button) ----
   Source (grace.com/products/davisil DAVISIL Sphere section) is a content
   layout, not a data table: each authored cell becomes a column holding rich
   content (bulleted lists, buttons). Cells flow row-major into a 2-column grid
   that collapses to a single column on mobile. */
function decorateTwoColumnContent(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  const grid = document.createElement('div');
  grid.className = 'table-two-column-content-grid';
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const col = document.createElement('div');
      col.className = 'table-two-column-content-cell';
      while (cell.firstChild) col.append(cell.firstChild);
      grid.append(col);
    });
  });
  block.replaceChildren(grid);
}

const DECORATORS = {
  'contact-matrix': decorateContactMatrix,
  'data-grid': decorateDataGrid,
  'link-list': decorateLinkList,
  'product-comparison': decorateProductComparison,
  'three-column': decorateThreeColumn,
  'two-column-content': decorateTwoColumnContent,
};

export default function decorate(block) {
  const variant = getVariant(block);
  (DECORATORS[variant] || decorateDataGrid)(block);
}
