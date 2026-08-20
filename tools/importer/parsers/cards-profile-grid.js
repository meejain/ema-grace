/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-profile-grid  ->  EDS `Cards (profile-grid)`
 * Source: https://grace.com/about-grace/leadership-team/
 * Receives the grid CONTAINER. Profile cards are .col-lg-6 with a .media-callout headshot +
 * h3 name + h4 role + a "Read more" link to the person's bio page.
 *
 * Emits one row per profile: headshot | (h3 name + h4 role + "Read more" bio link).
 *
 * BIO LINK — derived, not scraped. The source "Read more" href is populated by client JS, so the
 * importer's headless capture often serializes it empty/missing (flaky hydration → cards lost their
 * links). The bio URL is deterministic from the person's name, so we DERIVE it:
 * h3 "Ed Sparks" → /about-grace/leadership-team/ed-sparks. If the source anchor DID hydrate with a
 * real /about-grace/leadership-team/<slug> href we honor that; otherwise we synthesize from the name.
 */

const isProfile = (c) => c.querySelector('.media-callout') && c.querySelector('h3');

const imageOf = (item) => item.querySelector('.media-callout picture, .image picture, picture')
  || item.querySelector('.media-callout img, .image img, img')
  || null;

/** Slugify a person's name for the bio path: "Kerrie L. Wolfe" → "kerrie-l-wolfe". */
function nameToSlug(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[.,]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The bio href: prefer a hydrated source anchor, else derive from the name. */
function bioHref(item, name) {
  const a = Array.from(item.querySelectorAll('a[href]'))
    .find((x) => /\/about-grace\/leadership-team\/[a-z]/i.test(x.getAttribute('href') || ''));
  if (a) {
    return (a.getAttribute('href') || '')
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/content\/grace\/us\/en/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
  }
  const slug = nameToSlug(name);
  return slug ? `/about-grace/leadership-team/${slug}` : '';
}

export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.col-lg-6')).filter(isProfile)
    .filter((c, _i, arr) => !arr.some((o) => o !== c && c.contains(o)));
  if (!items.length) return;

  const cells = items.map((item) => {
    const img = imageOf(item);
    const imageCell = img ? [img.cloneNode(true)] : [];

    const content = [];
    const h3 = item.querySelector('h3');
    const h4 = item.querySelector('h4');
    const name = h3 ? (h3.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (h3) content.push(h3.cloneNode(true));
    if (h4) content.push(h4.cloneNode(true));

    const href = bioHref(item, name);
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = 'Read more';
      p.appendChild(a);
      content.push(p);
    }

    return [imageCell, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (profile-grid)', cells });
  element.replaceWith(block);
}
