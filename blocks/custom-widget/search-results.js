/**
 * Custom Widget: Search Results
 * Decorates authored rows into a full search-results layout matching
 * grace.com/search-results: a two-column layout with a facet filter sidebar
 * (results count + "Clear all filters" + a gray checkbox panel) and a results
 * column (result counter + "Show N" dropdown, pagination, and result items).
 *
 * Content model (EDS block table) — rows are routed by their first cell:
 *  - "Search Hero"           → cell 2 holds the query term; renders the blue
 *                              "Search Results" hero band with the search field.
 *  - "Results: N"            → filter heading (count + Clear all filters)
 *  - "Refine Results by:"    → cell 2 holds a <ul> of "Label (n)" facets; the
 *                              active facet's <li> is wrapped in <strong>.
 *  - "Showing 1-13 of 13"    → result counter + a "Show" items-per-page select
 *  - "Pagination"            → cell 2 holds the page count (e.g. "1")
 *  - anything else           → a result item: cell 1 = title link, cell 2 =
 *                              description.
 *
 * Front-end search: typing in the hero field (or clicking the search button)
 * filters the authored results by keyword against title + description. The
 * results count, "Showing X of Y" line and pagination all update live. This is
 * a client-side stand-in until the real tag-based page search is wired up.
 * @param {Element} block The block element
 */

const SEARCH_PAGE_SIZES = ['5', '15', '30', '100'];
const DEFAULT_PAGE_SIZE = 15;
const NO_RESULTS_TEXT = 'Sorry. There are no results found based on your search criteria.';

// Search (magnifying glass) icon for the hero field.
const HERO_SEARCH_ICON = '<svg class="search-results-hero-icon" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.47 6.47 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5 6.47 6.47 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.49 4.49 0 0 1 9.5 14Z"/></svg>';
// Funnel icon for the mobile "Filters" toggle.
const FILTER_ICON = '<svg class="search-results-filters-icon" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M3 4h18l-7 8v6l-4 2v-8L3 4Z"/></svg>';

/** Build the blue "Search Results" hero band with the search field. */
function buildHero(query) {
  const hero = document.createElement('div');
  hero.className = 'search-results-hero';

  const content = document.createElement('div');
  content.className = 'search-results-hero-content';

  const title = document.createElement('p');
  title.className = 'search-results-hero-title';
  title.textContent = 'Search Results';

  const form = document.createElement('div');
  form.className = 'search-results-hero-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-results-hero-field';
  input.value = query || '';
  input.placeholder = 'Search term';
  input.setAttribute('aria-label', 'Search term');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'search-results-hero-btn';
  btn.setAttribute('aria-label', 'Search');
  btn.innerHTML = HERO_SEARCH_ICON;

  form.append(input, btn);
  content.append(title, form);
  hero.append(content);
  return { hero, input, btn };
}

/** Build the facet checkbox list (shared by desktop panel + mobile modal). */
function buildFacetList(listEl, idPrefix) {
  const ul = document.createElement('ul');
  ul.className = 'search-results-facets';

  [...listEl.querySelectorAll('li')].forEach((li, i) => {
    const checked = !!li.querySelector('strong');
    const label = li.textContent.trim();
    const item = document.createElement('li');
    item.className = 'search-results-facet';

    const id = `${idPrefix}-${i}`;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.className = 'search-results-facet-checkbox';
    input.checked = checked;

    const lab = document.createElement('label');
    lab.className = 'search-results-facet-label';
    lab.setAttribute('for', id);
    lab.textContent = label;

    item.append(input, lab);
    ul.append(item);
  });
  return ul;
}

/** Build a single result <li> from parsed result data. */
function buildResultItem(data) {
  const item = document.createElement('li');
  item.className = 'search-results-item';

  const anchor = document.createElement('a');
  anchor.href = data.href;
  anchor.className = 'search-results-link';

  const title = document.createElement('span');
  title.className = 'search-results-title';
  title.textContent = data.title;
  anchor.append(title);

  if (data.description) {
    const desc = document.createElement('span');
    desc.className = 'search-results-description';
    desc.textContent = data.description;
    anchor.append(desc);
  }

  item.append(anchor);
  return item;
}

