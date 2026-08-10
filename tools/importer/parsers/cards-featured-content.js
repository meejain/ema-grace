/* eslint-disable */
/* global WebImporter */
/**
 * cards-featured-content -> EDS `Cards (featured-content)`
 * Source: .featured-blog-cmp (the "Latest Insights"/related-articles block on insight articles
 * and many pages). Each card is `a.item[href]` with `.image img` (Scene7 bg/img) + `.blog-content`
 * (.tag category + .blog-heading title + Read more). PARSES the REAL page cards — this replaces
 * the earlier seed-from-draft (which injected placeholder draft images and wrong articles).
 *
 * Emits one card per item: image | (category strong + linked title + "Read more >").
 * When the caller sets `params.emitFeaturedHeading` (default/product path), ALSO emits the section
 * heading ("Latest Insights from Grace") + "View all articles" link as siblings before the block.
 * On the insights path buildInsightsArticle emits that heading itself, so it leaves the flag unset.
 */
export default function parse(element, { document, params }) {
  const cmp = element.classList && element.classList.contains('featured-blog-cmp')
    ? element : (element.closest('.featured-blog-cmp') || element);
  const items = Array.from(cmp.querySelectorAll('.featured-blog-list .item, a.item, .item'));
  if (!items.length) return;

  // Capture heading + CTA from the feature-blog region BEFORE detaching the host.
  const scope = element.closest('.feature-blog') || cmp;
  const headingEl = scope.querySelector('.header .title h2, .header h2, .featured-blog-header h2')
    || Array.from(scope.querySelectorAll('h2')).find((h) => /insight/i.test(h.textContent || ''));
  const headingText = (headingEl && (headingEl.textContent || '').replace(/\s+/g, ' ').trim())
    || 'Latest Insights from Grace';
  const ctaEl = scope.querySelector('a.all-articles-cta, a[href*="/insights"], a[href*="/blog"]');
  const ctaHref = ctaEl ? (ctaEl.getAttribute('href') || '/insights') : '/insights';

  const cells = items.map((item) => {
    // Image: real <img>, else the background-image URL on .image.
    let img = item.querySelector('.image img, picture img, img');
    const imageCell = [];
    if (img) {
      imageCell.push(img.cloneNode(true));
    } else {
      const imgDiv = item.querySelector('.image[style*="background-image"]');
      const m = imgDiv && (imgDiv.getAttribute('style') || '').match(/url\((['"]?)(.*?)\1\)/);
      if (m && m[2]) { const el = document.createElement('img'); el.src = m[2]; el.alt = ''; imageCell.push(el); }
    }

    const href = item.getAttribute('href') || (item.querySelector('a[href]') || {}).getAttribute?.('href') || '';
    const category = (item.querySelector('.tag') || {}).textContent || '';
    const title = (item.querySelector('.blog-heading, .blog-title') || {}).textContent || '';

    const content = [];
    if (category.trim()) { const s = document.createElement('strong'); s.textContent = category.trim(); content.push(s); }
    if (title.trim()) {
      const a = document.createElement('a');
      a.href = href || '#';
      a.textContent = title.trim();
      content.push(a);
    }
    if (href) {
      const s = document.createElement('strong');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'Read more >';
      s.append(a);
      content.push(s);
    }
    return [imageCell, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (featured-content)', cells });
  const host = element.closest('.featured-blog-cmp') || cmp;
  host.replaceWith(block);

  // Default/product path: emit the heading + "View all articles" as siblings before the block, in
  // the SAME section, so cards.css featured-content header styling picks them up. (Insights path
  // leaves params.emitFeaturedHeading unset — buildInsightsArticle emits its own copy.)
  if (params && params.emitFeaturedHeading && block.parentNode) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = ctaHref;
    a.textContent = 'View all articles';
    p.append(a);
    block.parentNode.insertBefore(h2, block);
    block.parentNode.insertBefore(p, block);
  }
}
