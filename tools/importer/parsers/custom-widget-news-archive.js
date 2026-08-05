/* eslint-disable */
/* global WebImporter */
/**
 * custom-widget-news-archive -> EDS `Custom Widget (news-archive)`
 * Source: .accordion .accordion-comp with dl.plus-minus.accordion per YEAR; dt = year,
 * dd > .col-lg-6 .media-callout (cover img + PDF download link). Receives the .accordion-comp.
 * Emits one row per year: [year, image + download-link(s)].
 */
export default function parse(element, { document }) {
  const dls = Array.from(element.querySelectorAll('dl.accordion, .accordion-comp-list > dl, dl'));
  if (!dls.length) return;
  const cells = dls.map((dl) => {
    const year = (dl.querySelector('dt .h6, dt button, dt') || {}).textContent || '';
    const dd = dl.querySelector('dd');
    const content = [];
    if (dd) {
      dd.querySelectorAll('.media-callout, .col-lg-6, .col-lg-4').forEach((cb) => {
        const img = cb.querySelector('picture, img');
        if (img) content.push(img.cloneNode(true));
        const link = cb.querySelector('a[href]');
        if (link) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = link.getAttribute('href') || '#'; a.textContent = (link.textContent || 'Download').replace(/\s+/g, ' ').trim(); p.append(a); content.push(p); }
      });
      if (!content.length) { dd.querySelectorAll('picture,img,a[href]').forEach((n) => content.push(n.cloneNode(true))); }
    }
    return [[(year || '').trim()], content];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Custom Widget (news-archive)', cells });
  element.replaceWith(block);
}
