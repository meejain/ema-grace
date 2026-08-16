/* eslint-disable */
/* global WebImporter */
/**
 * banner-cta -> EDS `Banner (cta)`
 * Two source shapes:
 *   1. a `.media-callout` used as a CTA banner (title + copy + CTA link) — the flasks-photo banner.
 *   2. a decorative background-image SECTION (`section.none-bkgd.background-image` with a Scene7
 *      geo-hex bg, e.g. e-catalysts "Sample Analysis and Technical Service Portal") holding a
 *      heading + a login/CTA link — white text over the graphic.
 * Emits title | copy + CTA. When the source carries a background-image URL, emits the
 * `bg-ecatalysts` option so blocks/banner/banner.css paints that Scene7 graphic instead of the
 * default flasks photo.
 */
export default function parse(element, { document }) {
  const title = element.querySelector('h2, h3, .h2, .h3, .subhead-large');
  const paras = Array.from(element.querySelectorAll('.text p, .rich-text p, p')).filter((p) => p.textContent.trim());
  const cta = element.querySelector('.button a, a.btn-primary, .cta a, a[href]');
  if (!title && !paras.length) return; // not a CTA banner — leave in place

  const titleCell = [];
  if (title && title.textContent.trim()) { const h = document.createElement('h2'); h.textContent = title.textContent.trim(); titleCell.push(h); }
  const bodyCell = [];
  paras.slice(0, 2).forEach((p) => { if (!cta || !p.contains(cta)) bodyCell.push(p.cloneNode(true)); });
  if (cta) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = cta.getAttribute('href') || '#'; a.textContent = (cta.textContent || 'Learn more').trim(); p.append(a); bodyCell.push(p); }

  // Detect a background-image on the source section (this shape 2) → emit a bg option so the block
  // renders that Scene7 graphic. Recognize the e-catalysts geo-hex banner specifically.
  const bgHost = element.matches('[style*="background-image"]') ? element : element.closest('[style*="background-image"]');
  let name = 'Banner (cta)';
  if (bgHost) {
    const styleAttr = bgHost.getAttribute('style') || '';
    const m = /background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i.exec(styleAttr);
    const bgUrl = m && m[2];
    if (bgUrl && /e-catalysts-banner/i.test(bgUrl)) name = 'Banner (cta, bg-ecatalysts)';
  }

  const block = WebImporter.Blocks.createBlock(document, { name, cells: [[titleCell], [bodyCell]] });
  // Replace the outermost banner section (so its wrapper + inline bg style are removed), else the element.
  const host = bgHost && bgHost.tagName === 'SECTION' ? bgHost : element;
  host.replaceWith(block);
}
