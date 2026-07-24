/**
 * Table Data Grid
 * Decorates EDS block rows (div > div cells) into a semantic multi-column
 * <table> with a header row. The first EDS row becomes <thead>, the rest
 * become <tbody> rows.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    const isHeader = rowIndex === 0;

    cells.forEach((cell) => {
      const el = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) el.setAttribute('scope', 'col');
      // move authored content (paragraphs, links, text) into the cell as-is
      while (cell.firstChild) el.append(cell.firstChild);
      tr.append(el);
    });

    (isHeader ? thead : tbody).append(tr);
  });

  table.append(thead);
  if (tbody.children.length) table.append(tbody);

  // wrapper matches source: auto table-layout compresses/wraps to fit width
  const scroller = document.createElement('div');
  scroller.className = 'table-data-grid-scroll';
  scroller.append(table);

  block.replaceChildren(scroller);
}
