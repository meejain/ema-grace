/**
 * Custom Widget: Search Results
 * Decorates authored rows into static search-result items.
 *
 * Content model (EDS block table):
 *  - Optional first row with a single cell = results-count header
 *    (e.g. "Showing 1-8 of 176"). Detected as a row with no link.
 *  - Each subsequent row = one result:
 *      cell 1: title link (<a>)
 *      cell 2: snippet / description text
 *      cell 3: display URL / breadcrumb (optional)
 *
 * Static content only (no live search).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const list = document.createElement('ul');
  list.className = 'search-results-list';

  rows.forEach((row) => {
    const cells = [...row.children];
    const hasLink = row.querySelector('a');

    // Results-count header: a row without a link.
    if (!hasLink) {
      const text = row.textContent.trim();
      if (text) {
        const header = document.createElement('p');
        header.className = 'search-results-count';
        header.textContent = text;
        block.insertBefore(header, block.firstElementChild);
      }
      return;
    }

    const item = document.createElement('li');
    item.className = 'search-results-item';

    const link = row.querySelector('a');
    const anchor = document.createElement('a');
    anchor.href = link.getAttribute('href');
    anchor.className = 'search-results-link';

    const title = document.createElement('span');
    title.className = 'search-results-title';
    title.textContent = link.textContent.trim();
    anchor.append(title);

    // Snippet + display URL live in the remaining cells.
    const [, snippetCell, urlCell] = cells;

    if (snippetCell) {
      const snippet = snippetCell.textContent.trim();
      if (snippet) {
        const desc = document.createElement('span');
        desc.className = 'search-results-description';
        desc.textContent = snippet;
        anchor.append(desc);
      }
    }

    if (urlCell) {
      const url = urlCell.textContent.trim();
      if (url) {
        const cite = document.createElement('span');
        cite.className = 'search-results-url';
        cite.textContent = url;
        anchor.append(cite);
      }
    }

    item.append(anchor);
    list.append(item);
  });

  // Remove original rows, keep any inserted count header, append the list.
  rows.forEach((row) => row.remove());
  block.append(list);
}
