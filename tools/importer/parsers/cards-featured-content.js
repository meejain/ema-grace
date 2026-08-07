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
 */
export default function parse(element, { document }) {
  const cmp = element.classList && element.classList.contains('featured-blog-cmp')
    ? element : (element.closest('.featured-blog-cmp') || element);
  const items = Array.from(cmp.querySelectorAll('.featured-blog-list .item, a.item, .item'));
  if (!items.length) return;

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
  // NOTE: the "Latest Insights from Grace" section heading is emitted by buildInsightsArticle
  // (as default content just before this block's section), NOT here — the insights builder only
  // collects the created <table> into its output, so an <h2> sibling added here would be dropped.
}
