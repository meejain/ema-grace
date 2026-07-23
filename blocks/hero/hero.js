// Convert a URL slug (e.g. "this-is-grace") into a readable label
// ("This is Grace"). Small connector words stay lowercase; everything else is
// capitalized. Display casing (uppercase) is handled by CSS.
const MINOR_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'is', 'nor', 'of', 'on', 'or', 'the', 'to']);

function slugToLabel(slug) {
  return slug
    .split('-')
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

// Build a breadcrumb from the current URL path. "Home" links to /, each
// intermediate segment links to its cumulative path, and the final segment
// (current page) is plain text.
function buildBreadcrumbFromPath() {
  // Drop content-root / working folders that are not part of the public path.
  const IGNORED_SEGMENTS = new Set(['content', 'drafts']);
  const segments = window.location.pathname
    .replace(/\.(html|plain\.html)$/i, '')
    .split('/')
    .filter(Boolean)
    .filter((s) => !IGNORED_SEGMENTS.has(s.toLowerCase()));
  if (segments.length === 0) return null;

  const ol = document.createElement('ol');
  ol.className = 'hero-breadcrumb';

  const home = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = '/';
  homeLink.textContent = 'Home';
  home.append(homeLink);
  ol.append(home);

  let cumulative = '';
  segments.forEach((segment, i) => {
    cumulative += `/${segment}`;
    const li = document.createElement('li');
    if (i < segments.length - 1) {
      const a = document.createElement('a');
      a.href = cumulative;
      a.textContent = slugToLabel(segment);
      li.append(a);
    } else {
      li.textContent = slugToLabel(segment);
    }
    ol.append(li);
  });
  return ol;
}

export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture') && !block.querySelector(':scope > div:first-child img')) {
    block.classList.add('no-image');
  }

  // Banner variant: auto-generate the breadcrumb from the current URL path.
  if (block.classList.contains('banner')) {
    const textCell = block.querySelector(':scope > div:last-child');
    const breadcrumb = buildBreadcrumbFromPath();
    if (textCell && breadcrumb) textCell.prepend(breadcrumb);
  }

  // The heading and CTA are separate elements in the original design. When the
  // authored content nests the CTA link inside the heading, lift it out so it
  // renders as a distinct button below the heading.
  const heading = block.querySelector('h1, h2, h3');
  const nestedLink = heading?.querySelector('a');
  if (nestedLink) {
    nestedLink.remove();
    heading.after(nestedLink);
  }
}