/** Build a centered pagination control with `pages` pages, `current` active. */
function buildPagination(pages, current, onPage, position) {
  const nav = document.createElement('nav');
  nav.className = `search-results-pagination search-results-pagination-${position}`;
  nav.setAttribute('aria-label', 'Search results pages');

  const ul = document.createElement('ul');

  const makeBtn = (label, cls, ariaLabel) => {
    const li = document.createElement('li');
    li.className = cls;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = label;
    if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
    li.append(btn);
    return { li, btn };
  };

  const prev = makeBtn('<span class="search-results-chevron search-results-chevron-left"></span>', 'search-results-page-prev', 'Previous page');
  if (current <= 1) prev.btn.classList.add('disabled');
  else prev.btn.addEventListener('click', () => onPage(current - 1));
  ul.append(prev.li);

  for (let i = 1; i <= pages; i += 1) {
    const { li, btn } = makeBtn(String(i), 'search-results-page');
    if (i === current) btn.classList.add('active');
    else btn.addEventListener('click', () => onPage(i));
    ul.append(li);
  }

  const next = makeBtn('<span class="search-results-chevron search-results-chevron-right"></span>', 'search-results-page-next', 'Next page');
  if (current >= pages) next.btn.classList.add('disabled');
  else next.btn.addEventListener('click', () => onPage(current + 1));
  ul.append(next.li);

  nav.append(ul);
  return nav;
}

