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

  // Normalize a path for comparison: drop a leading `/content` prefix (the local
  // preview serves pages under /content/… while authored hrefs are root-relative),
  // strip a trailing slash, and collapse repeated hyphens within each segment. The
  // nav <a> hrefs still carry grace.com's source slug (e.g.
  // `unipol--pp-process-technology`), but the page is served at the sanitized
  // single-hyphen path — without this NO option matches the current page, so the
  // <select> falls back to its first option (the parent) instead of the page you
  // are on.
  const normalize = (p) => p
    .replace(/^\/content/, '')
    .replace(/\/$/, '')
    .split('/')
    .map((seg) => seg.replace(/-{2,}/g, '-'))
    .join('/');
  const here = normalize(window.location.pathname);
  // Collect nav links. Product-hub navs are a FLAT list (`> li > a`); the industries
  // detail nav is NESTED — a parent hub `<li>` whose link sits in a `<p>` (`> li > p > a`)
  // plus a nested `<ul>` of sibling-page options (`> li > ul > li > a`). Grab every anchor
  // inside the nav list in document order so BOTH shapes populate the mobile <select>
  // (a flat-only `> li > a` selector matched nothing on the nested nav → empty select →
  // the hidden <ul> left the whole rail blank on mobile). The promo card lives in a
  // SEPARATE sibling <ul> (its own cards block), so it is not part of `list`.
  const links = list.querySelectorAll('a');
  links.forEach((a) => {
    const option = document.createElement('option');
    const href = a.getAttribute('href') || '';
    option.value = href;
    option.textContent = a.textContent.trim();
    if (normalize(href) === here) option.selected = true;
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
