/* eslint-disable */
/* global WebImporter */
/**
 * banner-resource-download -> EDS `Banner (resource-download)`
 * Source: .resource-download-comp — .image <img> + .content .h5(issue) + .h2(title) +
 * .subhead-large p + gated download CTA. Receives the .resource-download-comp.
 * Emits image | (issue + title + desc + download link).
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.image picture, .image img, picture, img');
  const c1 = img ? [img.cloneNode(true)] : [];
  const c2 = [];
  const issue = element.querySelector('.h5');
  if (issue && issue.textContent.trim()) { const p = document.createElement('p'); p.textContent = issue.textContent.trim(); c2.push(p); }
  const title = element.querySelector('.h2, h2, .title');
  if (title && title.textContent.trim()) { const h = document.createElement('h2'); h.textContent = title.textContent.trim(); c2.push(h); }
  element.querySelectorAll('.subhead-large p, .content p, .text p').forEach((p) => { if (p.textContent.trim()) c2.push(p.cloneNode(true)); });
  const cta = element.querySelector('a[href], button[data-gated-id]');
  if (cta) { const p = document.createElement('p'); const a = document.createElement('a'); a.href = cta.getAttribute('href') || '#'; a.textContent = (cta.textContent || 'Download').trim(); p.append(a); c2.push(p); }
  if (!c1.length && !c2.length) return;
  const block = WebImporter.Blocks.createBlock(document, { name: 'Banner (resource-download)', cells: [[c1, c2]] });
  const host = element.closest('.cmp-experiencefragment--resource-download') || element;
  host.replaceWith(block);
}
