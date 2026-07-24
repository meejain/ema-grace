/**
 * Table Three Column
 * Transforms EDS block rows into a semantic three-column <table>.
 * The first authored row becomes the <thead> header row; the remaining
 * rows become <tbody> data rows. Each cell keeps its authored content.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const buildCells = (row, tag) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const el = document.createElement(tag);
      if (tag === 'th') el.setAttribute('scope', 'col');
      while (cell.firstChild) el.append(cell.firstChild);
      // unwrap a single stray <p> so header labels sit directly in the cell
      const only = el.children.length === 1 ? el.firstElementChild : null;
      if (tag === 'th' && only && only.tagName === 'P') {
        while (only.firstChild) el.insertBefore(only.firstChild, only);
        only.remove();
      }
      tr.append(el);
    });
    return tr;
  };

  const [headerRow, ...dataRows] = rows;
  thead.append(buildCells(headerRow, 'th'));
  dataRows.forEach((row) => tbody.append(buildCells(row, 'td')));

  table.append(thead);
  if (dataRows.length) table.append(tbody);

  block.replaceChildren(table);
}
