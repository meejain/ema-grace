/**
 * Breadcrumb block.
 * Authored as one row per crumb, each row a single cell holding a link (the last
 * crumb may be plain text = the current page). Decorates into semantic
 * <nav aria-label="Breadcrumb"><ol><li>…</li></ol></nav> with BreadcrumbList
 * schema, matching the source markup.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.setAttribute('itemscope', '');
  ol.setAttribute('itemtype', 'https://schema.org/BreadcrumbList');

  rows.forEach((row, i) => {
    const cell = row.querySelector(':scope > div') || row;
    const anchor = cell.querySelector('a');
    const text = (cell.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    const li = document.createElement('li');
    li.setAttribute('itemprop', 'itemListElement');
    li.setAttribute('itemscope', '');
    li.setAttribute('itemtype', 'https://schema.org/ListItem');

    if (anchor && anchor.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = anchor.getAttribute('href');
      a.setAttribute('itemprop', 'item');
      const span = document.createElement('span');
      span.setAttribute('itemprop', 'name');
      span.textContent = anchor.textContent.replace(/\s+/g, ' ').trim();
      a.append(span);
      li.append(a);
    } else {
      // current page — no link
      const span = document.createElement('span');
      span.setAttribute('itemprop', 'name');
      span.setAttribute('aria-current', 'page');
      span.textContent = text;
      li.append(span);
    }

    const meta = document.createElement('meta');
    meta.setAttribute('itemprop', 'position');
    meta.setAttribute('content', String(i + 1));
    li.append(meta);

    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
