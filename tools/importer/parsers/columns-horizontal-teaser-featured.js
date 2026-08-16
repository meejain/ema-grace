/* eslint-disable */
/* global WebImporter */
/**
 * columns-horizontal-teaser-featured -> EDS `Columns (horizontal-teaser-featured)`
 * Source: grace.com/industries/agriculture/ — a.item.slate-bkgd (dark "Featured Products",
 * no image). Receives the carousel container; emits title | body+link per item.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('a.item.slate-bkgd'));
  if (!items.length) return;
  // A dark "Featured" card may carry a left image (a.item.slate-bkgd.tab-img — e.g.
  // value-creation, chemical-processing). When ANY card in this carousel has an image we emit a
  // leading image cell per row so columns.js renders the image-left / white-text-right banner;
  // otherwise the 2-cell (title | body) contract of the imageless "Featured Products" stays.
  const hasImage = items.some((it) => it.querySelector('.image img, .image picture, picture, img'));
  const cells = items.map((item) => {
    const titleEl = item.querySelector('.image p.h4, p.h4, .h4, .title');
    const bodyEl = item.querySelector('.spt-copy');
    const img = item.querySelector('.image picture, .image img, picture, img');
    const href = item.getAttribute('href') || '';
    const cImg = hasImage ? [img ? img.cloneNode(true) : ''] : null;
    const cTitle = [];
    if (titleEl && titleEl.textContent.trim()) { const h = document.createElement('h3'); h.textContent = titleEl.textContent.trim(); cTitle.push(h); }
    const cBody = [];
    if (bodyEl) bodyEl.querySelectorAll('p').forEach((p) => { if (p.textContent.trim()) cBody.push(p.cloneNode(true)); });
    if (href) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = href; a.textContent = 'Learn More'; p.append(a); cBody.push(p); }
    return cImg ? [cImg, cTitle, cBody] : [cTitle, cBody];
  });
  // Emit `horizontal-teaser` VARIANT + `featured-products` OPTION (two comma-separated tokens →
  // class "columns horizontal-teaser featured-products"), matching the draft + columns.css slate
  // styling. NOT a single `horizontal-teaser-featured` token — columns.js getVariant() looks up the
  // base variant `horizontal-teaser` in its VARIANTS list, so a merged token would fail to decorate
  // (block stays undecorated white text — the ART teaser defect).
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (horizontal-teaser, featured-products)', cells });
  const host = element.closest('.feature-set') || element;

  // Preserve a preceding "Featured" label as an <h2> above the block (source
  // <p class="subhead-large">Featured</p> in .feature-set-section.list). It was being dropped.
  const label = (element.querySelector && element.querySelector('.subhead-large'))
    || (host.querySelector && host.querySelector('.subhead-large'));
  if (label && label.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = label.textContent.trim();
    host.replaceWith(h, block);
  } else {
    host.replaceWith(block);
  }
}
