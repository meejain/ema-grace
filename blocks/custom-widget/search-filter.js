// Inline search (magnifying glass) icon, recreated to match the source fa-search glyph.
const SEARCH_ICON = `<svg class="custom-widget-search-filter-search-icon" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.47 6.47 0 0 0 1.57-4.23 6.5 6.5 0 1 0-6.5 6.5 6.47 6.47 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.49 4.49 0 0 1 9.5 14Z"/>
</svg>`;

// Inline chevron icon used for the mobile filter toggle.
const CHEVRON_ICON = `<svg class="custom-widget-search-filter-chevron" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z"/>
</svg>`;

/**
 * Build the search form (text input + search button).
 * @param {string} placeholder placeholder text for the input
 * @returns {HTMLElement} the search form element
 */
function buildSearchForm(placeholder) {
  const form = document.createElement('div');
  form.className = 'custom-widget-search-filter-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'custom-widget-search-filter-input';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'custom-widget-search-filter-search-btn';
  button.setAttribute('aria-label', placeholder);
  button.innerHTML = SEARCH_ICON;

  form.append(input, button);
  return form;
}

/**
 * Create a single filter tag button.
 * @param {string} label visible label
 * @param {string} extraClass additional class name
 * @returns {HTMLButtonElement} the button
 */
function buildTag(label, extraClass) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = extraClass;
  btn.setAttribute('aria-pressed', 'false');
  const span = document.createElement('span');
  span.textContent = label;
  btn.append(span);
  return btn;
}

/**
 * loads and decorates the search filter widget
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Row 1: search placeholder text.
  const placeholder = rows[0] ? rows[0].textContent.trim() : 'Search';

  // Row 2: filter labels from the authored list; first entry is the "All" control.
  const labels = rows[1]
    ? [...rows[1].querySelectorAll('li')].map((li) => li.textContent.trim()).filter(Boolean)
    : [];
  const allLabel = labels.length ? labels[0] : 'All';
  const tagLabels = labels.slice(1);

  // Build search form.
  const searchBar = document.createElement('div');
  searchBar.className = 'custom-widget-search-filter-bar';
  searchBar.append(buildSearchForm(placeholder));

  // Build the tag bar: "All" button + toggle + tag list.
  const tagBar = document.createElement('div');
  tagBar.className = 'custom-widget-search-filter-tag-bar';

  const allBtn = buildTag(allLabel, 'custom-widget-search-filter-all active');
  allBtn.setAttribute('aria-pressed', 'true');

  const tagList = document.createElement('div');
  tagList.className = 'custom-widget-search-filter-tag-list';
  tagList.setAttribute('role', 'group');
  tagList.setAttribute('aria-label', 'Filter by category');
  const tags = tagLabels.map((label) => {
    const t = buildTag(label, 'custom-widget-search-filter-tag');
    tagList.append(t);
    return t;
  });

  // Mobile toggle to expand/collapse the tag list.
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'custom-widget-search-filter-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'custom-widget-search-filter-tag-list');
  toggle.innerHTML = `<span>Filter</span>${CHEVRON_ICON}`;
  tagList.id = 'custom-widget-search-filter-tag-list';

  tagBar.append(allBtn, toggle, tagList);

  // Interaction: selecting a tag activates it and clears the others / "All".
  const clearAll = () => {
    tags.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-pressed', 'false');
    });
    allBtn.classList.remove('active');
    allBtn.setAttribute('aria-pressed', 'false');
  };

  allBtn.addEventListener('click', () => {
    clearAll();
    allBtn.classList.add('active');
    allBtn.setAttribute('aria-pressed', 'true');
  });

  tags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const isActive = tag.classList.contains('active');
      clearAll();
      if (!isActive) {
        tag.classList.add('active');
        tag.setAttribute('aria-pressed', 'true');
      } else {
        allBtn.classList.add('active');
        allBtn.setAttribute('aria-pressed', 'true');
      }
    });
  });

  // Mobile expand/collapse toggle.
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    tagBar.classList.toggle('is-open', !expanded);
  });

  block.replaceChildren(searchBar, tagBar);
}
