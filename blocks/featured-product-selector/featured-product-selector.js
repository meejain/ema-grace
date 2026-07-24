/**
 * Featured Product Selector
 * Authored rows:
 *  - Row 1 (single cell): section label, e.g. "Featured Products"
 *  - Row 2..n (four cells): [image] [title] [description] [link]
 *
 * Renders a row of dark product tiles that act as an accessible selector.
 * Tiles are solid dark panels with a centered title. Selecting a tile
 * (click / keyboard / hover) turns it light and reveals that product's
 * description and "Learn More" call to action.
 *
 * The source design uses no imagery inside the tiles, so the authored
 * image cell (if present) is ignored for rendering.
 * @param {Element} block The featured-product-selector block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [labelRow, ...productRows] = rows;

  // --- label column ---------------------------------------------------------
  const label = document.createElement('div');
  label.className = 'featured-product-selector-label';
  if (labelRow) {
    const cell = labelRow.firstElementChild || labelRow;
    label.innerHTML = cell.innerHTML;
  }

  // --- tiles list -----------------------------------------------------------
  const list = document.createElement('div');
  list.className = 'featured-product-selector-list';
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', label.textContent.trim() || 'Featured products');

  const tiles = [];

  productRows.forEach((row, i) => {
    const cells = [...row.children];
    // cells: [image][title][description][link] — image cell is intentionally unused
    const [, titleCell, descCell, linkCell] = cells;

    const title = (titleCell?.textContent || '').trim();
    const sourceLink = linkCell?.querySelector('a');
    const href = sourceLink?.getAttribute('href') || '#';

    const tile = document.createElement('a');
    tile.className = 'featured-product-selector-tile';
    tile.href = href;
    tile.setAttribute('role', 'tab');
    tile.id = `fps-tile-${i}`;
    tile.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tile.tabIndex = i === 0 ? 0 : -1;

    const content = document.createElement('div');
    content.className = 'featured-product-selector-content';

    const heading = document.createElement('p');
    heading.className = 'featured-product-selector-title';
    heading.textContent = title;
    content.append(heading);

    const desc = document.createElement('p');
    desc.className = 'featured-product-selector-desc';
    desc.textContent = (descCell?.textContent || '').trim();
    content.append(desc);

    const cta = document.createElement('span');
    cta.className = 'featured-product-selector-cta';
    cta.textContent = 'Learn More';
    content.append(cta);

    tile.append(content);
    list.append(tile);
    tiles.push(tile);
  });

  const select = (index) => {
    tiles.forEach((t, i) => {
      const selected = i === index;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
    });
  };

  list.addEventListener('mouseover', (e) => {
    const tile = e.target.closest('.featured-product-selector-tile');
    if (tile) select(tiles.indexOf(tile));
  });

  list.addEventListener('focusin', (e) => {
    const tile = e.target.closest('.featured-product-selector-tile');
    if (tile) select(tiles.indexOf(tile));
  });

  list.addEventListener('keydown', (e) => {
    const current = tiles.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    let next = current;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (current + 1) % tiles.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (current - 1 + tiles.length) % tiles.length;
    else return;
    e.preventDefault();
    select(next);
    tiles[next].focus();
  });

  block.textContent = '';
  block.append(label, list);
}
