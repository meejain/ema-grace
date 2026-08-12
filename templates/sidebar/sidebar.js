/*
 * Template: sidebar — optional JS (lazy phase, called with `main`).
 *
 * PRODUCT HUBS mobile nav: on grace.com the product-hub left section-navigation
 * collapses on mobile (<900px) into a native <select> "filter" — the current hub
 * is the selected option, and choosing another navigates to that hub. Desktop
 * shows the plain <ul> list. We build the <select> here from the authored nav
 * <ul> (so content stays a simple list); CSS toggles <ul> vs <select> by width.
 *
 * Scoped to the PRODUCT-HUB nav only: a `.section.sidebar-nav` that is NOT the
 * insights breadcrumb rail (`.breadcrumb-container`). Insights keep their rail.
 */
export default function decorate(main) {
  const nav = main.querySelector(
    '.section.sidebar-nav:not(.breadcrumb-container)',
  );
  if (!nav) return;

  const list = nav.querySelector(':scope ul');
  if (!list || nav.querySelector('.section-nav-select')) return;

  // Build the <select> from the top-level nav links.
  const select = document.createElement('select');
  select.className = 'section-nav-select';
  select.setAttribute('aria-label', 'Section navigation');

  const here = window.location.pathname.replace(/\/$/, '');
  const links = list.querySelectorAll(':scope > li > a');
  links.forEach((a) => {
    const option = document.createElement('option');
    const href = a.getAttribute('href') || '';
    option.value = href;
    option.textContent = a.textContent.trim();
    if (href.replace(/\/$/, '') === here) option.selected = true;
    select.append(option);
  });
  if (!select.options.length) return;

  select.addEventListener('change', () => {
    if (select.value) window.location.assign(select.value);
  });

  // Wrap so CSS can position the "+" indicator over the box.
  const wrapper = document.createElement('div');
  wrapper.className = 'section-nav-select-wrapper';
  wrapper.append(select);

  // Place the select right after the "Products" heading (or at the top of the
  // nav's content wrapper), as a sibling of the <ul> so CSS can toggle them.
  list.parentElement.insertBefore(wrapper, list);
}