/**
 * loads and decorates the search results widget
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  let filterList = null;
  let heroQuery = '';
  let hasHero = false;
  const allResults = [];

  rows.forEach((row) => {
    const firstCell = row.children[0];
    const key = firstCell ? firstCell.textContent.trim() : '';
    const lower = key.toLowerCase();

    if (lower === 'search hero') {
      hasHero = true;
      heroQuery = row.children[1] ? row.children[1].textContent.trim() : '';
    } else if (lower === 'refine results by:') {
      filterList = row.children[1] ? row.children[1].querySelector('ul, ol') : null;
    } else if (lower.startsWith('results:') || lower.startsWith('showing') || lower === 'pagination') {
      // Count / showing / pagination rows are now computed dynamically — skip.
    } else if (row.querySelector('a')) {
      const link = row.querySelector('a');
      allResults.push({
        title: link.textContent.trim(),
        href: link.getAttribute('href') || '#',
        description: row.children[1] ? row.children[1].textContent.trim() : '',
      });
    }
  });

  // --- Sidebar (filter heading + gray facet panel) ---
  const sidebar = document.createElement('div');
  sidebar.className = 'search-results-sidebar';

  const amount = document.createElement('span');
  amount.className = 'search-results-amount';

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'search-results-clear';
  clear.textContent = 'Clear all filters';

  const heading = document.createElement('div');
  heading.className = 'search-results-filter-heading';
  heading.append(amount, clear);
  sidebar.append(heading);

  // Desktop facet panel (gray box, always visible on desktop).
  let desktopPanel = null;
  if (filterList) {
    desktopPanel = document.createElement('div');
    desktopPanel.className = 'search-results-filter-panel';
    const title = document.createElement('h3');
    title.className = 'search-results-filter-title';
    title.textContent = 'Refine Results by:';
    desktopPanel.append(title, buildFacetList(filterList, 'search-facet'));
    sidebar.append(desktopPanel);
  }

  // Mobile "Filters" toggle button (shown < 900px in place of the panel).
  const filtersToggle = document.createElement('button');
  filtersToggle.type = 'button';
  filtersToggle.className = 'search-results-filters-toggle';
  filtersToggle.setAttribute('aria-haspopup', 'dialog');
  filtersToggle.innerHTML = `<span class="search-results-filters-label">Filters</span>${FILTER_ICON}`;
  sidebar.append(filtersToggle);

  // --- Mobile filter modal (full-screen gray panel from the top) ---
  let modal = null;
  if (filterList) {
    modal = document.createElement('div');
    modal.className = 'search-results-filter-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Refine results');

    const closeRow = document.createElement('div');
    closeRow.className = 'search-results-modal-close-row';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'search-results-modal-close';
    closeBtn.setAttribute('aria-label', 'Close filters');
    closeBtn.innerHTML = '&times;';
    closeRow.append(closeBtn);

    const clearRow = document.createElement('div');
    clearRow.className = 'search-results-modal-clear-row';
    const modalClear = document.createElement('button');
    modalClear.type = 'button';
    modalClear.className = 'search-results-clear';
    modalClear.textContent = 'Clear all filters';
    clearRow.append(modalClear);

    const modalTitle = document.createElement('h3');
    modalTitle.className = 'search-results-filter-title';
    modalTitle.textContent = 'Refine Results by:';

    const modalFacets = buildFacetList(filterList, 'search-facet-m');

    const apply = document.createElement('button');
    apply.type = 'button';
    apply.className = 'search-results-apply';
    apply.innerHTML = 'Apply <span class="search-results-apply-chevron"></span>';

    modal.append(closeRow, clearRow, modalTitle, modalFacets, apply);

    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      filtersToggle.setAttribute('aria-expanded', 'false');
    };
    const openModal = () => {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      filtersToggle.setAttribute('aria-expanded', 'true');
    };
    filtersToggle.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    apply.addEventListener('click', closeModal);
    modalClear.addEventListener('click', () => {
      modalFacets.querySelectorAll('input[type="checkbox"]').forEach((c) => { c.checked = false; });
    });
  }

  // --- Main column (counter + pagination + results) ---
  const main = document.createElement('div');
  main.className = 'search-results-main';

  const counter = document.createElement('div');
  counter.className = 'search-results-counter';
  const showing = document.createElement('span');
  showing.className = 'search-results-showing';
  const showWrap = document.createElement('label');
  showWrap.className = 'search-results-show';
  showWrap.append(document.createTextNode('Show'));
  const select = document.createElement('select');
  select.className = 'search-results-show-select';
  select.setAttribute('aria-label', 'items per page');
  SEARCH_PAGE_SIZES.forEach((size) => {
    const opt = document.createElement('option');
    opt.value = size;
    opt.textContent = size;
    if (Number(size) === DEFAULT_PAGE_SIZE) opt.selected = true;
    select.append(opt);
  });
  showWrap.append(select);
  counter.append(showing, showWrap);

  const topPaginationHost = document.createElement('div');
  topPaginationHost.className = 'search-results-pagination-host search-results-pagination-host-top';

  const list = document.createElement('ul');
  list.className = 'search-results-list';

  const noResults = document.createElement('p');
  noResults.className = 'search-results-empty';
  noResults.textContent = NO_RESULTS_TEXT;
  noResults.hidden = true;

  const bottomPaginationHost = document.createElement('div');
  bottomPaginationHost.className = 'search-results-pagination-host search-results-pagination-host-bottom';

  main.append(counter, topPaginationHost, list, noResults, bottomPaginationHost);

  // --- State + render -------------------------------------------------
  let query = heroQuery.trim().toLowerCase();
  let pageSize = DEFAULT_PAGE_SIZE;
  let currentPage = 1;

  const getMatches = () => {
    if (!query) return allResults;
    return allResults.filter((r) => `${r.title} ${r.description}`.toLowerCase().includes(query));
  };

  const render = () => {
    const matches = getMatches();
    const total = matches.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    amount.textContent = `Results: ${total}`;

    if (total === 0) {
      // No-results state: message shown, pagination hidden.
      showing.textContent = 'Showing 0';
      list.replaceChildren();
      noResults.hidden = false;
      topPaginationHost.replaceChildren();
      bottomPaginationHost.replaceChildren();
      return;
    }

    noResults.hidden = true;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);
    showing.textContent = `Showing ${start}-${end} of ${total}`;

    const onPage = (p) => { currentPage = p; render(); };
    topPaginationHost.replaceChildren(buildPagination(totalPages, currentPage, onPage, 'top'));
    bottomPaginationHost.replaceChildren(buildPagination(totalPages, currentPage, onPage, 'bottom'));

    const startIdx = (currentPage - 1) * pageSize;
    list.replaceChildren(...matches.slice(startIdx, startIdx + pageSize).map(buildResultItem));
  };

  select.addEventListener('change', () => {
    pageSize = Number(select.value) || DEFAULT_PAGE_SIZE;
    currentPage = 1;
    render();
  });

  // --- Assemble ---
  const layout = document.createElement('div');
  layout.className = 'search-results-layout';
  layout.append(sidebar, main);

  const children = [];
  if (hasHero) {
    const { hero, input, btn } = buildHero(heroQuery);
    const applyQuery = () => {
      query = input.value.trim().toLowerCase();
      currentPage = 1;
      render();
    };
    input.addEventListener('input', applyQuery);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyQuery(); });
    btn.addEventListener('click', applyQuery);
    children.push(hero);
  }
  children.push(layout);
  if (modal) children.push(modal);

  block.replaceChildren(...children);

  render();
}
