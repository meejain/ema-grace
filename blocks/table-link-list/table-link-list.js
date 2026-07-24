/**
 * Table Link List
 * Decorates authored block rows into a semantic <table> styled as a link list.
 * First block row becomes the header row (<th>); remaining rows become body
 * cells (<td>) that contain a stacked list of links.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, index) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');

    cells.forEach((cell) => {
      const isHeader = index === 0;
      const el = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) el.setAttribute('scope', 'col');

      // Reverse any EDS button decoration so links render as plain links.
      cell.querySelectorAll('a.button').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary', 'accent');
      });
      cell.querySelectorAll('.button-container').forEach((p) => {
        p.classList.remove('button-container');
      });

      el.innerHTML = cell.innerHTML.trim();
      tr.append(el);
    });

    (index === 0 ? thead : tbody).append(tr);
  });

  if (thead.children.length) table.append(thead);
  if (tbody.children.length) table.append(tbody);

  block.textContent = '';
  block.append(table);
}
