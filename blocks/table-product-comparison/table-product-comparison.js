/**
 * Table Product Comparison
 * Transforms EDS block rows into a semantic product comparison <table>.
 * The first authored row becomes the <thead> header (product attributes across
 * the top); each remaining row is a product. The first column ("Silica Type")
 * groups consecutive products that share a value into a single rowspan cell.
 * The table is wrapped in a horizontally scrollable container for small screens.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // move authored cell content into a table cell of the given tag
  const fill = (cell, tag, scope) => {
    const el = document.createElement(tag);
    if (scope) el.setAttribute('scope', scope);
    while (cell.firstChild) el.append(cell.firstChild);
    // unwrap a single stray <p> so labels sit directly in the cell
    const only = el.children.length === 1 ? el.firstElementChild : null;
    if (only && only.tagName === 'P') {
      while (only.firstChild) el.insertBefore(only.firstChild, only);
      only.remove();
    }
    return el;
  };

  const [headerRow, ...dataRows] = rows;

  // header row -> <th scope="col">
  const htr = document.createElement('tr');
  [...headerRow.children].forEach((cell) => htr.append(fill(cell, 'th', 'col')));
  thead.append(htr);

  // data rows -> <tr>, first cell is the grouping label
  const bodyTrs = dataRows.map((row) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');
    const label = (cells[0]?.textContent || '').trim();
    tr.dataset.group = label;
    // first column: row-group header cell
    tr.append(fill(cells[0], 'th', 'rowgroup'));
    // remaining columns: data cells
    cells.slice(1).forEach((cell) => tr.append(fill(cell, 'td')));
    tbody.append(tr);
    return tr;
  });

  // merge consecutive rows that share the same first-column value into a rowspan
  for (let i = 0; i < bodyTrs.length;) {
    const groupCell = bodyTrs[i].firstElementChild;
    let span = 1;
    while (
      i + span < bodyTrs.length
      && bodyTrs[i + span].dataset.group === bodyTrs[i].dataset.group
    ) {
      const dup = bodyTrs[i + span].firstElementChild;
      dup.remove();
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
