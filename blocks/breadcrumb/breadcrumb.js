/**
 * Breadcrumb block.
 * The trail is derived ENTIRELY from the current URL path — authors don't need
 * to specify any crumbs. "Home" links to /, each intermediate path segment
 * links to its cumulative path, and the current page (the last segment) is
 * omitted by default, matching the grace.com insights breadcrumb
 * (e.g. "Home / Insights").
 *
 * LEAF OPT-IN: some page types show the CURRENT page as a trailing non-link
 * leaf crumb (e.g. location details: "Home / About Grace / Locations /
 * Aiken, SC, USA"). To enable that, the importer authors a `leaf` row:
 *   | Breadcrumb |            |
 *   | leaf       | Aiken, SC, USA |
 * The 2nd cell is the leaf label (source's last crumb). When present, the
 * current page is appended as plain text. Any OTHER authored rows are ignored.
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
  // LEAF opt-in: the importer authors a two-row block — a `leaf` marker row followed by a row
  // holding the current-page label — to show a trailing non-link crumb. Read it (label from the
  // marker row's 2nd cell if present, else the NEXT row) BEFORE we replace the block content.
  let leafLabel = '';
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const leafIdx = rows.findIndex((row) => {
    const first = row.querySelector(':scope > div');
    return first && (first.textContent || '').trim().toLowerCase() === 'leaf';
  });
  const leafRow = leafIdx >= 0 ? rows[leafIdx] : null;
  if (leafRow) {
    const cells = leafRow.querySelectorAll(':scope > div');
    if (cells[1] && (cells[1].textContent || '').trim()) {
      leafLabel = (cells[1].textContent || '').trim();
    } else if (rows[leafIdx + 1]) {
      leafLabel = (rows[leafIdx + 1].textContent || '').trim();
    }
  }

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

  // Trailing leaf crumb (current page) as plain text — only when opted in via the
  // authored `leaf` row (e.g. location details). Falls back to the URL slug label.
  if (leafLabel || leafRow) {
    const label = leafLabel || slugToLabel(segments[segments.length - 1] || '');
    if (label) {
      const li = document.createElement('li');
      li.setAttribute('itemprop', 'itemListElement');
      li.setAttribute('itemscope', '');
      li.setAttribute('itemtype', 'https://schema.org/ListItem');
      const span = document.createElement('span');
      span.setAttribute('itemprop', 'name');
      span.textContent = label;
      li.append(span);
      const meta = document.createElement('meta');
      meta.setAttribute('itemprop', 'position');
      meta.setAttribute('content', String(crumbs.length + 1));
      li.append(meta);
      ol.append(li);
    }
  }

  nav.append(ol);
  block.replaceChildren(nav);
}
