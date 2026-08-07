/**
 * Breadcrumb block.
 * The trail is derived ENTIRELY from the current URL path — authors don't need
 * to specify any crumbs. "Home" links to /, each intermediate path segment
 * links to its cumulative path, and the current page (the last segment) is
 * omitted, matching the grace.com insights breadcrumb (e.g. "Home / Insights").
 * Any authored rows are ignored so the trail is always correct.
 * Decorates into semantic <nav aria-label="Breadcrumb"><ol><li>…</li></ol></nav>
 * with BreadcrumbList schema.
 * @param {Element} block
 */

// Connector words stay lowercase; every other word is capitalized. Display
// casing (e.g. uppercase) is left to CSS.
const MINOR_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'is', 'nor', 'of', 'on', 'or', 'the', 'to']);

// Path segments that are content-root / working folders, not public path parts.
const IGNORED_SEGMENTS = new Set(['content', 'drafts']);

function slugToLabel(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export default function decorate(block) {
  const segments = window.location.pathname
    .replace(/\.(plain\.html|html)$/i, '')
    .split('/')
    .filter(Boolean)
    .filter((s) => !IGNORED_SEGMENTS.has(s.toLowerCase()));

  // Ancestors only — drop the current page (last segment), matching the source
  // breadcrumb which shows just "Home / Insights" on an article.
  const ancestors = segments.slice(0, -1);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.setAttribute('itemscope', '');
  ol.setAttribute('itemtype', 'https://schema.org/BreadcrumbList');

  const crumbs = [{ label: 'Home', href: '/' }];
  let cumulative = '';
  ancestors.forEach((segment) => {
    cumulative += `/${segment}`;
    crumbs.push({ label: slugToLabel(segment), href: cumulative });
  });

  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');
    li.setAttribute('itemprop', 'itemListElement');
    li.setAttribute('itemscope', '');
    li.setAttribute('itemtype', 'https://schema.org/ListItem');

    const a = document.createElement('a');
    a.href = crumb.href;
    a.setAttribute('itemprop', 'item');
    const span = document.createElement('span');
    span.setAttribute('itemprop', 'name');
    span.textContent = crumb.label;
    a.append(span);
    li.append(a);

    const meta = document.createElement('meta');
    meta.setAttribute('itemprop', 'position');
    meta.setAttribute('content', String(i + 1));
    li.append(meta);

    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
