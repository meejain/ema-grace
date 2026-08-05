/* eslint-disable */
/* global WebImporter */
/**
 * banner-cta -> EDS `Banner (cta)`
 * Source: a .media-callout used as a call-to-action banner (title + copy + CTA link). The
 * .media-callout selector is common, so this parser extracts the ACTUAL page content rather
 * than seeding literal draft text. Receives the .media-callout. Emits title | copy + CTA.
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
  const block = WebImporter.Blocks.createBlock(document, { name: 'Banner (cta)', cells: [[titleCell], [bodyCell]] });
  element.replaceWith(block);
}
